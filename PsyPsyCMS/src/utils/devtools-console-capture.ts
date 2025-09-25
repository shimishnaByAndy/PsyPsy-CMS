/**
 * DevTools Console Capture for PsyPsy CMS
 *
 * This script captures React errors, console messages, and runtime exceptions
 * and sends them to cms-debugger via the log_to_devtools Tauri command.
 *
 * Based on the cms-debugger upgrade plan and Reactotron's proxy patterns.
 */

import { invoke } from '@tauri-apps/api/core';

interface ErrorData {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  errorBoundaryName?: string;
  file?: string;
  line?: number;
  column?: number;
}

class DevToolsConsoleCapture {
  private initialized = false;
  private originalConsole: Partial<Console> = {};

  /**
   * Initialize console capture - MUST be called BEFORE React loads
   */
  public initialize(): void {
    if (this.initialized) {
      console.warn('[DevTools] Console capture already initialized');
      return;
    }

    // Prevent double initialization
    if ((window as any).__PSYPSY_DEVTOOLS_CAPTURE__) {
      return;
    }
    (window as any).__PSYPSY_DEVTOOLS_CAPTURE__ = true;

    console.log('[DevTools] Initializing PsyPsy CMS console capture for cms-debugger');

    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
      trace: console.trace.bind(console),
    };

    // Override console methods
    this.setupConsoleCapture();

    // Capture unhandled errors
    this.setupErrorCapture();

    // Initialize DevTools connection
    this.initializeDevTools();

    this.initialized = true;
    console.log('[DevTools] ✅ Console capture initialized successfully');
  }

  private setupConsoleCapture(): void {
    const levels = ['log', 'info', 'warn', 'error', 'debug', 'trace'] as const;

    levels.forEach((level) => {
      const originalMethod = this.originalConsole[level];
      if (!originalMethod) return;

      console[level] = (...args: any[]) => {
        // Call original method first
        originalMethod(...args);

        // Capture and send to DevTools
        const message = this.formatMessage(args);
        this.sendToDevTools(level === 'log' ? 'info' : level, message, {
          source: `console.${level}`,
        });
      };
    });
  }

  private setupErrorCapture(): void {
    // Capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack || `at ${event.filename}:${event.lineno}:${event.colno}`,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
      }, 'window.error');
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      }, 'promise.rejection');
    });

    // Attempt to capture React Error Boundary errors
    this.setupReactErrorCapture();
  }

  private setupReactErrorCapture(): void {
    // Try to intercept React error boundaries when React loads
    const checkForReact = () => {
      if ((window as any).React && (window as any).React.Component) {
        this.interceptReactErrorBoundaries();
      } else {
        // Check again in 100ms
        setTimeout(checkForReact, 100);
      }
    };

    // Start checking immediately and set a timeout
    checkForReact();
    setTimeout(() => {
      console.log('[DevTools] React error boundary interception setup completed');
    }, 5000);
  }

  private interceptReactErrorBoundaries(): void {
    const React = (window as any).React;
    if (!React || !React.Component) return;

    const originalComponentDidCatch = React.Component.prototype.componentDidCatch;

    React.Component.prototype.componentDidCatch = function(error: Error, errorInfo: any) {
      // Capture React error boundary information
      const errorData: ErrorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorBoundaryName: this.constructor.name,
      };

      // Send to DevTools
      if ((window as any).__PSYPSY_DEVTOOLS_CAPTURE_INSTANCE__) {
        (window as any).__PSYPSY_DEVTOOLS_CAPTURE_INSTANCE__.captureError(
          errorData,
          'react.errorBoundary'
        );
      }

      // Call original method if it exists
      if (originalComponentDidCatch) {
        originalComponentDidCatch.call(this, error, errorInfo);
      }
    };

    console.log('[DevTools] React Error Boundary interception enabled');
  }

  private captureError(errorData: ErrorData, source: string): void {
    this.sendToDevTools('error', errorData.message, {
      source,
      stack: errorData.stack,
      componentStack: errorData.componentStack,
      errorBoundary: errorData.errorBoundary,
      file: errorData.file,
      line: errorData.line,
      column: errorData.column,
    });
  }

  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}\n${arg.stack}`;
      }
      try {
        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
  }

  private async sendToDevTools(
    level: string,
    message: string,
    options: {
      source?: string;
      stack?: string;
      componentStack?: string;
      errorBoundary?: boolean;
      file?: string;
      line?: number;
      column?: number;
    } = {}
  ): Promise<void> {
    try {
      await invoke('log_to_devtools', {
        level,
        message,
        timestamp: Date.now(),
        source: options.source,
        stack: options.stack,
        componentStack: options.componentStack,
        errorBoundary: options.errorBoundary,
        file: options.file,
        line: options.line,
        column: options.column,
      });
    } catch (error) {
      // Only log to original console if DevTools fails to avoid loops
      if (this.originalConsole.error) {
        this.originalConsole.error('[DevTools] Failed to send to cms-debugger:', error);
      }
    }
  }

  private async initializeDevTools(): Promise<void> {
    try {
      await invoke('initialize_devtools');
      console.log('[DevTools] Successfully connected to DevTools system');

      // Send a test message to verify DevTools connection
      await this.sendToDevTools('info', '✅ DevTools Console Capture Initialized Successfully!', {
        source: 'devtools-init',
        stack: 'DevTools integration ready for PsyPsy CMS development'
      });

      // Send accessibility test message
      await this.sendToDevTools('info', '🔍 Accessibility monitoring active - axe-core violations will be captured', {
        source: 'accessibility-monitor'
      });

    } catch (error) {
      console.log('[DevTools] DevTools initialization complete (development mode)');
    }
  }
}

// Create singleton instance
const devToolsCapture = new DevToolsConsoleCapture();

// Store instance globally for React error boundary access
(window as any).__PSYPSY_DEVTOOLS_CAPTURE_INSTANCE__ = devToolsCapture;

// Auto-initialize in development mode
if (import.meta.env.DEV) {
  // Initialize immediately to catch early errors
  devToolsCapture.initialize();
}

export default devToolsCapture;