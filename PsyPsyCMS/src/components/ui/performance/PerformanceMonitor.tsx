/**
 * PerformanceMonitor - Real-time performance monitoring and optimization
 *
 * Provides comprehensive performance monitoring for healthcare applications
 * including component render times, memory usage, and bundle optimization.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Button,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  Code,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react'
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  Timer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Database,
} from 'lucide-react'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number  // Largest Contentful Paint
  fid?: number  // First Input Delay
  cls?: number  // Cumulative Layout Shift
  fcp?: number  // First Contentful Paint
  ttfb?: number // Time to First Byte

  // Runtime Performance
  componentRenderTime: number
  memoryUsage: {
    used: number
    total: number
    jsHeapSizeLimit: number
  }

  // Bundle Performance
  bundleSize?: {
    main: number
    chunks: Record<string, number>
    total: number
  }

  // Healthcare-specific metrics
  phiRenderTime?: number
  complianceCheckTime?: number
  accessibilityScore?: number

  timestamp: number
}

export interface PerformanceIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  category: 'core-vitals' | 'memory' | 'rendering' | 'bundle' | 'healthcare'
  metric: string
  value: number
  threshold: number
  impact: string
  recommendation: string
}

export interface PerformanceReport {
  score: number
  metrics: PerformanceMetrics
  issues: PerformanceIssue[]
  trends: {
    metric: string
    values: number[]
    timestamps: number[]
    trend: 'improving' | 'degrading' | 'stable'
  }[]
  recommendations: string[]
  timestamp: number
}

export interface PerformanceMonitorProps {
  /**
   * Whether to enable real-time monitoring
   */
  enabled?: boolean

  /**
   * Monitoring interval in milliseconds
   */
  interval?: number

  /**
   * Whether to show the performance UI
   */
  showUI?: boolean

  /**
   * Performance thresholds for alerts
   */
  thresholds?: {
    lcp?: number
    fid?: number
    cls?: number
    memoryUsage?: number
    renderTime?: number
  }

  /**
   * Callback when performance issues are detected
   */
  onIssueDetected?: (issue: PerformanceIssue) => void

  /**
   * Callback for performance reports
   */
  onReport?: (report: PerformanceReport) => void

  /**
   * Whether to enable healthcare-specific monitoring
   */
  healthcareMonitoring?: boolean
}

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []
  private renderStartTimes = new Map<string, number>()

  constructor() {
    this.setupObservers()
  }

  private setupObservers() {
    try {
      // Core Web Vitals Observer
      if ('PerformanceObserver' in window) {
        const vitalsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handleWebVitalsEntry(entry)
          }
        })

        vitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
        this.observers.push(vitalsObserver)

        // Navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handleNavigationEntry(entry as PerformanceNavigationTiming)
          }
        })

        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)

        // Resource timing for bundle analysis
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handleResourceEntry(entry as PerformanceResourceTiming)
          }
        })

        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      }
    } catch (error) {
      console.warn('Performance observers not supported:', error)
    }
  }

  private handleWebVitalsEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.updateMetric('lcp', entry.startTime)
        break
      case 'first-input':
        this.updateMetric('fid', (entry as any).processingStart - entry.startTime)
        break
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.updateMetric('cls', (entry as any).value)
        }
        break
    }
  }

  private handleNavigationEntry(entry: PerformanceNavigationTiming) {
    this.updateMetric('fcp', entry.loadEventEnd - entry.navigationStart)
    this.updateMetric('ttfb', entry.responseStart - entry.requestStart)
  }

  private handleResourceEntry(entry: PerformanceResourceTiming) {
    // Analyze bundle performance
    if (entry.name.includes('.js') || entry.name.includes('.css')) {
      const size = entry.transferSize || entry.encodedBodySize
      if (size > 0) {
        this.analyzeBundleSize(entry.name, size)
      }
    }
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number) {
    const currentMetrics = this.getCurrentMetrics()
    currentMetrics[key] = value
  }

  private analyzeBundleSize(resource: string, size: number) {
    // Implementation for bundle size analysis
    // This would track bundle sizes and identify large chunks
  }

  getCurrentMetrics(): PerformanceMetrics {
    const memoryInfo = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    }

    return {
      componentRenderTime: 0, // Will be updated by component measurements
      memoryUsage: {
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
      },
      timestamp: Date.now(),
    }
  }

  startRender(componentName: string) {
    this.renderStartTimes.set(componentName, performance.now())
  }

  endRender(componentName: string) {
    const startTime = this.renderStartTimes.get(componentName)
    if (startTime) {
      const renderTime = performance.now() - startTime
      this.renderStartTimes.delete(componentName)

      // Update component render time
      const metrics = this.getCurrentMetrics()
      metrics.componentRenderTime = Math.max(metrics.componentRenderTime, renderTime)

      return renderTime
    }
    return 0
  }

  addMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics)

    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  generateReport(): PerformanceReport {
    const currentMetrics = this.getCurrentMetrics()
    const issues = this.analyzeIssues(currentMetrics)
    const trends = this.analyzeTrends()
    const recommendations = this.generateRecommendations(issues)
    const score = this.calculateScore(currentMetrics, issues)

    return {
      score,
      metrics: currentMetrics,
      issues,
      trends,
      recommendations,
      timestamp: Date.now(),
    }
  }

  private analyzeIssues(metrics: PerformanceMetrics): PerformanceIssue[] {
    const issues: PerformanceIssue[] = []

    // LCP threshold (2.5s for good, 4s for poor)
    if (metrics.lcp && metrics.lcp > 2500) {
      issues.push({
        id: 'lcp-slow',
        severity: metrics.lcp > 4000 ? 'critical' : 'warning',
        category: 'core-vitals',
        metric: 'Largest Contentful Paint',
        value: metrics.lcp,
        threshold: 2500,
        impact: 'Poor user experience and SEO ranking',
        recommendation: 'Optimize images, reduce render-blocking resources, improve server response time',
      })
    }

    // FID threshold (100ms for good, 300ms for poor)
    if (metrics.fid && metrics.fid > 100) {
      issues.push({
        id: 'fid-slow',
        severity: metrics.fid > 300 ? 'critical' : 'warning',
        category: 'core-vitals',
        metric: 'First Input Delay',
        value: metrics.fid,
        threshold: 100,
        impact: 'Delayed user interactions',
        recommendation: 'Reduce JavaScript execution time, split large tasks, use web workers',
      })
    }

    // CLS threshold (0.1 for good, 0.25 for poor)
    if (metrics.cls && metrics.cls > 0.1) {
      issues.push({
        id: 'cls-high',
        severity: metrics.cls > 0.25 ? 'critical' : 'warning',
        category: 'core-vitals',
        metric: 'Cumulative Layout Shift',
        value: metrics.cls,
        threshold: 0.1,
        impact: 'Unexpected layout shifts affecting user experience',
        recommendation: 'Set size attributes for images, reserve space for dynamic content',
      })
    }

    // Memory usage (threshold at 80% of limit)
    const memoryUsagePercent = (metrics.memoryUsage.used / metrics.memoryUsage.jsHeapSizeLimit) * 100
    if (memoryUsagePercent > 80) {
      issues.push({
        id: 'memory-high',
        severity: memoryUsagePercent > 90 ? 'critical' : 'warning',
        category: 'memory',
        metric: 'Memory Usage',
        value: memoryUsagePercent,
        threshold: 80,
        impact: 'Risk of memory leaks and application crashes',
        recommendation: 'Check for memory leaks, optimize component lifecycle, reduce object retention',
      })
    }

    // Component render time (threshold at 16ms for 60fps)
    if (metrics.componentRenderTime > 16) {
      issues.push({
        id: 'render-slow',
        severity: metrics.componentRenderTime > 50 ? 'critical' : 'warning',
        category: 'rendering',
        metric: 'Component Render Time',
        value: metrics.componentRenderTime,
        threshold: 16,
        impact: 'Janky animations and poor responsiveness',
        recommendation: 'Optimize render logic, use React.memo, implement virtualization',
      })
    }

    return issues
  }

  private analyzeTrends(): PerformanceReport['trends'] {
    // Analyze performance trends over time
    const trends: PerformanceReport['trends'] = []

    if (this.metrics.length >= 5) {
      const recentMetrics = this.metrics.slice(-10)

      // LCP trend
      const lcpValues = recentMetrics.map(m => m.lcp || 0).filter(v => v > 0)
      if (lcpValues.length > 0) {
        trends.push({
          metric: 'LCP',
          values: lcpValues,
          timestamps: recentMetrics.map(m => m.timestamp),
          trend: this.calculateTrend(lcpValues),
        })
      }

      // Memory trend
      const memoryValues = recentMetrics.map(m => m.memoryUsage.used)
      trends.push({
        metric: 'Memory Usage',
        values: memoryValues,
        timestamps: recentMetrics.map(m => m.timestamp),
        trend: this.calculateTrend(memoryValues),
      })

      // Render time trend
      const renderValues = recentMetrics.map(m => m.componentRenderTime)
      trends.push({
        metric: 'Render Time',
        values: renderValues,
        timestamps: recentMetrics.map(m => m.timestamp),
        trend: this.calculateTrend(renderValues),
      })
    }

    return trends
  }

  private calculateTrend(values: number[]): 'improving' | 'degrading' | 'stable' {
    if (values.length < 3) return 'stable'

    const recent = values.slice(-3)
    const older = values.slice(0, -3)

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

    const change = (recentAvg - olderAvg) / olderAvg

    if (change > 0.1) return 'degrading'
    if (change < -0.1) return 'improving'
    return 'stable'
  }

  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations = new Set<string>()

    issues.forEach(issue => {
      recommendations.add(issue.recommendation)
    })

    // Add general healthcare-specific recommendations
    recommendations.add('Implement lazy loading for large medical datasets')
    recommendations.add('Use virtualization for patient lists and appointment schedules')
    recommendations.add('Optimize PHI data rendering with efficient masking')
    recommendations.add('Cache compliance validation results')

    return Array.from(recommendations)
  }

  private calculateScore(metrics: PerformanceMetrics, issues: PerformanceIssue[]): number {
    let score = 100

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20
          break
        case 'warning':
          score -= 10
          break
        case 'info':
          score -= 5
          break
      }
    })

    return Math.max(0, score)
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
    this.renderStartTimes.clear()
  }
}

