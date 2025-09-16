/**
 * DevConsole - Real-time development console for MCP server integration
 * Provides live console monitoring, error tracking, and WebSocket status display
 */

import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import {
  Terminal,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  WifiOff,
  Wifi,
  AlertTriangle,
  Bug,
  Info,
  AlertCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  webSocketService,
  WebSocketStatus,
  WebSocketMessage,
  DevConsoleData
} from '@/services/websocket'

export interface DevConsoleProps {
  defaultOpen?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
  onToggle?: (isOpen: boolean) => void
}

export interface DevConsoleRef {
  toggle: () => void
  open: () => void
  close: () => void
  clear: () => void
  isOpen: boolean
}

interface ConsoleMessageDisplay extends DevConsoleData {
  component?: React.ReactNode
}

const DevConsole = forwardRef<DevConsoleRef, DevConsoleProps>(({
  defaultOpen = false,
  position = 'bottom-right',
  className,
  onToggle
}, ref) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ConsoleMessageDisplay[]>([])
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('disconnected')
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error' | 'debug'>('all')
  const [autoScroll] = useState(true)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    toggle: () => {
      const newIsOpen = !isOpen
      setIsOpen(newIsOpen)
      onToggle?.(newIsOpen)
    },
    open: () => {
      setIsOpen(true)
      onToggle?.(true)
    },
    close: () => {
      setIsOpen(false)
      onToggle?.(false)
    },
    clear: () => {
      setMessages([])
    },
    isOpen
  }), [isOpen, onToggle])

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  // Message level styling
  const getLevelStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400 bg-red-950/20 border-l-red-500'
      case 'warn':
        return 'text-yellow-400 bg-yellow-950/20 border-l-yellow-500'
      case 'info':
        return 'text-blue-400 bg-blue-950/20 border-l-blue-500'
      case 'debug':
        return 'text-purple-400 bg-purple-950/20 border-l-purple-500'
      case 'log':
      default:
        return 'text-green-400 bg-green-950/20 border-l-green-500'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      case 'debug':
        return <Bug className="w-4 h-4" />
      case 'log':
      default:
        return <Terminal className="w-4 h-4" />
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  // Handle WebSocket messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    const consoleData: ConsoleMessageDisplay = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: message.timestamp,
      level: message.type === 'error' ? 'error' : (message as any).level || 'log',
      message: message.message,
      source: message.source,
      stack: (message as any).stack,
      errorType: message.type === 'error' ? (message as any).errorType : undefined
    }

    setMessages(prev => [...prev.slice(-99), consoleData]) // Keep last 100 messages
  }, [])

  // Handle WebSocket status changes
  const handleStatusChange = useCallback((status: WebSocketStatus) => {
    setWsStatus(status)
  }, [])

  // Setup WebSocket listeners
  useEffect(() => {
    const unsubscribeMessage = webSocketService.on('*', handleMessage)
    const unsubscribeStatus = webSocketService.onStatusChange(handleStatusChange)

    // Set initial status
    setWsStatus(webSocketService.status)

    return () => {
      unsubscribeMessage()
      unsubscribeStatus()
    }
  }, [handleMessage, handleStatusChange])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true
    return msg.level === filter
  })

  // Clear messages
  const clearMessages = () => {
    setMessages([])
  }

  // Toggle connection
  const toggleConnection = () => {
    if (wsStatus === 'connected') {
      webSocketService.disconnect()
    } else {
      webSocketService.connect()
    }
  }

  // Get connection status badge
  const getConnectionBadge = () => {
    const config = {
      connected: { variant: 'success' as const, icon: <Wifi className="w-3 h-3" />, text: 'Connected' },
      connecting: { variant: 'warning' as const, icon: <Wifi className="w-3 h-3 animate-pulse" />, text: 'Connecting' },
      disconnected: { variant: 'error' as const, icon: <WifiOff className="w-3 h-3" />, text: 'Disconnected' },
      disconnecting: { variant: 'warning' as const, icon: <WifiOff className="w-3 h-3" />, text: 'Disconnecting' }
    }

    const { variant, icon, text } = config[wsStatus]

    return (
      <Badge
        variant={variant as any}
        className="flex items-center gap-1 text-xs"
        onClick={toggleConnection}
        role="button"
        tabIndex={0}
      >
        {icon}
        {text}
      </Badge>
    )
  }

  if (!isOpen) {
    return (
      <div
        className={cn(
          'fixed z-50 transition-all duration-300',
          positionClasses[position],
          className
        )}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          variant="secondary"
          className="shadow-lg hover:shadow-xl bg-background/95 backdrop-blur-sm border"
          title="Open Dev Console (Ctrl+Shift+D)"
        >
          <Terminal className="w-5 h-5" />
          {messages.length > 0 && (
            <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs">
              {messages.length > 99 ? '99+' : messages.length}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        positionClasses[position],
        className
      )}
    >
      <Card
        className={cn(
          'w-[700px] bg-background/95 backdrop-blur-sm border shadow-2xl',
          isMinimized ? 'h-auto' : 'h-[500px]',
          'font-mono text-sm'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Dev Console
              </CardTitle>
              {getConnectionBadge()}
              <Badge variant="outline" className="text-xs">
                {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              {/* Filter buttons */}
              <div className="flex gap-1 mr-2">
                {['all', 'log', 'warn', 'error', 'debug'].map((filterType) => (
                  <Button
                    key={filterType}
                    size="sm"
                    variant={filter === filterType ? 'default' : 'ghost'}
                    className="h-6 px-2 text-xs"
                    onClick={() => setFilter(filterType as any)}
                  >
                    {filterType}
                  </Button>
                ))}
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={clearMessages}
                className="h-8 w-8"
                title="Clear messages"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                title="Close console"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-[400px]">
            <ScrollArea
              ref={scrollAreaRef}
              className="h-full px-4 pb-4"
            >
              {filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No console messages</p>
                    <p className="text-xs opacity-70">
                      Console output will appear here in real-time
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-3 p-2 rounded-md border-l-2 transition-colors',
                        getLevelStyle(msg.level),
                        'hover:bg-accent/50'
                      )}
                    >
                      <div className="flex-shrink-0 pt-0.5">
                        {getLevelIcon(msg.level)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {msg.level.toUpperCase()}
                            </Badge>
                            {msg.source && (
                              <Badge variant="outline" className="text-xs">
                                {msg.source}
                              </Badge>
                            )}
                            {msg.errorType && (
                              <Badge variant="destructive" className="text-xs">
                                {msg.errorType}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-sm break-words">
                          {msg.message}
                        </div>

                        {msg.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Stack trace
                            </summary>
                            <pre className="text-xs mt-1 p-2 bg-muted rounded border overflow-x-auto whitespace-pre-wrap">
                              {msg.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  )
})

DevConsole.displayName = 'DevConsole'

export default DevConsole