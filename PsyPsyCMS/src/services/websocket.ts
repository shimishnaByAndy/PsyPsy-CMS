/**
 * WebSocket service for MCP server communication
 * Connects to CMS Debugger MCP server for real-time console monitoring and error tracking
 */

export interface ConsoleMessage {
  type: 'console'
  level: 'log' | 'warn' | 'error' | 'info' | 'debug'
  message: string
  timestamp: number
  source: string
  stack?: string
}

export interface ErrorMessage {
  type: 'error'
  errorType: 'javascript' | 'react' | 'network' | 'security' | 'resource' | 'tauri'
  message: string
  stack?: string
  componentStack?: string
  timestamp: number
  source: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export interface DevConsoleData {
  id: string
  timestamp: number
  level: string
  message: string
  source: string
  stack?: string
  errorType?: string
}

export type WebSocketMessage = ConsoleMessage | ErrorMessage

export interface WebSocketServiceConfig {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  pingInterval?: number
}

export class WebSocketServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'WebSocketServiceError'
  }
}

/**
 * WebSocket service for real-time communication with MCP debugger server
 */
export class WebSocketService {
  private socket: WebSocket | null = null
  private config: Required<WebSocketServiceConfig>
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isConnecting = false
  private messageQueue: WebSocketMessage[] = []
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private statusListeners: Set<(status: WebSocketStatus) => void> = new Set()

  constructor(config: WebSocketServiceConfig = {}) {
    this.config = {
      url: config.url || 'ws://localhost:9223',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      pingInterval: config.pingInterval || 30000,
    }

    // Auto-connect only if MCP debugger is explicitly enabled
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MCP_DEBUGGER === 'true') {
      this.connect()
    }
  }

  /**
   * Connection status
   */
  get status(): WebSocketStatus {
    if (!this.socket) return 'disconnected'
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'disconnecting'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'disconnected'
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.status === 'connected') {
      return
    }

    try {
      this.isConnecting = true
      this.notifyStatusListeners('connecting')

      this.socket = new WebSocket(this.config.url)

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to MCP debugger server')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.startPing()
        this.processMessageQueue()
        this.notifyStatusListeners('connected')
      }

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error, event.data)
        }
      }

      this.socket.onclose = (event) => {
        console.log(`[WebSocket] Connection closed:`, event.code, event.reason)
        this.isConnecting = false
        this.stopPing()
        this.notifyStatusListeners('disconnected')

        if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error)
        this.isConnecting = false
        this.notifyStatusListeners('disconnected')
      }

    } catch (error) {
      this.isConnecting = false
      this.notifyStatusListeners('disconnected')
      throw new WebSocketServiceError(
        `Failed to connect to WebSocket server: ${error}`,
        'CONNECTION_FAILED'
      )
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopPing()

    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect')
      this.socket = null
    }

    this.notifyStatusListeners('disconnected')
  }

  /**
   * Send message to server
   */
  send(message: WebSocketMessage): void {
    if (this.status === 'connected' && this.socket) {
      try {
        this.socket.send(JSON.stringify(message))
      } catch (error) {
        console.error('[WebSocket] Failed to send message:', error)
        // Queue message for retry
        this.messageQueue.push(message)
      }
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message)
    }
  }

  /**
   * Send console log to MCP server
   */
  sendConsoleLog(level: ConsoleMessage['level'], message: string, source = 'tauri-app'): void {
    const consoleMessage: ConsoleMessage = {
      type: 'console',
      level,
      message,
      timestamp: Date.now(),
      source
    }
    this.send(consoleMessage)
  }

  /**
   * Send error to MCP server
   */
  sendError(
    errorType: ErrorMessage['errorType'],
    message: string,
    stack?: string,
    componentStack?: string,
    severity: ErrorMessage['severity'] = 'medium'
  ): void {
    const errorMessage: ErrorMessage = {
      type: 'error',
      errorType,
      message,
      stack,
      componentStack,
      timestamp: Date.now(),
      source: 'tauri-app',
      severity
    }
    this.send(errorMessage)
  }

  /**
   * Subscribe to messages of specific types
   */
  on(eventType: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(callback)

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback)
    }
  }

  /**
   * Get queued messages count
   */
  getQueuedMessagesCount(): number {
    return this.messageQueue.length
  }

  /**
   * Clear message queue
   */
  clearQueue(): void {
    this.messageQueue.length = 0
  }

  // Private methods

  private handleMessage(message: WebSocketMessage): void {
    // Notify all listeners
    const allListeners = this.listeners.get('*') || new Set()
    allListeners.forEach(callback => callback(message))

    // Notify type-specific listeners
    const typeListeners = this.listeners.get(message.type) || new Set()
    typeListeners.forEach(callback => callback(message))

    // Log received message in development
    if (import.meta.env.DEV) {
      console.log('[WebSocket] Received:', message)
    }
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return

    const messages = [...this.messageQueue]
    this.messageQueue.length = 0

    messages.forEach(message => {
      try {
        this.send(message)
      } catch (error) {
        console.error('[WebSocket] Failed to send queued message:', error)
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    this.reconnectAttempts++
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )

    console.log(`[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnect failed:', error)
      })
    }, delay)
  }

  private startPing(): void {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
        } catch (error) {
          console.error('[WebSocket] Ping failed:', error)
        }
      }
    }, this.config.pingInterval)
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private notifyStatusListeners(status: WebSocketStatus): void {
    this.statusListeners.forEach(callback => {
      try {
        callback(status)
      } catch (error) {
        console.error('[WebSocket] Status listener error:', error)
      }
    })
  }
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected'

// Export singleton instance
export const webSocketService = new WebSocketService()

// Console interception utilities
export const consoleInterceptor = {
  /**
   * Intercept console methods and send to WebSocket
   */
  install(): () => void {
    const originalConsole = { ...console }

    const levels: Array<keyof typeof console> = ['log', 'warn', 'error', 'info', 'debug']

    levels.forEach(level => {
      const originalMethod = originalConsole[level] as (...args: any[]) => void

      ;(console as any)[level] = (...args: any[]) => {
        // Call original method
        originalMethod(...args)

        // Send to WebSocket
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')

        webSocketService.sendConsoleLog(level as ConsoleMessage['level'], message)
      }
    })

    // Return restore function
    return () => {
      levels.forEach(level => {
        ;(console as any)[level] = originalConsole[level]
      })
    }
  }
}

export default webSocketService