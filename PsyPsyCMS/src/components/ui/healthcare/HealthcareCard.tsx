import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, CardProps, Chip, Badge, Avatar } from '@/components/ui/nextui'
import { ShieldCheck, Shield, AlertTriangle, Eye, User, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthcareCardProps extends Omit<CardProps, 'children'> {
  /**
   * Card variant for different healthcare contexts
   */
  variant?:
    | 'patient'       // Patient information cards
    | 'professional'  // Healthcare professional cards
    | 'appointment'   // Appointment cards
    | 'medical'       // Medical records/notes
    | 'compliance'    // Compliance/audit information
    | 'emergency'     // Emergency/critical information

  /**
   * Header content
   */
  title?: string
  subtitle?: string
  avatar?: {
    src?: string
    name?: string
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  }

  /**
   * PHI (Protected Health Information) indicator
   */
  containsPHI?: boolean

  /**
   * Compliance level indicators
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Access level required
   */
  accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'

  /**
   * Status indicator
   */
  status?: {
    type: 'success' | 'warning' | 'danger' | 'info'
    label: string
    icon?: React.ReactNode
  }

  /**
   * Priority level
   */
  priority?: 'low' | 'medium' | 'high' | 'critical'

  /**
   * Emergency flag
   */
  isEmergency?: boolean

  /**
   * Audit information
   */
  auditInfo?: {
    lastAccessed?: string
    accessedBy?: string
    actionRequired?: boolean
  }

  /**
   * Card content
   */
  children?: React.ReactNode

  /**
   * Footer actions
   */
  actions?: React.ReactNode

  /**
   * Click handler with audit logging
   */
  onCardClick?: (auditData: {
    cardType: string
    containsPHI: boolean
    accessLevel: string
    timestamp: string
  }) => void
}

/**
 * HealthcareCard - NextUI Card optimized for healthcare data display with HIPAA compliance
 *
 * @example
 * ```tsx
 * <HealthcareCard
 *   variant="patient"
 *   title="John Doe"
 *   subtitle="Patient ID: PAT-001"
 *   containsPHI={true}
 *   complianceLevel="HIPAA"
 *   accessLevel="confidential"
 *   status={{ type: 'success', label: 'Active' }}
 * >
 *   <p>Next appointment: Jan 21, 2025</p>
 * </HealthcareCard>
 * ```
 */
export function HealthcareCard({
  variant = 'patient',
  title,
  subtitle,
  avatar,
  containsPHI = false,
  complianceLevel,
  accessLevel = 'public',
  status,
  priority,
  isEmergency = false,
  auditInfo,
  children,
  actions,
  onCardClick,
  className,
  ...props
}: HealthcareCardProps) {
  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'patient':
        return {
          borderColor: 'border-l-blue-500',
          iconColor: 'text-blue-500',
          icon: <User className="h-5 w-5" />,
        }
      case 'professional':
        return {
          borderColor: 'border-l-green-500',
          iconColor: 'text-green-500',
          icon: <ShieldCheck className="h-5 w-5" />,
        }
      case 'appointment':
        return {
          borderColor: 'border-l-purple-500',
          iconColor: 'text-purple-500',
          icon: <Calendar className="h-5 w-5" />,
        }
      case 'medical':
        return {
          borderColor: 'border-l-orange-500',
          iconColor: 'text-orange-500',
          icon: <FileText className="h-5 w-5" />,
        }
      case 'compliance':
        return {
          borderColor: 'border-l-indigo-500',
          iconColor: 'text-indigo-500',
          icon: <Shield className="h-5 w-5" />,
        }
      case 'emergency':
        return {
          borderColor: 'border-l-red-500',
          iconColor: 'text-red-500',
          icon: <AlertTriangle className="h-5 w-5" />,
        }
      default:
        return {
          borderColor: 'border-l-gray-500',
          iconColor: 'text-gray-500',
          icon: <User className="h-5 w-5" />,
        }
    }
  }

  const variantStyles = getVariantStyles()

  // Get priority chip color
  const getPriorityColor = () => {
    switch (priority) {
      case 'critical':
        return 'danger'
      case 'high':
        return 'warning'
      case 'medium':
        return 'primary'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  // Get access level indicator
  const getAccessLevelIcon = () => {
    switch (accessLevel) {
      case 'confidential':
        return <Eye className="h-3 w-3 text-red-500" />
      case 'restricted':
        return <Shield className="h-3 w-3 text-orange-500" />
      case 'emergency':
        return <AlertTriangle className="h-3 w-3 text-red-600" />
      default:
        return null
    }
  }

  const handleCardClick = () => {
    if (onCardClick) {
      const auditData = {
        cardType: variant,
        containsPHI,
        accessLevel,
        timestamp: new Date().toISOString(),
      }

      // Log healthcare card access for HIPAA compliance
      console.log('[Healthcare Audit] Card Access:', auditData)

      onCardClick(auditData)
    }
  }

  return (
    <Card
      className={cn(
        // Base card styling
        'transition-all duration-200 hover:shadow-md cursor-pointer',

        // Variant-specific border
        variantStyles.borderColor,
        'border-l-4',

        // PHI data indicator
        containsPHI && 'ring-2 ring-purple-100 bg-purple-50/30',

        // Emergency indicator
        isEmergency && 'shadow-lg shadow-red-200 animate-pulse bg-red-50/30',

        // Priority-based styling
        priority === 'critical' && 'ring-2 ring-red-200',
        priority === 'high' && 'ring-1 ring-orange-200',

        className
      )}
      onClick={handleCardClick}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || avatar || status || containsPHI || complianceLevel) && (
        <CardHeader className="flex gap-3 pb-2">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar */}
            {avatar && (
              <Avatar
                name={avatar.name}
                src={avatar.src}
                color={avatar.color || 'primary'}
                size="md"
                className="flex-shrink-0"
              />
            )}

            {/* Icon for non-avatar variants */}
            {!avatar && (
              <div className={cn('flex-shrink-0', variantStyles.iconColor)}>
                {variantStyles.icon}
              </div>
            )}

            {/* Title and subtitle */}
            <div className="flex flex-col flex-1 min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  <p className="text-md font-semibold truncate">{title}</p>
                  {getAccessLevelIcon()}
                </div>
              )}
              {subtitle && (
                <p className="text-small text-default-500 truncate">{subtitle}</p>
              )}
            </div>

            {/* Status and indicators */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {/* Status chip */}
              {status && (
                <Chip
                  color={status.type}
                  size="sm"
                  variant="flat"
                  startContent={status.icon}
                >
                  {status.label}
                </Chip>
              )}

              {/* Priority indicator */}
              {priority && (
                <Chip
                  color={getPriorityColor()}
                  size="sm"
                  variant="dot"
                >
                  {priority.toUpperCase()}
                </Chip>
              )}

              {/* PHI indicator */}
              {containsPHI && (
                <Badge color="warning" variant="flat" size="sm" content="PHI">
                  <div className="w-4 h-4" />
                </Badge>
              )}

              {/* Compliance level */}
              {complianceLevel && (
                <Chip
                  color="secondary"
                  size="sm"
                  variant="bordered"
                >
                  {complianceLevel}
                </Chip>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      {/* Body */}
      {children && (
        <CardBody className="pt-0">
          {children}
        </CardBody>
      )}

      {/* Footer */}
      {(actions || auditInfo) && (
        <CardFooter className="pt-2 flex flex-col gap-2">
          {/* Actions */}
          {actions && <div className="flex gap-2 w-full">{actions}</div>}

          {/* Audit information */}
          {auditInfo && (
            <div className="text-xs text-default-400 w-full">
              {auditInfo.lastAccessed && (
                <p>Last accessed: {auditInfo.lastAccessed}</p>
              )}
              {auditInfo.accessedBy && (
                <p>By: {auditInfo.accessedBy}</p>
              )}
              {auditInfo.actionRequired && (
                <Chip color="warning" size="sm" variant="flat" className="mt-1">
                  Action Required
                </Chip>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// Predefined healthcare card configurations
export const HealthcareCardPresets = {
  // Patient cards
  patientActive: {
    variant: 'patient' as const,
    status: { type: 'success' as const, label: 'Active' },
    accessLevel: 'confidential' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },

  patientInactive: {
    variant: 'patient' as const,
    status: { type: 'warning' as const, label: 'Inactive' },
    accessLevel: 'restricted' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },

  // Professional cards
  professionalActive: {
    variant: 'professional' as const,
    status: { type: 'success' as const, label: 'Available' },
    accessLevel: 'public' as const,
  },

  professionalBusy: {
    variant: 'professional' as const,
    status: { type: 'warning' as const, label: 'Busy' },
    accessLevel: 'public' as const,
  },

  // Appointment cards
  appointmentScheduled: {
    variant: 'appointment' as const,
    status: { type: 'info' as const, label: 'Scheduled' },
    priority: 'medium' as const,
  },

  appointmentUrgent: {
    variant: 'appointment' as const,
    status: { type: 'warning' as const, label: 'Urgent' },
    priority: 'high' as const,
  },

  // Medical record cards
  medicalRecord: {
    variant: 'medical' as const,
    containsPHI: true,
    accessLevel: 'confidential' as const,
    complianceLevel: 'HIPAA' as const,
  },

  // Emergency cards
  emergencyAlert: {
    variant: 'emergency' as const,
    isEmergency: true,
    priority: 'critical' as const,
    status: { type: 'danger' as const, label: 'Emergency' },
    accessLevel: 'emergency' as const,
  },

  // Compliance cards
  complianceAudit: {
    variant: 'compliance' as const,
    complianceLevel: 'Law25' as const,
    status: { type: 'info' as const, label: 'Audit Required' },
  },
} as const