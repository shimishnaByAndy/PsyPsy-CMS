import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, CardProps, Chip, Badge, Avatar } from '@/components/ui/nextui'
import { ShieldCheck, Shield, AlertTriangle, Eye, User, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { designTokens } from '@/ui/design-tokens'

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
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: HealthcareCardProps) {
  // Generate unique IDs for accessibility
  const cardId = React.useId()
  const descriptionId = `${cardId}-description`
  const statusId = `${cardId}-status`
  
  // Get variant-specific styling using design tokens with accessibility descriptions
  const getVariantStyles = () => {
    switch (variant) {
      case 'patient':
        return {
          borderColor: `border-l-[${designTokens.colors.interactive.primary}]`,
          iconColor: `text-[${designTokens.colors.interactive.primary}]`,
          icon: <User className="h-5 w-5" aria-hidden="true" />,
          description: 'Patient information card',
          role: 'article'
        }
      case 'professional':
        return {
          borderColor: `border-l-[${designTokens.colors.status.available}]`,
          iconColor: `text-[${designTokens.colors.status.available}]`,
          icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
          description: 'Healthcare professional card',
          role: 'article'
        }
      case 'appointment':
        return {
          borderColor: `border-l-[${designTokens.colors.interactive.accent}]`,
          iconColor: `text-[${designTokens.colors.interactive.accent}]`,
          icon: <Calendar className="h-5 w-5" aria-hidden="true" />,
          description: 'Appointment information card',
          role: 'article'
        }
      case 'medical':
        return {
          borderColor: `border-l-[${designTokens.colors.alert.warning}]`,
          iconColor: `text-[${designTokens.colors.alert.warning}]`,
          icon: <FileText className="h-5 w-5" aria-hidden="true" />,
          description: 'Medical record card',
          role: 'article'
        }
      case 'compliance':
        return {
          borderColor: `border-l-[${designTokens.colors.compliance.audit}]`,
          iconColor: `text-[${designTokens.colors.compliance.audit}]`,
          icon: <Shield className="h-5 w-5" aria-hidden="true" />,
          description: 'Compliance information card',
          role: 'article'
        }
      case 'emergency':
        return {
          borderColor: `border-l-[${designTokens.colors.alert.critical}]`,
          iconColor: `text-[${designTokens.colors.alert.critical}]`,
          icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
          description: 'Emergency alert card - immediate attention required',
          role: 'alert'
        }
      default:
        return {
          borderColor: `border-l-[${designTokens.colors.border.subtle}]`,
          iconColor: `text-[${designTokens.colors.text.secondary}]`,
          icon: <User className="h-5 w-5" aria-hidden="true" />,
          description: 'Healthcare information card',
          role: 'article'
        }
    }
  }

  const variantStyles = getVariantStyles()

  // Get priority chip color with accessibility considerations
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

  // Get priority description for screen readers
  const getPriorityDescription = () => {
    switch (priority) {
      case 'critical':
        return 'Critical priority - immediate action required'
      case 'high':
        return 'High priority - urgent attention needed'
      case 'medium':
        return 'Medium priority'
      case 'low':
        return 'Low priority'
      default:
        return ''
    }
  }

  // Get access level indicator with accessibility
  const getAccessLevelIcon = () => {
    switch (accessLevel) {
      case 'confidential':
        return (
          <Eye 
            className="h-3 w-3 text-red-500" 
            aria-label="Confidential access level"
            role="img"
          />
        )
      case 'restricted':
        return (
          <Shield 
            className="h-3 w-3 text-orange-500" 
            aria-label="Restricted access level"
            role="img"
          />
        )
      case 'emergency':
        return (
          <AlertTriangle 
            className="h-3 w-3 text-red-600" 
            aria-label="Emergency access level"
            role="img"
          />
        )
      default:
        return null
    }
  }

  // Enhanced click handler with accessibility announcements
  const handleCardClick = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (onCardClick) {
      const auditData = {
        cardType: variant,
        containsPHI,
        accessLevel,
        timestamp: new Date().toISOString(),
        accessibility: {
          hasAriaLabel: !!ariaLabel,
          hasDescription: !!ariaDescribedBy,
          isEmergency,
          containsPHI,
          interactionType: event.type
        }
      }

      // Log healthcare card access for HIPAA compliance
      console.log('[Healthcare Audit] Card Access:', auditData)

      // Announce action to screen readers for critical content
      if (containsPHI || isEmergency) {
        const announcement = isEmergency 
          ? 'Emergency card accessed - critical information loaded'
          : 'Protected health information card accessed'
        
        // Create temporary live region for announcement
        const liveRegion = document.createElement('div')
        liveRegion.setAttribute('aria-live', isEmergency ? 'assertive' : 'polite')
        liveRegion.setAttribute('aria-atomic', 'true')
        liveRegion.className = 'sr-only'
        liveRegion.textContent = announcement
        document.body.appendChild(liveRegion)
        
        // Remove after announcement
        setTimeout(() => {
          if (document.body.contains(liveRegion)) {
            document.body.removeChild(liveRegion)
          }
        }, 1000)
      }

      onCardClick(auditData)
    }
  }

  // Enhanced keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick(event)
    }
    
    // Emergency shortcut (Ctrl+E for emergency cards)
    if (isEmergency && event.ctrlKey && event.key === 'e') {
      event.preventDefault()
      handleCardClick(event)
    }
  }

  // Generate comprehensive accessibility description
  const getAccessibilityDescription = () => {
    const descriptions = []
    
    descriptions.push(variantStyles.description)
    
    if (title) {
      descriptions.push(`Title: ${title}`)
    }
    
    if (subtitle) {
      descriptions.push(`Subtitle: ${subtitle}`)
    }
    
    if (containsPHI) {
      descriptions.push('Contains protected health information')
    }
    
    if (complianceLevel) {
      descriptions.push(`${complianceLevel} compliance required`)
    }
    
    if (isEmergency) {
      descriptions.push('Emergency card - immediate attention required')
    }
    
    if (priority) {
      descriptions.push(getPriorityDescription())
    }
    
    if (status) {
      descriptions.push(`Status: ${status.label}`)
    }
    
    if (accessLevel !== 'public') {
      descriptions.push(`Access level: ${accessLevel}`)
    }
    
    return descriptions.join('. ')
  }

  const accessibilityDescription = getAccessibilityDescription()

  return (
    <>
      {/* Hidden description for screen readers */}
      {accessibilityDescription && (
        <span id={descriptionId} className="sr-only">
          {accessibilityDescription}
        </span>
      )}
      
      {/* Status description for screen readers */}
      {status && (
        <span id={statusId} className="sr-only">
          Current status: {status.label}
        </span>
      )}
      
      <Card
        className={cn(
          // Base card styling using design tokens
          `transition-all ${designTokens.animation.duration.base}`,
          `${designTokens.animation.easing.easeInOut}`,
          'hover:shadow-md cursor-pointer',
          `p-[${designTokens.componentDefaults.card.padding}]`,
          `border-radius-[${designTokens.componentDefaults.card.radius}]`,

          // WCAG AAA Focus indicators (2px minimum, high contrast)
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-blue-600 focus-visible:ring-offset-white',
          'dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-gray-900',

          // Minimum touch target enforcement
          `min-h-[${designTokens.accessibility.minTouchTarget}]`,

          // Variant-specific border with enhanced contrast
          variantStyles.borderColor,
          'border-l-4',

          // PHI data indicator using design tokens with enhanced visibility
          containsPHI && 'ring-2',
          containsPHI && `ring-[${designTokens.colors.compliance.phi}]/40`,
          containsPHI && `bg-[${designTokens.colors.compliance.phi}]/10`,

          // Emergency indicator using design tokens with high contrast
          isEmergency && 'shadow-lg animate-pulse',
          isEmergency && `shadow-[${designTokens.colors.alert.critical}]/40`,
          isEmergency && `bg-[${designTokens.colors.alert.critical}]/10`,
          isEmergency && 'ring-2 ring-red-500',

          // Priority-based styling using design tokens with accessibility
          priority === 'critical' && 'ring-2',
          priority === 'critical' && `ring-[${designTokens.colors.alert.critical}]/60`,
          priority === 'high' && 'ring-1',
          priority === 'high' && `ring-[${designTokens.colors.alert.warning}]/50`,

          // Enhanced hover states for better user feedback
          'hover:scale-[1.02] active:scale-[0.98]',
          
          // High contrast mode support
          'contrast-more:border-4 contrast-more:border-current',

          className
        )}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        // Enhanced ARIA attributes
        role={variantStyles.role}
        tabIndex={0}
        aria-label={ariaLabel || `${variantStyles.description}${title ? `: ${title}` : ''}`}
        aria-describedby={cn(
          accessibilityDescription ? descriptionId : undefined,
          status ? statusId : undefined,
          ariaDescribedBy
        )}
        aria-pressed={false}
        aria-expanded={false}
        // Emergency cards get higher importance
        aria-live={isEmergency ? 'assertive' : 'off'}
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
                  role="img"
                  aria-label={`Avatar for ${avatar.name || 'user'}`}
                />
              )}

              {/* Icon for non-avatar variants */}
              {!avatar && (
                <div 
                  className={cn('flex-shrink-0', variantStyles.iconColor)}
                  role="img"
                  aria-label={`${variant} card icon`}
                >
                  {variantStyles.icon}
                </div>
              )}

              {/* Title and subtitle */}
              <div className="flex flex-col flex-1 min-w-0">
                {title && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-semibold truncate" id={`${cardId}-title`}>
                      {title}
                    </h3>
                    {getAccessLevelIcon()}
                  </div>
                )}
                {subtitle && (
                  <p 
                    className="text-small text-gray-600 truncate" 
                    id={`${cardId}-subtitle`}
                  >
                    {subtitle}
                  </p>
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
                    aria-label={`Status: ${status.label}`}
                    role="status"
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
                    aria-label={getPriorityDescription()}
                    role="status"
                  >
                    {priority.toUpperCase()}
                  </Chip>
                )}

                {/* PHI indicator */}
                {containsPHI && (
                  <Badge 
                    color="warning" 
                    variant="flat" 
                    size="sm" 
                    content="PHI"
                    aria-label="Protected Health Information indicator"
                  >
                    <div className="w-4 h-4" />
                  </Badge>
                )}

                {/* Compliance level */}
                {complianceLevel && (
                  <Chip
                    color="secondary"
                    size="sm"
                    variant="bordered"
                    aria-label={`Compliance level: ${complianceLevel}`}
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
          <CardBody className="pt-0" role="region" aria-label="Card content">
            {children}
          </CardBody>
        )}

        {/* Footer */}
        {(actions || auditInfo) && (
          <CardFooter className="pt-2 flex flex-col gap-2" role="region" aria-label="Card actions and audit information">
            {/* Actions */}
            {actions && (
              <div 
                className="flex gap-2 w-full" 
                role="group" 
                aria-label="Available actions"
              >
                {actions}
              </div>
            )}

            {/* Audit information */}
            {auditInfo && (
              <div 
                className="text-xs text-gray-600 w-full" 
                role="region" 
                aria-label="Audit information"
              >
                {auditInfo.lastAccessed && (
                  <p aria-label={`Last accessed: ${auditInfo.lastAccessed}`}>
                    Last accessed: {auditInfo.lastAccessed}
                  </p>
                )}
                {auditInfo.accessedBy && (
                  <p aria-label={`Accessed by: ${auditInfo.accessedBy}`}>
                    By: {auditInfo.accessedBy}
                  </p>
                )}
                {auditInfo.actionRequired && (
                  <Chip 
                    color="warning" 
                    size="sm" 
                    variant="flat" 
                    className="mt-1"
                    aria-label="Action required"
                    role="alert"
                  >
                    Action Required
                  </Chip>
                )}
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </>
  )
}

/**
 * Healthcare Card Presets - Pre-configured card configurations for common healthcare workflows
 */
export const HealthcareCardPresets = {
  patientActive: {
    variant: 'patient' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'restricted' as const,
    status: {
      type: 'success' as const,
      label: 'Active Patient'
    }
  },
  professionalActive: {
    variant: 'professional' as const,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    status: {
      type: 'success' as const,
      label: 'Verified Professional'
    }
  },
  appointmentScheduled: {
    variant: 'appointment' as const,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'restricted' as const,
    status: {
      type: 'info' as const,
      label: 'Scheduled'
    }
  },
  emergencyAlert: {
    variant: 'emergency' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'emergency' as const,
    isEmergency: true,
    status: {
      type: 'danger' as const,
      label: 'Emergency Alert'
    }
  },
  medicalRecord: {
    variant: 'medical' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    status: {
      type: 'info' as const,
      label: 'Medical Record'
    }
  },
  complianceAudit: {
    variant: 'compliance' as const,
    complianceLevel: 'Law25' as const,
    accessLevel: 'restricted' as const,
    status: {
      type: 'warning' as const,
      label: 'Compliance Review'
    }
  }
} as const