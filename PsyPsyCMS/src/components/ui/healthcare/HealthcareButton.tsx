import React from 'react'
import { Button, ButtonProps } from '@/components/ui/nextui'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { designTokens } from '@/ui/design-tokens'

interface HealthcareButtonProps extends Omit<ButtonProps, 'color' | 'variant'> {
  /**
   * Healthcare-specific button variants
   */
  variant?:
    | 'primary'      // Main actions (schedule, save, confirm)
    | 'secondary'    // Secondary actions (cancel, back)
    | 'success'      // Positive actions (approve, complete)
    | 'warning'      // Caution actions (pending, review)
    | 'danger'       // Critical actions (delete, emergency)
    | 'phi'          // PHI-related actions (access protected data)
    | 'compliance'   // Compliance actions (audit, consent)

  /**
   * Healthcare-specific sizes
   */
  size?: 'compact' | 'standard' | 'comfortable'

  /**
   * Loading state with healthcare-appropriate spinner
   */
  isLoading?: boolean

  /**
   * PHI data warning indicator
   */
  containsPHI?: boolean

  /**
   * Compliance level requirement
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Audit logging enabled
   */
  auditAction?: string

  /**
   * Emergency action indicator
   */
  isEmergency?: boolean
}

/**
 * HealthcareButton - NextUI Button with healthcare-specific variants and HIPAA compliance
 *
 * @example
 * ```tsx
 * <HealthcareButton
 *   variant="primary"
 *   size="standard"
 *   onClick={handleScheduleAppointment}
 * >
 *   Schedule Appointment
 * </HealthcareButton>
 *
 * <HealthcareButton
 *   variant="danger"
 *   isEmergency
 *   complianceLevel="HIPAA"
 *   auditAction="emergency_action"
 * >
 *   Emergency Protocol
 * </HealthcareButton>
 * ```
 */

/**
 * Healthcare Button Presets - Pre-configured button configurations for common healthcare workflows
 */
export const HealthcareButtonPresets = {
  scheduleAppointment: {
    variant: 'primary' as const,
    size: 'standard' as const,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'schedule_appointment',
  },
  viewMedicalRecord: {
    variant: 'phi' as const,
    size: 'standard' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'view_medical_record',
  },
  emergencyProtocol: {
    variant: 'danger' as const,
    size: 'comfortable' as const,
    isEmergency: true,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'emergency_protocol',
  },
  consentManagement: {
    variant: 'compliance' as const,
    size: 'standard' as const,
    complianceLevel: 'Law25' as const,
    auditAction: 'consent_management',
  },
  signDocument: {
    variant: 'success' as const,
    size: 'standard' as const,
    complianceLevel: 'PIPEDA' as const,
    auditAction: 'sign_document',
  },
  reviewRequired: {
    variant: 'warning' as const,
    size: 'standard' as const,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'review_required',
  },
} as const

