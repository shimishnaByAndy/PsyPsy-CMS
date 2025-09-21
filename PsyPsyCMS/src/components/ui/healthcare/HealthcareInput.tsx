import React from 'react'
import { Input, Textarea, InputProps, TextAreaProps, Badge } from '@/components/ui/nextui'
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BaseHealthcareInputProps {
  /**
   * Healthcare-specific input types
   */
  healthcareType?:
    | 'patient-name'        // Patient full name
    | 'medical-id'          // Medical record numbers, patient IDs
    | 'professional-id'     // Professional license numbers
    | 'phone-medical'       // Healthcare phone numbers
    | 'email-medical'       // Medical email addresses
    | 'address-medical'     // Patient addresses
    | 'notes-clinical'      // Clinical notes and observations
    | 'emergency-contact'   // Emergency contact information
    | 'insurance-info'      // Insurance details
    | 'medication'          // Medication information
    | 'diagnosis'           // Diagnosis codes and descriptions

  /**
   * PHI (Protected Health Information) classification
   */
  containsPHI?: boolean

  /**
   * Compliance requirements
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Access level required to view/edit
   */
  accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'

  /**
   * Validation state with healthcare-specific messages
   */
  validation?: {
    isValid?: boolean
    message?: string
    type?: 'error' | 'warning' | 'success' | 'info'
  }

  /**
   * Audit logging
   */
  auditAction?: string

  /**
   * Emergency flag for critical inputs
   */
  isEmergency?: boolean

  /**
   * Read-only state with reason
   */
  readOnlyReason?: string

  /**
   * Mask PHI data when not focused
   */
  maskPHI?: boolean
}

interface HealthcareInputProps extends Omit<InputProps, 'type'>, BaseHealthcareInputProps {
  /**
   * Input type (extends HTML input types)
   */
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'datetime-local'
}

interface HealthcareTextareaProps extends TextAreaProps, BaseHealthcareInputProps {}

/**
 * HealthcareInput - NextUI Input optimized for healthcare data with HIPAA compliance
 */
