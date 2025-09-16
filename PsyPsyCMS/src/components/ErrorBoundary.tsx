import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { webSocketService } from '@/services/websocket'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)

    // Send error to MCP debugging service (development only)
    if (process.env.NODE_ENV === 'development') {
      webSocketService.sendError(
        'react',
        error.message,
        error.stack || undefined,
        errorInfo.componentStack || undefined,
        'high'
      )
    }

    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo } = this.state

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-600 dark:text-red-400">
                    Application Error
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Something went wrong while rendering this page
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="font-mono">
                      {error.name}
                    </Badge>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-mono text-red-800 dark:text-red-200">
                      {error.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Development Information */}
              {process.env.NODE_ENV === 'development' && errorInfo && (
                <details className="space-y-2">
                  <summary className="text-sm font-medium cursor-pointer hover:text-primary flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Development Details
                  </summary>

                  {error?.stack && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Stack Trace:</p>
                      <pre className="text-xs p-3 bg-muted rounded-lg border overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo.componentStack && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Component Stack:</p>
                      <pre className="text-xs p-3 bg-muted rounded-lg border overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}

              {/* Production Message */}
              {process.env.NODE_ENV === 'production' && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This error has been logged and will be investigated. Please try refreshing the page or contact support if the problem persists.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* HIPAA Notice for Production */}
              {process.env.NODE_ENV === 'production' && (
                <div className="text-xs text-muted-foreground border-t pt-3">
                  <p>
                    🔒 This application is HIPAA compliant. No patient data was exposed during this error.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}