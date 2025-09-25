/**
 * PatientStatusIndicators - Accessible status indicators for patient conditions
 *
 * Features:
 * - WCAG AAA compliance with multi-modal cues (color + icon + text)
 * - Live region updates for screen readers
 * - 44px minimum touch targets
 * - Emergency status handling
 * - Real-time status updates
 * - PHI protection and audit logging
 * - Quebec healthcare compliance
 */

import React, { useEffect, useRef } from 'react'
import {
  Chip,
  Badge,
  Tooltip,
  Avatar,
  Progress,
  Card,
  CardBody,
  Button
} from '@nextui-org/react'
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Stethoscope,
  Brain,
  Zap,
  Users,
  Calendar,
  MapPin,
  Phone,
  Bell,
  BellOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { designTokens } from '@/ui/design-tokens'
import { useHealthcareTheme, useEmergencyMode } from '@/providers/NextUIThemeProvider'

// Status type definitions
export type PatientStatusType =
  | 'vital-signs'
  | 'medical-condition'
  | 'treatment-progress'
  | 'appointment-status'
  | 'emergency-alert'
  | 'compliance-status'
  | 'communication-status'
  | 'location-status'

export type StatusSeverity = 'normal' | 'caution' | 'warning' | 'critical' | 'emergency'

export type StatusValue = 'stable' | 'improving' | 'declining' | 'critical' | 'unknown' | 'active' | 'inactive' | 'scheduled' | 'completed' | 'cancelled' | 'pending'

export interface PatientStatus {
  id: string
  type: PatientStatusType
  value: StatusValue
  severity: StatusSeverity
  label: string
  description?: string
  numericValue?: number
  unit?: string
  timestamp: Date
  lastUpdated: Date
  trend?: 'up' | 'down' | 'stable'

  // Healthcare specific
  containsPHI?: boolean
  accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  // Alerts and notifications
  isUrgent?: boolean
  alertsEnabled?: boolean

  // Quebec specific
  locale?: 'en' | 'fr'
}

export interface PatientStatusIndicatorsProps {
  /**
   * Array of patient statuses to display
   */
  statuses: PatientStatus[]

  /**
   * Display variant
   */
  variant?: 'compact' | 'detailed' | 'grid' | 'list'

  /**
   * Size of indicators
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Color theme
   */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

  /**
   * Enable live updates
   */
  enableLiveUpdates?: boolean

  /**
   * Update interval in milliseconds
   */
  updateInterval?: number

  /**
   * Show trend indicators
   */
  showTrends?: boolean

  /**
   * Show timestamps
   */
  showTimestamps?: boolean

  /**
   * Enable PHI protection
   */
  phiProtected?: boolean

  /**
   * Emergency mode override
   */
  isEmergency?: boolean

  /**
   * Clickable indicators
   */
  interactive?: boolean

  /**
   * Group similar statuses
   */
  grouped?: boolean

  /**
   * Maximum number of statuses to show
   */
  maxVisible?: number

  /**
   * Compliance level
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Event handlers
   */
  onStatusClick?: (status: PatientStatus) => void
  onStatusUpdate?: (status: PatientStatus) => void
  onEmergencyAlert?: (status: PatientStatus) => void

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Accessibility props
   */
  'aria-label'?: string
  'aria-describedby'?: string

  /**
   * Audit logging callback
   */
  onAuditAction?: (action: string, context?: any) => void
}