export function HealthcareInput({
  healthcareType = 'patient-name',
  containsPHI = false,
  complianceLevel,
  accessLevel = 'public',
  validation,
  auditAction,
  isEmergency = false,
  readOnlyReason,
  maskPHI = false,
  className,
  onFocus,
  onBlur,
  ...props
}: HealthcareInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [showMasked, setShowMasked] = React.useState(maskPHI && containsPHI)

  // Get healthcare type specific properties
  const getHealthcareTypeProps = () => {
    switch (healthcareType) {
      case 'patient-name':
        return {
          placeholder: 'Enter patient full name',
          maxLength: 100,
          autoComplete: 'name' as const,
        }
      case 'medical-id':
        return {
          placeholder: 'MRN-12345',
          pattern: '[A-Z0-9-]+',
          autoComplete: 'off' as const,
        }
      case 'professional-id':
        return {
          placeholder: 'License Number',
          pattern: '[A-Z0-9-]+',
          autoComplete: 'off' as const,
        }
      case 'phone-medical':
        return {
          placeholder: '(555) 123-4567',
          type: 'tel' as const,
          autoComplete: 'tel' as const,
        }
      case 'email-medical':
        return {
          placeholder: 'patient@email.com',
          type: 'email' as const,
          autoComplete: 'email' as const,
        }
      case 'emergency-contact':
        return {
          placeholder: 'Emergency contact name',
          autoComplete: 'name' as const,
        }
      case 'insurance-info':
        return {
          placeholder: 'Insurance policy number',
          autoComplete: 'off' as const,
        }
      default:
        return {}
    }
  }

  // Get validation color
  const getValidationColor = () => {
    if (!validation) return 'primary'

    switch (validation.type) {
      case 'error':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'success':
        return 'success'
      case 'info':
        return 'primary'
      default:
        return 'primary'
    }
  }

  // Get start content based on healthcare type and state
  const getStartContent = () => {
    const icons = []

    // PHI indicator
    if (containsPHI) {
      icons.push(
        <Badge key="phi" color="warning" variant="flat" size="sm" content="PHI">
          <Shield className="h-4 w-4 text-purple-500" />
        </Badge>
      )
    }

    // Access level indicator
    if (accessLevel === 'confidential') {
      icons.push(<Lock key="lock" className="h-4 w-4 text-red-500" />)
    } else if (accessLevel === 'emergency') {
      icons.push(<AlertTriangle key="emergency" className="h-4 w-4 text-red-600" />)
    }

    // Validation indicator
    if (validation?.isValid === true) {
      icons.push(<CheckCircle key="valid" className="h-4 w-4 text-green-500" />)
    }

    return icons.length > 0 ? <div className="flex gap-1">{icons}</div> : undefined
  }

  // Get end content (show/hide for masked PHI)
  const getEndContent = () => {
    if (maskPHI && containsPHI) {
      return (
        <button
          type="button"
          onClick={() => setShowMasked(!showMasked)}
          className="focus:outline-none"
          aria-label={showMasked ? 'Show data' : 'Hide data'}
        >
          {showMasked ? (
            <Eye className="h-4 w-4 text-default-400" />
          ) : (
            <EyeOff className="h-4 w-4 text-default-400" />
          )}
        </button>
      )
    }
    return undefined
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    setShowMasked(false) // Always show actual data when focused

    // Audit logging for PHI access
    if (containsPHI && auditAction) {
      console.log('[Healthcare Audit] PHI Input Access:', {
        action: auditAction,
        healthcareType,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }

    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (maskPHI && containsPHI) {
      setShowMasked(true) // Mask again when not focused
    }
    onBlur?.(e)
  }

  const healthcareProps = getHealthcareTypeProps()

  return (
    <Input
      {...healthcareProps}
      {...props}
      color={getValidationColor()}
      className={cn(
        // Base healthcare input styling
        'transition-all duration-200',

        // PHI data styling
        containsPHI && 'ring-1 ring-purple-100',

        // Emergency styling
        isEmergency && 'ring-2 ring-red-200 bg-red-50/30',

        // Focused state for PHI
        isFocused && containsPHI && 'ring-2 ring-purple-300',

        // Read-only state
        readOnlyReason && 'opacity-70 cursor-not-allowed',

        className
      )}
      startContent={getStartContent()}
      endContent={getEndContent()}
      onFocus={handleFocus}
      onBlur={handleBlur}
      isReadOnly={!!readOnlyReason}
      description={
        validation?.message ||
        readOnlyReason ||
        (containsPHI && 'Contains Protected Health Information')
      }
      errorMessage={validation?.type === 'error' ? validation.message : undefined}
      // Mask value if needed
      value={showMasked && props.value ? '••••••••••' : props.value}
    />
  )
}

/**
 * HealthcareTextarea - NextUI Textarea optimized for healthcare notes with HIPAA compliance
 */
export function HealthcareTextarea({
  healthcareType = 'notes-clinical',
  containsPHI = false,
  complianceLevel,
  accessLevel = 'public',
  validation,
  auditAction,
  isEmergency = false,
  readOnlyReason,
  className,
  onFocus,
  onBlur,
  ...props
}: HealthcareTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  // Get healthcare type specific properties
  const getHealthcareTypeProps = () => {
    switch (healthcareType) {
      case 'notes-clinical':
        return {
          placeholder: 'Enter clinical notes and observations...',
          minRows: 4,
          maxRows: 8,
        }
      case 'diagnosis':
        return {
          placeholder: 'Enter diagnosis details...',
          minRows: 3,
          maxRows: 6,
        }
      case 'medication':
        return {
          placeholder: 'Enter medication information...',
          minRows: 2,
          maxRows: 4,
        }
      case 'address-medical':
        return {
          placeholder: 'Enter complete address...',
          minRows: 2,
          maxRows: 3,
        }
      default:
        return {
          minRows: 3,
          maxRows: 6,
        }
    }
  }

  const getValidationColor = () => {
    if (!validation) return 'primary'

    switch (validation.type) {
      case 'error':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'success':
        return 'success'
      case 'info':
        return 'primary'
      default:
        return 'primary'
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)

    // Audit logging for PHI access
    if (containsPHI && auditAction) {
      console.log('[Healthcare Audit] PHI Textarea Access:', {
        action: auditAction,
        healthcareType,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }

    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const healthcareProps = getHealthcareTypeProps()

  return (
    <Textarea
      {...healthcareProps}
      {...props}
      color={getValidationColor()}
      className={cn(
        // Base healthcare textarea styling
        'transition-all duration-200',

        // PHI data styling
        containsPHI && 'ring-1 ring-purple-100',

        // Emergency styling
        isEmergency && 'ring-2 ring-red-200 bg-red-50/30',

        // Focused state for PHI
        isFocused && containsPHI && 'ring-2 ring-purple-300',

        // Read-only state
        readOnlyReason && 'opacity-70 cursor-not-allowed',

        className
      )}
      onFocus={handleFocus}
      onBlur={handleBlur}
      isReadOnly={!!readOnlyReason}
      description={
        validation?.message ||
        readOnlyReason ||
        (containsPHI && 'Contains Protected Health Information')
      }
      errorMessage={validation?.type === 'error' ? validation.message : undefined}
    />
  )
}

// Predefined healthcare input configurations
export const HealthcareInputPresets = {
  // Patient Information
  patientName: {
    healthcareType: 'patient-name' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
  },

  patientPhone: {
    healthcareType: 'phone-medical' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    maskPHI: true,
  },

  medicalRecordNumber: {
    healthcareType: 'medical-id' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    maskPHI: true,
  },

  // Clinical Notes
  clinicalNotes: {
    healthcareType: 'notes-clinical' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
  },

  emergencyNotes: {
    healthcareType: 'notes-clinical' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'emergency' as const,
    isEmergency: true,
  },

  // Professional Information
  licenseNumber: {
    healthcareType: 'professional-id' as const,
    accessLevel: 'restricted' as const,
    complianceLevel: 'HIPAA' as const,
  },

  // Insurance and Billing
  insuranceInfo: {
    healthcareType: 'insurance-info' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    maskPHI: true,
  },
} as const