export function HealthcareButton({
  variant = 'primary',
  size = 'standard',
  isLoading = false,
  containsPHI = false,
  complianceLevel,
  auditAction,
  isEmergency = false,
  className,
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: HealthcareButtonProps) {
  // Generate unique IDs for accessibility
  const buttonId = React.useId()
  const descriptionId = `${buttonId}-description`
  
  // Map healthcare variants to NextUI variants and colors with WCAG AAA compliance
  const getButtonProps = () => {
    switch (variant) {
      case 'primary':
        return { 
          color: 'primary' as const, 
          variant: 'solid' as const,
          'aria-label': ariaLabel || 'Primary action button'
        }
      case 'secondary':
        return { 
          color: 'default' as const, 
          variant: 'bordered' as const,
          'aria-label': ariaLabel || 'Secondary action button'
        }
      case 'success':
        return { 
          color: 'success' as const, 
          variant: 'solid' as const,
          'aria-label': ariaLabel || 'Success action button'
        }
      case 'warning':
        return { 
          color: 'warning' as const, 
          variant: 'solid' as const,
          'aria-label': ariaLabel || 'Warning action button - requires attention'
        }
      case 'danger':
        return { 
          color: 'danger' as const, 
          variant: 'solid' as const,
          'aria-label': ariaLabel || 'Critical action button - proceed with caution'
        }
      case 'phi':
        return { 
          color: 'secondary' as const, 
          variant: 'solid' as const,
          'aria-label': ariaLabel || 'Protected health information action - HIPAA compliant'
        }
      case 'compliance':
        return { 
          color: 'default' as const, 
          variant: 'flat' as const,
          'aria-label': ariaLabel || 'Compliance action button'
        }
      default:
        return { 
          color: 'primary' as const, 
          variant: 'solid' as const,
          'aria-label': ariaLabel || 'Action button'
        }
    }
  }

  // Map healthcare sizes to NextUI sizes with WCAG AAA touch targets
  const getSize = () => {
    switch (size) {
      case 'compact':
        return 'sm' as const // Still maintains 44px minimum height
      case 'standard':
        return 'md' as const
      case 'comfortable':
        return 'lg' as const
      default:
        return 'md' as const
    }
  }

  const buttonProps = getButtonProps()
  const nextUISize = getSize()

  // Enhanced click handler with accessibility announcements
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Audit logging for healthcare actions
    if (auditAction && complianceLevel) {
      console.log(`[Healthcare Audit] Action: ${auditAction}, Compliance: ${complianceLevel}`, {
        timestamp: new Date().toISOString(),
        containsPHI,
        isEmergency,
        variant,
        accessibility: {
          hasAriaLabel: !!ariaLabel,
          hasDescription: !!ariaDescribedBy,
          isEmergency,
          containsPHI
        }
      })
    }

    // Announce action to screen readers for critical actions
    if (isEmergency || variant === 'danger') {
      const announcement = isEmergency 
        ? 'Emergency protocol activated'
        : 'Critical action performed'
      
      // Create temporary live region for announcement
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'assertive')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      liveRegion.textContent = announcement
      document.body.appendChild(liveRegion)
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion)
      }, 1000)
    }

    // Call the original onClick handler
    if (onClick && !disabled && !isLoading) {
      onClick(event)
    }
  }

  // Enhanced keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enhanced keyboard support for healthcare workflows
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent double-firing for space key
      if (event.key === ' ') {
        event.preventDefault()
      }
      handleClick(event as any)
    }
    
    // Emergency shortcut (Ctrl+E for emergency actions)
    if (isEmergency && event.ctrlKey && event.key === 'e') {
      event.preventDefault()
      handleClick(event as any)
    }
  }

  // Generate accessibility description
  const getAccessibilityDescription = () => {
    const descriptions = []
    
    if (containsPHI) {
      descriptions.push('Contains protected health information')
    }
    
    if (complianceLevel) {
      descriptions.push(`${complianceLevel} compliance required`)
    }
    
    if (isEmergency) {
      descriptions.push('Emergency action - immediate attention required')
    }
    
    if (isLoading) {
      descriptions.push('Action in progress, please wait')
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
      
      <Button
        {...buttonProps}
        size={nextUISize}
        className={cn(
          // Base healthcare button styles using design tokens
          'font-medium focus-visible:outline-none',
          `transition-all ${designTokens.animation.duration.base}`,
          `${designTokens.animation.easing.easeInOut}`,

          // WCAG AAA Focus indicators (2px minimum, high contrast)
          'focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-blue-600 focus-visible:ring-offset-white',
          'dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-gray-900',

          // PHI data indicator using healthcare colors with enhanced contrast
          containsPHI && 'ring-2 ring-opacity-70',
          containsPHI && `ring-[${designTokens.colors.compliance.phi}]`,
          containsPHI && 'shadow-md',

          // Emergency indicator with enhanced visual prominence
          isEmergency && `shadow-lg animate-pulse`,
          isEmergency && `shadow-[${designTokens.colors.alert.critical}]/30`,
          isEmergency && 'border-2 border-red-500',

          // Compliance indicator using design tokens
          complianceLevel && 'border-l-4',
          complianceLevel && `border-l-[${designTokens.colors.interactive.primary}]`,

          // Loading state with clear visual feedback
          isLoading && 'cursor-not-allowed opacity-70',
          isLoading && 'animate-pulse',

          // WCAG AAA minimum touch target (44px) - enforced
          `min-h-[${designTokens.accessibility.minTouchTarget}]`,
          `min-w-[${designTokens.accessibility.minTouchTarget}]`,

          // Enhanced hover states for better user feedback
          'hover:scale-105 active:scale-95',
          'disabled:hover:scale-100 disabled:active:scale-100',

          // High contrast mode support
          'contrast-more:border-2 contrast-more:border-current',

          className
        )}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-describedby={cn(
          accessibilityDescription ? descriptionId : undefined,
          ariaDescribedBy
        )}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        // Enhanced ARIA attributes for healthcare context
        role="button"
        tabIndex={disabled ? -1 : 0}
        startContent={
          isLoading ? (
            <Loader2 
              className="h-4 w-4 animate-spin" 
              aria-hidden="true"
              role="img"
              aria-label="Loading"
            />
          ) : undefined
        }
        {...props}
      >
        {/* Ensure button text is always accessible */}
        <span aria-hidden={isLoading}>
          {children}
        </span>
      </Button>
    </>
  )
}