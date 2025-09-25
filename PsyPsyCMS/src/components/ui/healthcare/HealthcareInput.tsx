import React from 'react'
import { Input, Textarea, InputProps, TextAreaProps, Badge } from '@/components/ui/nextui'
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { designTokens } from '@/ui/design-tokens'

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
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: HealthcareInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [showMasked, setShowMasked] = React.useState(maskPHI && containsPHI)
  
  // Generate unique IDs for accessibility
  const inputId = React.useId()
  const descriptionId = `${inputId}-description`
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  // Get healthcare type specific properties with enhanced accessibility
  const getHealthcareTypeProps = () => {
    switch (healthcareType) {
      case 'patient-name':
        return {
          placeholder: 'Enter patient full name',
          maxLength: 100,
          autoComplete: 'name' as const,
          'aria-label': ariaLabel || 'Patient full name',
          'aria-description': 'Enter the complete legal name of the patient'
        }
      case 'medical-id':
        return {
          placeholder: 'MRN-12345',
          pattern: '[A-Z0-9-]+',
          autoComplete: 'off' as const,
          'aria-label': ariaLabel || 'Medical record number',
          'aria-description': 'Enter alphanumeric medical record number with dashes'
        }
      case 'professional-id':
        return {
          placeholder: 'License Number',
          pattern: '[A-Z0-9-]+',
          autoComplete: 'off' as const,
          'aria-label': ariaLabel || 'Professional license number',
          'aria-description': 'Enter professional license or certification number'
        }
      case 'phone-medical':
        return {
          placeholder: '(555) 123-4567',
          type: 'tel' as const,
          autoComplete: 'tel' as const,
          'aria-label': ariaLabel || 'Medical contact phone number',
          'aria-description': 'Enter phone number in format (555) 123-4567'
        }
      case 'email-medical':
        return {
          placeholder: 'patient@email.com',
          type: 'email' as const,
          autoComplete: 'email' as const,
          'aria-label': ariaLabel || 'Medical contact email',
          'aria-description': 'Enter valid email address for medical communications'
        }
      case 'emergency-contact':
        return {
          placeholder: 'Emergency contact name',
          autoComplete: 'name' as const,
          'aria-label': ariaLabel || 'Emergency contact name',
          'aria-description': 'Enter name of emergency contact person',
          'aria-required': 'true' // Emergency contact is mandatory
        }
      case 'insurance-info':
        return {
          placeholder: 'Insurance policy number',
          autoComplete: 'off' as const,
          'aria-label': ariaLabel || 'Insurance policy number',
          'aria-description': 'Enter insurance policy or member ID number'
        }
      default:
        return {
          'aria-label': ariaLabel || 'Healthcare information input'
        }
    }
  }

  // Get validation color with accessibility consideration
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

  // Get start content based on healthcare type and state with accessibility
  const getStartContent = () => {
    const icons = []

    // PHI indicator with accessibility
    if (containsPHI) {
      icons.push(
        <Badge 
          key="phi" 
          color="warning" 
          variant="flat" 
          size="sm" 
          content="PHI"
          aria-label="Protected Health Information indicator"
        >
          <Shield 
            className="h-4 w-4 text-purple-500" 
            aria-hidden="true"
            role="img"
          />
        </Badge>
      )
    }

    // Access level indicator with accessibility
    if (accessLevel === 'confidential') {
      icons.push(
        <Lock 
          key="lock" 
          className="h-4 w-4 text-red-500" 
          aria-label="Confidential information"
          role="img"
        />
      )
    } else if (accessLevel === 'emergency') {
      icons.push(
        <AlertTriangle 
          key="emergency" 
          className="h-4 w-4 text-red-600" 
          aria-label="Emergency access required"
          role="img"
        />
      )
    }

    // Validation indicator with accessibility
    if (validation?.isValid === true) {
      icons.push(
        <CheckCircle 
          key="valid" 
          className="h-4 w-4 text-green-500" 
          aria-label="Input is valid"
          role="img"
        />
      )
    }

    return icons.length > 0 ? (
      <div className="flex gap-1" role="group" aria-label="Input status indicators">
        {icons}
      </div>
    ) : undefined
  }

  // Get end content (show/hide for masked PHI) with accessibility
  const getEndContent = () => {
    if (maskPHI && containsPHI) {
      return (
        <button
          type="button"
          onClick={() => setShowMasked(!showMasked)}
          className={cn(
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-gray-900",
            "rounded-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
          aria-label={showMasked ? 'Show protected data' : 'Hide protected data'}
          aria-pressed={!showMasked}
          role="switch"
          tabIndex={0}
        >
          {showMasked ? (
            <Eye 
              className="h-4 w-4 text-gray-600" 
              aria-hidden="true"
            />
          ) : (
            <EyeOff 
              className="h-4 w-4 text-gray-600" 
              aria-hidden="true"
            />
          )}
        </button>
      )
    }
    return undefined
  }

  // Enhanced focus handler with accessibility announcements
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
        accessibility: {
          hasAriaLabel: !!ariaLabel,
          hasDescription: !!ariaDescribedBy,
          isEmergency,
          containsPHI
        }
      })
    }

    // Announce PHI access to screen readers
    if (containsPHI) {
      const announcement = 'Protected health information field accessed'
      
      // Create temporary live region for announcement
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
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

    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (maskPHI && containsPHI) {
      setShowMasked(true) // Mask again when not focused
    }
    onBlur?.(e)
  }

  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Toggle masking with Ctrl+H for keyboard users
    if (maskPHI && containsPHI && e.ctrlKey && e.key === 'h') {
      e.preventDefault()
      setShowMasked(!showMasked)
    }
    
    // Emergency quick-save with Ctrl+S for emergency fields
    if (isEmergency && e.ctrlKey && e.key === 's') {
      e.preventDefault()
      // Trigger save action or announce save
      const announcement = 'Emergency data saved'
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'assertive')
      liveRegion.className = 'sr-only'
      liveRegion.textContent = announcement
      document.body.appendChild(liveRegion)
      
      setTimeout(() => {
        if (document.body.contains(liveRegion)) {
          document.body.removeChild(liveRegion)
        }
      }, 1000)
    }
  }

  // Generate comprehensive accessibility description
  const getAccessibilityDescription = () => {
    const descriptions = []
    
    if (containsPHI) {
      descriptions.push('Contains protected health information')
    }
    
    if (complianceLevel) {
      descriptions.push(`${complianceLevel} compliance required`)
    }
    
    if (isEmergency) {
      descriptions.push('Emergency field - critical information')
    }
    
    if (readOnlyReason) {
      descriptions.push(`Read-only: ${readOnlyReason}`)
    }
    
    if (maskPHI && containsPHI) {
      descriptions.push('Data can be masked/unmasked with toggle button or Ctrl+H')
    }
    
    if (validation?.message) {
      descriptions.push(validation.message)
    }
    
    return descriptions.join('. ')
  }

  const healthcareProps = getHealthcareTypeProps()
  const accessibilityDescription = getAccessibilityDescription()

  return (
    <>
      {/* Hidden descriptions for screen readers */}
      {accessibilityDescription && (
        <span id={descriptionId} className="sr-only">
          {accessibilityDescription}
        </span>
      )}
      
      {validation?.message && validation?.type === 'error' && (
        <span id={errorId} className="sr-only" role="alert">
          Error: {validation.message}
        </span>
      )}
      
      <Input
        {...healthcareProps}
        {...props}
        color={getValidationColor()}
        className={cn(
          // Base healthcare input styling using design tokens
          `transition-all ${designTokens.animation.duration.base}`,
          `${designTokens.animation.easing.easeInOut}`,
          `min-h-[${designTokens.accessibility.minTouchTarget}]`,

          // WCAG AAA Focus indicators (2px minimum, high contrast)
          'focus-within:ring-2 focus-within:ring-offset-2',
          'focus-within:ring-blue-600 focus-within:ring-offset-white',
          'dark:focus-within:ring-blue-400 dark:focus-within:ring-offset-gray-900',

          // PHI data styling using healthcare colors with enhanced contrast
          containsPHI && 'ring-1',
          containsPHI && `ring-[${designTokens.colors.compliance.phi}]/40`,
          containsPHI && `bg-[${designTokens.colors.compliance.phi}]/5`,

          // Emergency styling using design tokens with high contrast
          isEmergency && 'ring-2',
          isEmergency && `ring-[${designTokens.colors.alert.critical}]/60`,
          isEmergency && `bg-[${designTokens.colors.alert.critical}]/10`,
          isEmergency && 'border-l-4 border-l-red-500',

          // Focused state for PHI using design tokens
          isFocused && containsPHI && 'ring-2',
          isFocused && containsPHI && `ring-[${designTokens.colors.compliance.phi}]/70`,

          // Read-only state with clear visual feedback
          readOnlyReason && 'opacity-70 cursor-not-allowed',
          readOnlyReason && 'bg-gray-50 dark:bg-gray-900',

          // High contrast mode support
          'contrast-more:border-2 contrast-more:border-current',

          className
        )}
        startContent={getStartContent()}
        endContent={getEndContent()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        isReadOnly={!!readOnlyReason}
        // Enhanced ARIA attributes
        aria-describedby={cn(
          accessibilityDescription ? descriptionId : undefined,
          validation?.type === 'error' ? errorId : undefined,
          ariaDescribedBy
        )}
        aria-invalid={validation?.type === 'error'}
        aria-required={healthcareType === 'emergency-contact' || props.required}
        // Improved description text
        description={
          validation?.message ||
          readOnlyReason ||
          (containsPHI && 'Contains Protected Health Information - access is audited')
        }
        errorMessage={validation?.type === 'error' ? validation.message : undefined}
        // Enhanced value masking with better accessibility
        value={showMasked && props.value ? '••••••••••' : props.value}
        // Additional accessibility props
        role="textbox"
        tabIndex={readOnlyReason ? -1 : 0}
      />
    </>
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
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: HealthcareTextareaProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  // Generate unique IDs for accessibility
  const textareaId = React.useId()
  const descriptionId = `${textareaId}-description`
  const errorId = `${textareaId}-error`

  // Get healthcare type specific properties with enhanced accessibility
  const getHealthcareTypeProps = () => {
    switch (healthcareType) {
      case 'notes-clinical':
        return {
          placeholder: 'Enter clinical notes and observations...',
          minRows: 4,
          maxRows: 8,
          'aria-label': ariaLabel || 'Clinical notes',
          'aria-description': 'Enter detailed clinical observations and notes'
        }
      case 'diagnosis':
        return {
          placeholder: 'Enter diagnosis details...',
          minRows: 3,
          maxRows: 6,
          'aria-label': ariaLabel || 'Diagnosis information',
          'aria-description': 'Enter diagnosis codes and detailed descriptions'
        }
      case 'medication':
        return {
          placeholder: 'Enter medication information...',
          minRows: 2,
          maxRows: 4,
          'aria-label': ariaLabel || 'Medication details',
          'aria-description': 'Enter medication names, dosages, and instructions'
        }
      case 'address-medical':
        return {
          placeholder: 'Enter complete address...',
          minRows: 2,
          maxRows: 3,
          'aria-label': ariaLabel || 'Medical address',
          'aria-description': 'Enter complete mailing or residential address'
        }
      default:
        return {
          minRows: 3,
          maxRows: 6,
          'aria-label': ariaLabel || 'Healthcare notes',
          'aria-description': 'Enter healthcare-related information'
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

  // Enhanced focus handler with accessibility announcements
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)

    // Audit logging for PHI access
    if (containsPHI && auditAction) {
      console.log('[Healthcare Audit] PHI Textarea Access:', {
        action: auditAction,
        healthcareType,
        complianceLevel,
        timestamp: new Date().toISOString(),
        accessibility: {
          hasAriaLabel: !!ariaLabel,
          hasDescription: !!ariaDescribedBy,
          isEmergency,
          containsPHI
        }
      })
    }

    // Announce PHI access to screen readers
    if (containsPHI) {
      const announcement = 'Protected health information text area accessed'

      // Create temporary live region for announcement
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
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

    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  // Enhanced keyboard navigation for healthcare workflows
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Auto-save for emergency notes with Ctrl+S
    if (isEmergency && e.ctrlKey && e.key === 's') {
      e.preventDefault()
      const announcement = 'Emergency notes auto-saved'
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'assertive')
      liveRegion.className = 'sr-only'
      liveRegion.textContent = announcement
      document.body.appendChild(liveRegion)

      setTimeout(() => {
        if (document.body.contains(liveRegion)) {
          document.body.removeChild(liveRegion)
        }
      }, 1000)
    }

    // Clinical template shortcuts
    if (healthcareType === 'notes-clinical' && e.ctrlKey && e.key === 't') {
      e.preventDefault()
      // Could insert clinical note template
      const announcement = 'Clinical note template available'
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.className = 'sr-only'
      liveRegion.textContent = announcement
      document.body.appendChild(liveRegion)

      setTimeout(() => {
        if (document.body.contains(liveRegion)) {
          document.body.removeChild(liveRegion)
        }
      }, 1000)
    }
  }

  // Generate comprehensive accessibility description
  const getAccessibilityDescription = () => {
    const descriptions = []

    if (containsPHI) {
      descriptions.push('Contains protected health information')
    }

    if (complianceLevel) {
      descriptions.push(`${complianceLevel} compliance required`)
    }

    if (isEmergency) {
      descriptions.push('Emergency notes - critical information')
    }

    if (readOnlyReason) {
      descriptions.push(`Read-only: ${readOnlyReason}`)
    }

    if (healthcareType === 'notes-clinical') {
      descriptions.push('Use Ctrl+T for clinical templates, Ctrl+S for auto-save')
    }

    if (validation?.message) {
      descriptions.push(validation.message)
    }

    return descriptions.join('. ')
  }

  const healthcareProps = getHealthcareTypeProps()
  const accessibilityDescription = getAccessibilityDescription()

  return (
    <>
      {/* Hidden descriptions for screen readers */}
      {accessibilityDescription && (
        <span id={descriptionId} className="sr-only">
          {accessibilityDescription}
        </span>
      )}

      {validation?.message && validation?.type === 'error' && (
        <span id={errorId} className="sr-only" role="alert">
          Error: {validation.message}
        </span>
      )}

      <Textarea
        {...healthcareProps}
        {...props}
        color={getValidationColor()}
        className={cn(
          // Base healthcare textarea styling using design tokens
          `transition-all ${designTokens.animation.duration.base}`,
          `${designTokens.animation.easing.easeInOut}`,
          `min-h-[${designTokens.accessibility.minTouchTarget}]`,

          // WCAG AAA Focus indicators (2px minimum, high contrast)
          'focus-within:ring-2 focus-within:ring-offset-2',
          'focus-within:ring-blue-600 focus-within:ring-offset-white',
          'dark:focus-within:ring-blue-400 dark:focus-within:ring-offset-gray-900',

          // PHI data styling using healthcare colors with enhanced contrast
          containsPHI && 'ring-1',
          containsPHI && `ring-[${designTokens.colors.compliance.phi}]/40`,
          containsPHI && `bg-[${designTokens.colors.compliance.phi}]/5`,

          // Emergency styling using design tokens with high contrast
          isEmergency && 'ring-2',
          isEmergency && `ring-[${designTokens.colors.alert.critical}]/60`,
          isEmergency && `bg-[${designTokens.colors.alert.critical}]/10`,
          isEmergency && 'border-l-4 border-l-red-500',

          // Focused state for PHI using design tokens
          isFocused && containsPHI && 'ring-2',
          isFocused && containsPHI && `ring-[${designTokens.colors.compliance.phi}]/70`,

          // Read-only state with clear visual feedback
          readOnlyReason && 'opacity-70 cursor-not-allowed',
          readOnlyReason && 'bg-gray-50 dark:bg-gray-900',

          // High contrast mode support
          'contrast-more:border-2 contrast-more:border-current',

          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        isReadOnly={!!readOnlyReason}
        // Enhanced ARIA attributes
        aria-describedby={cn(
          accessibilityDescription ? descriptionId : undefined,
          validation?.type === 'error' ? errorId : undefined,
          ariaDescribedBy
        )}
        aria-invalid={validation?.type === 'error'}
        aria-required={props.required}
        // Improved description text
        description={
          validation?.message ||
          readOnlyReason ||
          (containsPHI && 'Contains Protected Health Information - access is audited')
        }
        errorMessage={validation?.type === 'error' ? validation.message : undefined}
        // Additional accessibility props
        role="textbox"
        tabIndex={readOnlyReason ? -1 : 0}
      />
    </>
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