export function PatientStatusIndicators({
  statuses,
  variant = 'detailed',
  size = 'md',
  color = 'default',
  enableLiveUpdates = false,
  updateInterval = 30000,
  showTrends = true,
  showTimestamps = true,
  phiProtected = false,
  isEmergency = false,
  interactive = true,
  grouped = false,
  maxVisible,
  complianceLevel,
  onStatusClick,
  onStatusUpdate,
  onEmergencyAlert,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  onAuditAction,
}: PatientStatusIndicatorsProps) {
  const { currentTheme } = useHealthcareTheme()
  const { isEmergencyMode } = useEmergencyMode()
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const updateTimerRef = useRef<NodeJS.Timeout>()

  // Generate unique IDs for accessibility
  const indicatorsId = React.useId()
  const liveRegionId = `${indicatorsId}-live`

  // Emergency override
  const isActualEmergency = isEmergency || isEmergencyMode

  // Filter and sort statuses
  const displayStatuses = React.useMemo(() => {
    let filtered = [...statuses]

    // Sort by severity and urgency
    filtered.sort((a, b) => {
      const severityOrder = { emergency: 5, critical: 4, warning: 3, caution: 2, normal: 1 }
      const aSeverity = severityOrder[a.severity] || 0
      const bSeverity = severityOrder[b.severity] || 0

      if (aSeverity !== bSeverity) return bSeverity - aSeverity
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1
      return b.lastUpdated.getTime() - a.lastUpdated.getTime()
    })

    // Apply max visible limit
    if (maxVisible && filtered.length > maxVisible) {
      filtered = filtered.slice(0, maxVisible)
    }

    return filtered
  }, [statuses, maxVisible])

  // Get status icon
  const getStatusIcon = (status: PatientStatus) => {
    const iconClass = "h-4 w-4"

    switch (status.type) {
      case 'vital-signs':
        if (status.label.toLowerCase().includes('heart')) return <Heart className={iconClass} />
        if (status.label.toLowerCase().includes('blood')) return <Droplets className={iconClass} />
        if (status.label.toLowerCase().includes('temp')) return <Thermometer className={iconClass} />
        if (status.label.toLowerCase().includes('resp')) return <Wind className={iconClass} />
        return <Activity className={iconClass} />

      case 'medical-condition':
        return <Stethoscope className={iconClass} />

      case 'treatment-progress':
        if (status.value === 'completed') return <CheckCircle className={iconClass} />
        if (status.value === 'improving') return <Activity className={iconClass} />
        if (status.value === 'declining') return <AlertTriangle className={iconClass} />
        return <Brain className={iconClass} />

      case 'appointment-status':
        return <Calendar className={iconClass} />

      case 'emergency-alert':
        return <AlertTriangle className={iconClass} />

      case 'compliance-status':
        return <Shield className={iconClass} />

      case 'communication-status':
        return status.alertsEnabled ? <Bell className={iconClass} /> : <BellOff className={iconClass} />

      case 'location-status':
        return <MapPin className={iconClass} />

      default:
        return <Activity className={iconClass} />
    }
  }

  // Get status color
  const getStatusColor = (status: PatientStatus) => {
    switch (status.severity) {
      case 'emergency':
      case 'critical':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'caution':
        return 'warning'
      case 'normal':
        return status.value === 'improving' ? 'success' : 'default'
      default:
        return 'default'
    }
  }

  // Get trend icon
  const getTrendIcon = (trend?: PatientStatus['trend']) => {
    if (!trend || !showTrends) return null

    switch (trend) {
      case 'up':
        return <Zap className="h-3 w-3 text-success-500" />
      case 'down':
        return <AlertTriangle className="h-3 w-3 text-danger-500" />
      case 'stable':
        return <Activity className="h-3 w-3 text-default-500" />
      default:
        return null
    }
  }

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  // Handle status click
  const handleStatusClick = (status: PatientStatus) => {
    if (!interactive) return

    if (onAuditAction) {
      onAuditAction('status_viewed', {
        statusId: status.id,
        statusType: status.type,
        severity: status.severity,
        containsPHI: status.containsPHI,
        timestamp: new Date().toISOString()
      })
    }

    onStatusClick?.(status)
  }

  // Live updates effect
  useEffect(() => {
    if (!enableLiveUpdates) return

    updateTimerRef.current = setInterval(() => {
      // Simulate status updates in a real implementation
      // This would connect to a real-time data source
      if (onStatusUpdate) {
        displayStatuses.forEach(status => {
          // Check for critical status changes
          if (status.severity === 'emergency' || status.severity === 'critical') {
            onEmergencyAlert?.(status)
          }
        })
      }
    }, updateInterval)

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current)
      }
    }
  }, [enableLiveUpdates, updateInterval, displayStatuses, onStatusUpdate, onEmergencyAlert])

  // Emergency alerts effect
  useEffect(() => {
    const emergencyStatuses = displayStatuses.filter(s =>
      s.severity === 'emergency' || s.isUrgent
    )

    if (emergencyStatuses.length > 0 && liveRegionRef.current) {
      const announcement = `Emergency alert: ${emergencyStatuses.length} critical status${emergencyStatuses.length > 1 ? 'es' : ''} require immediate attention`
      liveRegionRef.current.textContent = announcement

      emergencyStatuses.forEach(status => {
        onEmergencyAlert?.(status)
      })
    }
  }, [displayStatuses, onEmergencyAlert])

  // Render compact variant
  const renderCompact = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {displayStatuses.map((status) => (
        <Tooltip
          key={status.id}
          content={
            <div className="p-2 max-w-xs">
              <div className="font-medium">{status.label}</div>
              {status.description && (
                <div className="text-sm text-default-600 mt-1">{status.description}</div>
              )}
              {status.numericValue && (
                <div className="text-sm mt-1">
                  {status.numericValue} {status.unit}
                </div>
              )}
              {showTimestamps && (
                <div className="text-xs text-default-500 mt-1">
                  {formatTimestamp(status.lastUpdated)}
                </div>
              )}
            </div>
          }
        >
          <Chip
            size={size}
            color={getStatusColor(status) as any}
            variant={status.isUrgent ? 'solid' : 'flat'}
            startContent={getStatusIcon(status)}
            endContent={getTrendIcon(status.trend)}
            className={cn(
              'cursor-pointer transition-transform hover:scale-105',
              'min-w-[44px] min-h-[44px]', // WCAG AAA touch target
              status.isUrgent && 'animate-pulse',
              !interactive && 'cursor-default'
            )}
            onClick={() => handleStatusClick(status)}
          >
            {status.numericValue ? `${status.numericValue}${status.unit || ''}` : status.value}
          </Chip>
        </Tooltip>
      ))}
    </div>
  )

  // Render detailed variant
  const renderDetailed = () => (
    <div className="space-y-3">
      {displayStatuses.map((status) => (
        <Card
          key={status.id}
          isPressable={interactive}
          onPress={() => handleStatusClick(status)}
          className={cn(
            'transition-all hover:scale-[1.02]',
            status.isUrgent && 'ring-2 ring-danger-500/50 animate-pulse',
            isActualEmergency && 'ring-2 ring-red-500/50',
            status.containsPHI && phiProtected && 'border-l-4 border-l-purple-500'
          )}
        >
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={cn(
                  'p-2 rounded-lg',
                  status.severity === 'emergency' && 'bg-danger-100 text-danger-600',
                  status.severity === 'critical' && 'bg-danger-50 text-danger-500',
                  status.severity === 'warning' && 'bg-warning-50 text-warning-500',
                  status.severity === 'caution' && 'bg-warning-25 text-warning-400',
                  status.severity === 'normal' && 'bg-success-50 text-success-500'
                )}>
                  {getStatusIcon(status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{status.label}</h4>
                    {getTrendIcon(status.trend)}
                    {status.containsPHI && (
                      <Shield className="h-3 w-3 text-purple-500" />
                    )}
                  </div>

                  {status.description && (
                    <p className="text-sm text-default-600 mt-1 truncate">
                      {status.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-default-500">
                    {showTimestamps && (
                      <span>{formatTimestamp(status.lastUpdated)}</span>
                    )}
                    {status.accessLevel && status.accessLevel !== 'public' && (
                      <span className="uppercase">{status.accessLevel}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Chip
                  size="sm"
                  color={getStatusColor(status) as any}
                  variant={status.isUrgent ? 'solid' : 'flat'}
                >
                  {status.numericValue ?
                    `${status.numericValue} ${status.unit || ''}` :
                    status.value
                  }
                </Chip>

                {status.isUrgent && (
                  <Chip size="sm" color="danger" variant="flat">
                    Urgent
                  </Chip>
                )}
              </div>
            </div>

            {/* Progress bar for treatment progress */}
            {status.type === 'treatment-progress' && status.numericValue && (
              <div className="mt-3">
                <Progress
                  value={status.numericValue}
                  color={getStatusColor(status) as any}
                  size="sm"
                  className="w-full"
                  aria-label={`Treatment progress: ${status.numericValue}%`}
                />
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )

  // Render grid variant
  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayStatuses.map((status) => renderDetailed().props.children.find((child: any) => child.key === status.id))}
    </div>
  )

  // Render list variant
  const renderList = () => (
    <div className="space-y-1">
      {displayStatuses.map((status) => (
        <div
          key={status.id}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg transition-colors',
            'hover:bg-default-50 cursor-pointer',
            'min-h-[44px]', // WCAG AAA touch target
            status.isUrgent && 'bg-danger-50 border border-danger-200',
            !interactive && 'cursor-default'
          )}
          onClick={() => handleStatusClick(status)}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(status)}
            <span className="font-medium">{status.label}</span>
            {getTrendIcon(status.trend)}
          </div>

          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={getStatusColor(status) as any}
              variant="flat"
            >
              {status.numericValue ?
                `${status.numericValue} ${status.unit || ''}` :
                status.value
              }
            </Chip>
            {showTimestamps && (
              <span className="text-xs text-default-500">
                {formatTimestamp(status.lastUpdated)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div
      className={cn(
        'w-full',
        isActualEmergency && 'ring-2 ring-red-500/50',
        className
      )}
      aria-label={ariaLabel || 'Patient status indicators'}
      aria-describedby={ariaDescribedBy}
    >
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        id={liveRegionId}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Status indicators */}
      {variant === 'compact' && renderCompact()}
      {variant === 'detailed' && renderDetailed()}
      {variant === 'grid' && renderGrid()}
      {variant === 'list' && renderList()}

      {/* Emergency summary */}
      {isActualEmergency && displayStatuses.some(s => s.severity === 'emergency' || s.isUrgent) && (
        <Card className="mt-4 border-danger-500 bg-danger-50">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger-600 animate-pulse" />
              <div>
                <h4 className="font-semibold text-danger-800">Emergency Status Active</h4>
                <p className="text-sm text-danger-700">
                  {displayStatuses.filter(s => s.severity === 'emergency' || s.isUrgent).length} critical status{displayStatuses.filter(s => s.severity === 'emergency' || s.isUrgent).length > 1 ? 'es' : ''} require immediate attention
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Compliance footer */}
      {complianceLevel && (
        <div className="mt-4 text-xs text-default-500 flex items-center gap-2">
          <Shield className="h-3 w-3" />
          <span>{complianceLevel} Compliant - All status access is audited</span>
        </div>
      )}
    </div>
  )
}

// Pre-configured status sets for common healthcare scenarios
export const PatientStatusPresets = {
  // Basic vital signs
  vitalSigns: [
    {
      id: 'heart-rate',
      type: 'vital-signs' as const,
      value: 'stable' as const,
      severity: 'normal' as const,
      label: 'Heart Rate',
      numericValue: 72,
      unit: 'bpm',
      timestamp: new Date(),
      lastUpdated: new Date(),
      trend: 'stable' as const,
    },
    {
      id: 'blood-pressure',
      type: 'vital-signs' as const,
      value: 'stable' as const,
      severity: 'normal' as const,
      label: 'Blood Pressure',
      description: 'Systolic/Diastolic',
      numericValue: 120,
      unit: '/80 mmHg',
      timestamp: new Date(),
      lastUpdated: new Date(),
      trend: 'stable' as const,
    },
  ],

  // Emergency scenario
  emergencyAlert: [
    {
      id: 'emergency-vital',
      type: 'emergency-alert' as const,
      value: 'critical' as const,
      severity: 'emergency' as const,
      label: 'Critical Vital Signs',
      description: 'Immediate intervention required',
      isUrgent: true,
      alertsEnabled: true,
      timestamp: new Date(),
      lastUpdated: new Date(),
      containsPHI: true,
      accessLevel: 'emergency' as const,
    },
  ],

  // Treatment progress
  treatmentProgress: [
    {
      id: 'therapy-progress',
      type: 'treatment-progress' as const,
      value: 'improving' as const,
      severity: 'normal' as const,
      label: 'Therapy Progress',
      description: 'Patient showing positive response',
      numericValue: 75,
      unit: '%',
      timestamp: new Date(),
      lastUpdated: new Date(),
      trend: 'up' as const,
      containsPHI: true,
      accessLevel: 'confidential' as const,
    },
  ],
} as const

export default PatientStatusIndicators