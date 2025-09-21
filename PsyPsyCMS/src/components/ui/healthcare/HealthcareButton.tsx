import React from 'react'
import { Button, ButtonProps } from '@/components/ui/nextui'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  ...props
}: HealthcareButtonProps) {
  // Map healthcare variants to NextUI variants and colors
  const getButtonProps = () => {
    switch (variant) {
      case 'primary':
        return { color: 'primary' as const, variant: 'solid' as const }
      case 'secondary':
        return { color: 'default' as const, variant: 'bordered' as const }
      case 'success':
        return { color: 'success' as const, variant: 'solid' as const }
      case 'warning':
        return { color: 'warning' as const, variant: 'solid' as const }
      case 'danger':
        return { color: 'danger' as const, variant: 'solid' as const }
      case 'phi':
        return { color: 'secondary' as const, variant: 'solid' as const }
      case 'compliance':
        return { color: 'default' as const, variant: 'flat' as const }
      default:
        return { color: 'primary' as const, variant: 'solid' as const }
    }
  }

  // Map healthcare sizes to NextUI sizes
  const getSize = () => {
    switch (size) {
      case 'compact':
        return 'sm' as const
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Audit logging for healthcare actions
    if (auditAction && complianceLevel) {
      console.log(`[Healthcare Audit] Action: ${auditAction}, Compliance: ${complianceLevel}`, {
        timestamp: new Date().toISOString(),
        containsPHI,
        isEmergency,
        variant,
      })
    }

    // Call the original onClick handler
    if (onClick && !disabled && !isLoading) {
      onClick(event)
    }
  }

  return (
    <Button
      {...buttonProps}
      size={nextUISize}
      className={cn(
        // Base healthcare button styles
        'font-medium transition-all duration-200',

        // PHI data indicator
        containsPHI && 'ring-2 ring-purple-200 ring-opacity-50',

        // Emergency indicator
        isEmergency && 'shadow-lg shadow-red-200 animate-pulse',

        // Compliance indicator
        complianceLevel && 'border-l-4 border-l-blue-500',

        // Loading state
        isLoading && 'cursor-not-allowed opacity-70',

        className
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
      startContent={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
      {...props}
    >
      {children}
    </Button>
  )
}

// Predefined healthcare button configurations
export const HealthcareButtonPresets = {
  // Patient Management
  scheduleAppointment: {
    variant: 'primary' as const,
    size: 'standard' as const,
    auditAction: 'schedule_appointment',
    complianceLevel: 'HIPAA' as const,
  },

  viewMedicalRecord: {
    variant: 'phi' as const,
    size: 'standard' as const,
    containsPHI: true,
    auditAction: 'view_medical_record',
    complianceLevel: 'HIPAA' as const,
  },

  // Emergency Actions
  emergencyProtocol: {
    variant: 'danger' as const,
    size: 'comfortable' as const,
    isEmergency: true,
    auditAction: 'emergency_protocol',
    complianceLevel: 'HIPAA' as const,
  },

  // Compliance Actions
  consentManagement: {
    variant: 'compliance' as const,
    size: 'standard' as const,
    auditAction: 'consent_management',
    complianceLevel: 'Law25' as const,
  },

  // Professional Actions
  signDocument: {
    variant: 'success' as const,
    size: 'standard' as const,
    auditAction: 'document_signature',
    complianceLevel: 'HIPAA' as const,
  },

  reviewRequired: {
    variant: 'warning' as const,
    size: 'standard' as const,
    auditAction: 'review_required',
    complianceLevel: 'HIPAA' as const,
  },
} as const