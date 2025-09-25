/**
 * ComplianceMarkers - Visual indicators for healthcare compliance status
 *
 * Provides clear visual cues for HIPAA, Quebec Law 25, and PIPEDA compliance
 * with tooltips for detailed information and audit logging hooks.
 */

import React, { useCallback, useMemo, useRef } from 'react'
import {
  Chip,
  Tooltip,
  Badge,
  Button,
  Card,
  CardBody,
  Progress,
  Divider,
} from '@nextui-org/react'
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Database,
  Zap,
  Info,
  Globe,
  UserCheck,
  Calendar,
  Activity,
} from 'lucide-react'
import { designTokens } from '@/ui/design-tokens'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export type ComplianceLevel = 'compliant' | 'warning' | 'violation' | 'pending' | 'unknown'
export type ComplianceType = 'hipaa' | 'quebec_law_25' | 'pipeda' | 'phi_protection' | 'data_residency' | 'consent_management' | 'audit_trail' | 'breach_notification'

export interface ComplianceStatus {
  type: ComplianceType
  level: ComplianceLevel
  title: string
  description: string
  lastChecked?: Date
  expiryDate?: Date
  details?: Record<string, any>
  actionRequired?: boolean
  actionText?: string
  onAction?: () => void
}

export interface ComplianceMarkersProps {
  /**
   * Array of compliance statuses to display
   */
  statuses: ComplianceStatus[]

  /**
   * Display variant
   */
  variant?: 'chips' | 'badges' | 'detailed' | 'compact' | 'dashboard'

  /**
   * Size of the markers
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether to show compliance details on hover
   */
  showTooltips?: boolean

  /**
   * Whether to show the compliance percentage/score
   */
  showScore?: boolean

  /**
   * Whether to show last checked timestamp
   */
  showTimestamp?: boolean

  /**
   * Whether to group by compliance type
   */
  groupByType?: boolean

  /**
   * Whether this data involves PHI
   */
  containsPHI?: boolean

  /**
   * Emergency mode styling
   */
  isEmergency?: boolean

  /**
   * Callback for compliance check actions
   */
  onComplianceCheck?: (type: ComplianceType) => void

  /**
   * Callback for audit logging
   */
  onAuditLog?: (action: string, details: Record<string, any>) => void