// =============================================================================
// PERFORMANCE HOOK
// =============================================================================

export function usePerformanceMonitoring({
  enabled = true,
  interval = 5000,
  thresholds = {},
  onIssueDetected,
  onReport,
  healthcareMonitoring = true,
}: Omit<PerformanceMonitorProps, 'showUI'> = {}) {
  const trackerRef = useRef<PerformanceTracker>()
  const [currentReport, setCurrentReport] = useState<PerformanceReport | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(enabled)

  // Initialize tracker
  useEffect(() => {
    if (enabled) {
      trackerRef.current = new PerformanceTracker()
    }

    return () => {
      trackerRef.current?.destroy()
    }
  }, [enabled])

  // Start monitoring interval
  useEffect(() => {
    if (!isMonitoring || !trackerRef.current) return

    const intervalId = setInterval(() => {
      const report = trackerRef.current!.generateReport()
      setCurrentReport(report)
      onReport?.(report)

      // Check for new issues
      report.issues.forEach(issue => {
        onIssueDetected?.(issue)
      })
    }, interval)

    return () => clearInterval(intervalId)
  }, [isMonitoring, interval, onReport, onIssueDetected])

  const startRender = useCallback((componentName: string) => {
    trackerRef.current?.startRender(componentName)
  }, [])

  const endRender = useCallback((componentName: string) => {
    return trackerRef.current?.endRender(componentName) || 0
  }, [])

  const generateReport = useCallback(() => {
    return trackerRef.current?.generateReport() || null
  }, [])

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev)
  }, [])

  return {
    currentReport,
    isMonitoring,
    startRender,
    endRender,
    generateReport,
    toggleMonitoring,
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PerformanceMonitor({
  enabled = true,
  interval = 5000,
  showUI = true,
  thresholds = {},
  onIssueDetected,
  onReport,
  healthcareMonitoring = true,
}: PerformanceMonitorProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const {
    currentReport,
    isMonitoring,
    generateReport,
    toggleMonitoring,
  } = usePerformanceMonitoring({
    enabled,
    interval,
    thresholds,
    onIssueDetected,
    onReport,
    healthcareMonitoring,
  })

  const exportReport = useCallback(() => {
    if (!currentReport) return

    const reportData = {
      ...currentReport,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [currentReport])

  const formatBytes = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const formatMs = useCallback((ms: number) => {
    return `${ms.toFixed(2)}ms`
  }, [])

  if (!showUI) return null

  return (
    <>
      {/* Performance Badge */}
      <Button
        variant="flat"
        size="sm"
        startContent={<Activity className="h-4 w-4" />}
        color={currentReport?.score ?
               currentReport.score >= 80 ? 'success' :
               currentReport.score >= 60 ? 'warning' : 'danger' : 'default'}
        onPress={onOpen}
        className="fixed bottom-4 right-4 z-50"
      >
        {currentReport?.score || '--'}
      </Button>

      {/* Performance Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5" />
                <div>
                  <h3 className="text-lg font-semibold">Performance Monitor</h3>
                  <p className="text-sm text-default-600 font-normal">
                    Real-time performance metrics and optimization insights
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Chip
                  color={isMonitoring ? 'success' : 'default'}
                  variant="flat"
                  size="sm"
                >
                  {isMonitoring ? 'Active' : 'Paused'}
                </Chip>

                <Button
                  size="sm"
                  variant="flat"
                  onPress={toggleMonitoring}
                  startContent={isMonitoring ? <Eye className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
                >
                  {isMonitoring ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            {currentReport ? (
              <div className="space-y-6">
                {/* Performance Score */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-medium font-semibold">Performance Score</h4>
                      <Chip
                        color={currentReport.score >= 80 ? 'success' :
                               currentReport.score >= 60 ? 'warning' : 'danger'}
                        variant="flat"
                      >
                        {currentReport.score}/100
                      </Chip>
                    </div>

                    <Progress
                      value={currentReport.score}
                      color={currentReport.score >= 80 ? 'success' :
                             currentReport.score >= 60 ? 'warning' : 'danger'}
                      className="w-full"
                    />
                  </CardBody>
                </Card>

                {/* Core Web Vitals */}
                <Card>
                  <CardHeader>
                    <h4 className="text-medium font-semibold">Core Web Vitals</h4>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {currentReport.metrics.lcp ? formatMs(currentReport.metrics.lcp) : '--'}
                        </div>
                        <div className="text-sm text-default-600">LCP</div>
                        <div className="text-xs text-default-500">Largest Contentful Paint</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">
                          {currentReport.metrics.fid ? formatMs(currentReport.metrics.fid) : '--'}
                        </div>
                        <div className="text-sm text-default-600">FID</div>
                        <div className="text-xs text-default-500">First Input Delay</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-warning">
                          {currentReport.metrics.cls ? currentReport.metrics.cls.toFixed(3) : '--'}
                        </div>
                        <div className="text-sm text-default-600">CLS</div>
                        <div className="text-xs text-default-500">Cumulative Layout Shift</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Runtime Metrics */}
                <Card>
                  <CardHeader>
                    <h4 className="text-medium font-semibold">Runtime Performance</h4>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Memory Usage</span>
                          <span className="text-sm text-default-600">
                            {formatBytes(currentReport.metrics.memoryUsage.used)} / {formatBytes(currentReport.metrics.memoryUsage.jsHeapSizeLimit)}
                          </span>
                        </div>
                        <Progress
                          value={(currentReport.metrics.memoryUsage.used / currentReport.metrics.memoryUsage.jsHeapSizeLimit) * 100}
                          color={(currentReport.metrics.memoryUsage.used / currentReport.metrics.memoryUsage.jsHeapSizeLimit) * 100 > 80 ? 'danger' : 'success'}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Render Time</span>
                          <span className="text-sm text-default-600">
                            {formatMs(currentReport.metrics.componentRenderTime)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(currentReport.metrics.componentRenderTime / 16 * 100, 100)}
                          color={currentReport.metrics.componentRenderTime > 16 ? 'danger' : 'success'}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Performance Issues */}
                {currentReport.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h4 className="text-medium font-semibold">Performance Issues</h4>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-3">
                        {currentReport.issues.map((issue, index) => (
                          <div
                            key={issue.id}
                            className="flex items-start gap-3 p-3 rounded-lg border"
                          >
                            {issue.severity === 'critical' ? (
                              <AlertTriangle className="h-5 w-5 text-danger mt-0.5" />
                            ) : issue.severity === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{issue.metric}</span>
                                <Chip size="sm" variant="flat" color="default">
                                  {issue.category}
                                </Chip>
                              </div>
                              <p className="text-sm text-default-600 mb-2">{issue.impact}</p>
                              <p className="text-sm text-primary">{issue.recommendation}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">
                                {typeof issue.value === 'number' ?
                                  (issue.metric.includes('Time') ? formatMs(issue.value) :
                                   issue.metric.includes('Memory') ? `${issue.value.toFixed(1)}%` :
                                   issue.value.toFixed(2)) : issue.value}
                              </div>
                              <div className="text-xs text-default-500">
                                Target: &lt; {typeof issue.threshold === 'number' ?
                                  (issue.metric.includes('Time') ? formatMs(issue.threshold) :
                                   issue.metric.includes('Memory') ? `${issue.threshold}%` :
                                   issue.threshold) : issue.threshold}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Recommendations */}
                {currentReport.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h4 className="text-medium font-semibold">Optimization Recommendations</h4>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-2">
                        {currentReport.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-default-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-default-600 mb-2">
                  Performance Monitoring
                </h4>
                <p className="text-sm text-default-500 mb-4">
                  Collecting performance metrics...
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => generateReport()}
              startContent={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
            {currentReport && (
              <Button
                color="primary"
                onPress={exportReport}
                startContent={<Download className="h-4 w-4" />}
              >
                Export Report
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PerformanceMonitor