  /**
   * Custom aria-label for the component
   */
  'aria-label'?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

// =============================================================================
// COMPLIANCE CONFIGURATION
// =============================================================================

const COMPLIANCE_CONFIG = {
  hipaa: {
    icon: Shield,
    color: 'primary',
    labels: {
      compliant: 'HIPAA Compliant',
      warning: 'HIPAA Review Needed',
      violation: 'HIPAA Violation',
      pending: 'HIPAA Pending',
      unknown: 'HIPAA Status Unknown',
    },
    descriptions: {
      compliant: 'All HIPAA requirements are met',
      warning: 'Some HIPAA requirements need attention',
      violation: 'HIPAA compliance violations detected',
      pending: 'HIPAA compliance check in progress',
      unknown: 'HIPAA compliance status not determined',
    },
  },
  quebec_law_25: {
    icon: Globe,
    color: 'secondary',
    labels: {
      compliant: 'Quebec Law 25 Compliant',
      warning: 'Law 25 Review Needed',
      violation: 'Law 25 Non-Compliant',
      pending: 'Law 25 Assessment Pending',
      unknown: 'Law 25 Status Unknown',
    },
    descriptions: {
      compliant: 'Quebec Law 25 requirements are met',
      warning: 'Some Law 25 requirements need attention',
      violation: 'Quebec Law 25 violations detected',
      pending: 'Law 25 compliance assessment in progress',
      unknown: 'Quebec Law 25 compliance status not determined',
    },
  },
  pipeda: {
    icon: UserCheck,
    color: 'success',
    labels: {
      compliant: 'PIPEDA Compliant',
      warning: 'PIPEDA Review Needed',
      violation: 'PIPEDA Non-Compliant',
      pending: 'PIPEDA Assessment Pending',
      unknown: 'PIPEDA Status Unknown',
    },
    descriptions: {
      compliant: 'PIPEDA requirements are met',
      warning: 'Some PIPEDA requirements need attention',
      violation: 'PIPEDA violations detected',
      pending: 'PIPEDA compliance assessment in progress',
      unknown: 'PIPEDA compliance status not determined',
    },
  },
  phi_protection: {
    icon: Lock,
    color: 'warning',
    labels: {
      compliant: 'PHI Protected',
      warning: 'PHI Partially Protected',
      violation: 'PHI Exposure Risk',
      pending: 'PHI Protection Pending',
      unknown: 'PHI Protection Unknown',
    },
    descriptions: {
      compliant: 'PHI data is fully protected',
      warning: 'Some PHI data may need additional protection',
      violation: 'PHI data exposure risk detected',
      pending: 'PHI protection assessment in progress',
      unknown: 'PHI protection status not determined',
    },
  },
  data_residency: {
    icon: Database,
    color: 'primary',
    labels: {
      compliant: 'Data Residency Compliant',
      warning: 'Residency Check Needed',
      violation: 'Data Residency Violation',
      pending: 'Residency Check Pending',
      unknown: 'Residency Status Unknown',
    },
    descriptions: {
      compliant: 'Data is stored in compliant jurisdictions',
      warning: 'Some data residency requirements need review',
      violation: 'Data stored in non-compliant jurisdictions',
      pending: 'Data residency check in progress',
      unknown: 'Data residency status not determined',
    },
  },
  consent_management: {
    icon: FileText,
    color: 'secondary',
    labels: {
      compliant: 'Consent Current',
      warning: 'Consent Expiring',
      violation: 'Consent Expired',
      pending: 'Consent Pending',
      unknown: 'Consent Status Unknown',
    },
    descriptions: {
      compliant: 'All required consents are current',
      warning: 'Some consents are expiring soon',
      violation: 'Required consents have expired',
      pending: 'Consent collection in progress',
      unknown: 'Consent status not determined',
    },
  },
  audit_trail: {
    icon: Activity,
    color: 'success',
    labels: {
      compliant: 'Audit Trail Complete',
      warning: 'Audit Gaps Detected',
      violation: 'Audit Trail Missing',
      pending: 'Audit Check Pending',
      unknown: 'Audit Status Unknown',
    },
    descriptions: {
      compliant: 'Complete audit trail is maintained',
      warning: 'Some audit trail gaps detected',
      violation: 'Required audit trail is missing',
      pending: 'Audit trail check in progress',
      unknown: 'Audit trail status not determined',
    },
  },
  breach_notification: {
    icon: Zap,
    color: 'danger',
    labels: {
      compliant: 'Breach Response Ready',
      warning: 'Response Plan Needs Update',
      violation: 'Breach Response Missing',
      pending: 'Response Plan Pending',
      unknown: 'Response Status Unknown',
    },
    descriptions: {
      compliant: 'Breach notification procedures are ready',
      warning: 'Breach response plan needs updating',
      violation: 'Required breach response procedures missing',
      pending: 'Breach response plan assessment in progress',
      unknown: 'Breach response status not determined',
    },
  },
} as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getComplianceColor = (level: ComplianceLevel): string => {
  switch (level) {
    case 'compliant':
      return designTokens.colors.alert.success
    case 'warning':
      return designTokens.colors.alert.warning
    case 'violation':
      return designTokens.colors.alert.critical
    case 'pending':
      return designTokens.colors.alert.info
    case 'unknown':
    default:
      return designTokens.colors.interactive.secondary
  }
}

const getComplianceScore = (statuses: ComplianceStatus[]): number => {
  if (statuses.length === 0) return 0

  const scores = statuses.map(status => {
    switch (status.level) {
      case 'compliant': return 100
      case 'warning': return 75
      case 'pending': return 50
      case 'violation': return 25
      case 'unknown': return 0
      default: return 0
    }
  })

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface ComplianceChipProps {
  status: ComplianceStatus
  size?: 'sm' | 'md' | 'lg'
  showTooltips?: boolean
  onAuditLog?: (action: string, details: Record<string, any>) => void
}

function ComplianceChip({ status, size = 'md', showTooltips = true, onAuditLog }: ComplianceChipProps) {
  const config = COMPLIANCE_CONFIG[status.type]
  const IconComponent = config.icon
  const color = getComplianceColor(status.level)

  const handleChipClick = useCallback(() => {
    onAuditLog?.('compliance_marker_clicked', {
      type: status.type,
      level: status.level,
      timestamp: new Date().toISOString(),
    })
  }, [status, onAuditLog])

  const chipContent = (
    <Chip
      startContent={<IconComponent className="h-3 w-3" />}
      variant={status.level === 'compliant' ? 'solid' : 'bordered'}
      color={status.level === 'compliant' ? 'success' :
             status.level === 'warning' ? 'warning' :
             status.level === 'violation' ? 'danger' : 'default'}
      size={size}
      className={`cursor-pointer transition-all duration-200 ${
        status.level === 'violation' ? 'animate-pulse' : ''
      }`}
      onClick={handleChipClick}
      role="button"
      tabIndex={0}
      aria-label={`${config.labels[status.level]} - Click for details`}
    >
      {config.labels[status.level]}
    </Chip>
  )

  if (!showTooltips) return chipContent

  return (
    <Tooltip
      content={
        <div className="p-2 max-w-xs">
          <div className="font-semibold text-sm mb-1">
            {config.labels[status.level]}
          </div>
          <div className="text-xs text-default-600 mb-2">
            {status.description || config.descriptions[status.level]}
          </div>
          {status.lastChecked && (
            <div className="text-xs text-default-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last checked: {status.lastChecked.toLocaleDateString()}
            </div>
          )}
          {status.expiryDate && (
            <div className="text-xs text-warning flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              Expires: {status.expiryDate.toLocaleDateString()}
            </div>
          )}
          {status.actionRequired && (
            <div className="text-xs text-danger flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Action required
            </div>
          )}
        </div>
      }
      delay={0}
      closeDelay={0}
      motionProps={{
        variants: {
          exit: {
            opacity: 0,
            transition: {
              duration: 0.1,
              ease: "easeIn",
            }
          },
          enter: {
            opacity: 1,
            transition: {
              duration: 0.15,
              ease: "easeOut",
            }
          },
        },
      }}
    >
      {chipContent}
    </Tooltip>
  )
}

interface ComplianceBadgeProps {
  status: ComplianceStatus
  showTooltips?: boolean
  onAuditLog?: (action: string, details: Record<string, any>) => void
}

function ComplianceBadge({ status, showTooltips = true, onAuditLog }: ComplianceBadgeProps) {
  const config = COMPLIANCE_CONFIG[status.type]
  const IconComponent = config.icon

  const handleBadgeClick = useCallback(() => {
    onAuditLog?.('compliance_badge_clicked', {
      type: status.type,
      level: status.level,
      timestamp: new Date().toISOString(),
    })
  }, [status, onAuditLog])

  const badgeContent = (
    <Badge
      content={status.level === 'compliant' ? <CheckCircle className="h-3 w-3" /> :
               status.level === 'violation' ? <AlertTriangle className="h-3 w-3" /> :
               <Clock className="h-3 w-3" />}
      color={status.level === 'compliant' ? 'success' :
             status.level === 'warning' ? 'warning' :
             status.level === 'violation' ? 'danger' : 'default'}
      variant="solid"
      placement="top-right"
      className="cursor-pointer"
    >
      <div
        className="flex items-center gap-2 p-2 rounded-lg border border-default-200 hover:border-default-300 transition-colors"
        onClick={handleBadgeClick}
        role="button"
        tabIndex={0}
        aria-label={`${config.labels[status.level]} compliance status`}
      >
        <IconComponent
          className="h-4 w-4"
          style={{ color: getComplianceColor(status.level) }}
        />
        <span className="text-sm font-medium">{status.type.replace('_', ' ').toUpperCase()}</span>
      </div>
    </Badge>
  )

  if (!showTooltips) return badgeContent

  return (
    <Tooltip content={config.descriptions[status.level]}>
      {badgeContent}
    </Tooltip>
  )
}

interface DetailedComplianceCardProps {
  status: ComplianceStatus
  showTimestamp?: boolean
  onComplianceCheck?: (type: ComplianceType) => void
  onAuditLog?: (action: string, details: Record<string, any>) => void
}

function DetailedComplianceCard({
  status,
  showTimestamp = true,
  onComplianceCheck,
  onAuditLog
}: DetailedComplianceCardProps) {
  const config = COMPLIANCE_CONFIG[status.type]
  const IconComponent = config.icon

  const handleActionClick = useCallback(() => {
    if (status.onAction) {
      status.onAction()
    } else if (onComplianceCheck) {
      onComplianceCheck(status.type)
    }

    onAuditLog?.('compliance_action_triggered', {
      type: status.type,
      level: status.level,
      action: status.actionText || 'check_compliance',
      timestamp: new Date().toISOString(),
    })
  }, [status, onComplianceCheck, onAuditLog])

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getComplianceColor(status.level)}20` }}
            >
              <IconComponent
                className="h-5 w-5"
                style={{ color: getComplianceColor(status.level) }}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold">{status.title}</h4>
              <p className="text-xs text-default-600">{status.description}</p>
            </div>
          </div>

          <Chip
            variant="flat"
            color={status.level === 'compliant' ? 'success' :
                   status.level === 'warning' ? 'warning' :
                   status.level === 'violation' ? 'danger' : 'default'}
            size="sm"
          >
            {status.level.toUpperCase()}
          </Chip>
        </div>

        {showTimestamp && (status.lastChecked || status.expiryDate) && (
          <div className="flex flex-wrap gap-3 text-xs text-default-500 mb-3">
            {status.lastChecked && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last checked: {status.lastChecked.toLocaleDateString()}
              </div>
            )}
            {status.expiryDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires: {status.expiryDate.toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {status.actionRequired && (
          <>
            <Divider className="my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="h-3 w-3 text-warning" />
                <span className="text-warning">Action required</span>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={handleActionClick}
                aria-label={status.actionText || 'Check compliance'}
              >
                {status.actionText || 'Check'}
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ComplianceMarkers({
  statuses,
  variant = 'chips',
  size = 'md',
  showTooltips = true,
  showScore = false,
  showTimestamp = true,
  groupByType = false,
  containsPHI = false,
  isEmergency = false,
  onComplianceCheck,
  onAuditLog,
  'aria-label': ariaLabel,
  className = '',
}: ComplianceMarkersProps) {
  // Memoize computed values
  const complianceScore = useMemo(() => getComplianceScore(statuses), [statuses])

  const groupedStatuses = useMemo(() => {
    if (!groupByType) return { all: statuses }

    return statuses.reduce((groups, status) => {
      const category = status.type
      if (!groups[category]) groups[category] = []
      groups[category].push(status)
      return groups
    }, {} as Record<string, ComplianceStatus[]>)
  }, [statuses, groupByType])

  // Audit log component mount
  const hasLoggedMount = useRef(false)
  React.useEffect(() => {
    if (!hasLoggedMount.current) {
      onAuditLog?.('compliance_markers_viewed', {
        statusCount: statuses.length,
        containsPHI,
        isEmergency,
        variant,
        timestamp: new Date().toISOString(),
      })
      hasLoggedMount.current = true
    }
  }, [statuses.length, containsPHI, isEmergency, variant, onAuditLog])

  // Emergency mode announcements
  const emergencyStatuses = useMemo(() =>
    statuses.filter(s => s.level === 'violation'),
    [statuses]
  )

  React.useEffect(() => {
    if (isEmergency && emergencyStatuses.length > 0) {
      // Announce compliance violations in emergency mode
      const message = `${emergencyStatuses.length} compliance violations detected`

      // Create live region announcement
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'assertive')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message

      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)

      onAuditLog?.('emergency_compliance_announcement', {
        violationCount: emergencyStatuses.length,
        violations: emergencyStatuses.map(s => s.type),
        timestamp: new Date().toISOString(),
      })
    }
  }, [isEmergency, emergencyStatuses, onAuditLog])

  const renderMarkers = () => {
    switch (variant) {
      case 'chips':
        return (
          <div className="flex flex-wrap gap-2">
            {statuses.map((status, index) => (
              <ComplianceChip
                key={`${status.type}-${index}`}
                status={status}
                size={size}
                showTooltips={showTooltips}
                onAuditLog={onAuditLog}
              />
            ))}
          </div>
        )

      case 'badges':
        return (
          <div className="flex flex-wrap gap-2">
            {statuses.map((status, index) => (
              <ComplianceBadge
                key={`${status.type}-${index}`}
                status={status}
                showTooltips={showTooltips}
                onAuditLog={onAuditLog}
              />
            ))}
          </div>
        )

      case 'detailed':
        return (
          <div className="space-y-3">
            {statuses.map((status, index) => (
              <DetailedComplianceCard
                key={`${status.type}-${index}`}
                status={status}
                showTimestamp={showTimestamp}
                onComplianceCheck={onComplianceCheck}
                onAuditLog={onAuditLog}
              />
            ))}
          </div>
        )

      case 'compact':
        return (
          <div className="flex items-center gap-1">
            {statuses.map((status, index) => {
              const IconComponent = COMPLIANCE_CONFIG[status.type].icon
              return (
                <Tooltip
                  key={`${status.type}-${index}`}
                  content={COMPLIANCE_CONFIG[status.type].labels[status.level]}
                  delay={300}
                >
                  <div
                    className="p-1 rounded cursor-pointer hover:scale-110 transition-transform"
                    style={{ color: getComplianceColor(status.level) }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${status.type} compliance: ${status.level}`}
                    onClick={() => onAuditLog?.('compact_marker_clicked', {
                      type: status.type,
                      level: status.level,
                    })}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                </Tooltip>
              )
            })}
          </div>
        )

      case 'dashboard':
        return (
          <Card className="w-full">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Compliance Overview</h3>
                {containsPHI && (
                  <Chip color="warning" variant="flat" size="sm">
                    Contains PHI
                  </Chip>
                )}
              </div>

              {showScore && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Compliance</span>
                    <span className="text-sm text-default-600">{complianceScore}%</span>
                  </div>
                  <Progress
                    value={complianceScore}
                    color={complianceScore >= 90 ? 'success' :
                           complianceScore >= 70 ? 'warning' : 'danger'}
                    className="w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {statuses.map((status, index) => (
                  <div
                    key={`${status.type}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg border border-default-200"
                  >
                    <div
                      className="p-1 rounded"
                      style={{ backgroundColor: `${getComplianceColor(status.level)}20` }}
                    >
                      {React.createElement(COMPLIANCE_CONFIG[status.type].icon, {
                        className: "h-4 w-4",
                        style: { color: getComplianceColor(status.level) }
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {status.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-default-600 capitalize">
                        {status.level}
                      </div>
                    </div>
                    {status.actionRequired && (
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`compliance-markers ${className} ${
        isEmergency ? 'emergency-mode' : ''
      }`}
      aria-label={ariaLabel || `Compliance status indicators showing ${statuses.length} items`}
      role="region"
    >
      {groupByType ? (
        <div className="space-y-4">
          {Object.entries(groupedStatuses).map(([category, categoryStatuses]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-default-700 capitalize">
                {category.replace('_', ' ')} Compliance
              </h4>
              <div className="pl-2">
                {React.cloneElement(renderMarkers() as React.ReactElement, {
                  statuses: categoryStatuses
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        renderMarkers()
      )}

      {/* Live region for dynamic updates */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        role="status"
        id="compliance-status-updates"
      />
    </div>
  )
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { getComplianceScore, getComplianceColor, COMPLIANCE_CONFIG }

export default ComplianceMarkers