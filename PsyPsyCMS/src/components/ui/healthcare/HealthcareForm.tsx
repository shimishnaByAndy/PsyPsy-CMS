import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Divider } from '@/components/ui/nextui'
import { AlertCircle, Shield, CheckCircle2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { designTokens } from '@/ui/design-tokens'
import { HealthcareButton } from './HealthcareButton'

interface HealthcareFormProps {
  /**
   * Form title
   */
  title?: string

  /**
   * Form description
   */
  description?: string

  /**
   * Form variant for different healthcare contexts
   */
  variant?: 'patient' | 'professional' | 'medical' | 'compliance' | 'emergency'

  /**
   * PHI data in form
   */
  containsPHI?: boolean

  /**
   * Compliance requirements
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Form validation state
   */
  validation?: {
    isValid?: boolean
    errors?: string[]
    warnings?: string[]
  }

  /**
   * Emergency form flag
   */
  isEmergency?: boolean

  /**
   * Read-only state
   */
  isReadOnly?: boolean

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Form content
   */
  children: React.ReactNode

  /**
   * Custom actions (overrides default submit/cancel)
   */
  actions?: React.ReactNode

  /**
   * Submit handler
   */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void

  /**
   * Cancel handler
   */
  onCancel?: () => void

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Accessibility props
   */
  'aria-label'?: string
  'aria-describedby'?: string
}

export function HealthcareForm({
  title,
  description,
  variant = 'patient',
  containsPHI = false,
  complianceLevel,
  validation,
  isEmergency = false,
  isReadOnly = false,
  isLoading = false,
  children,
  actions,
  onSubmit,
  onCancel,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: HealthcareFormProps) {
  // Generate unique IDs for accessibility
  const formId = React.useId()
  const headingId = `${formId}-heading`
  const descriptionId = `${formId}-description`
  const errorId = `${formId}-errors`
  const warningId = `${formId}-warnings`
  const successId = `${formId}-success`

  // Get variant-specific styling with accessibility descriptions
  const getVariantStyles = () => {
    switch (variant) {
      case 'patient':
        return {
          borderColor: designTokens.colors.medical.success,
          bgColor: 'bg-white dark:bg-gray-900',
          description: 'Patient information form'
        }
      case 'professional':
        return {
          borderColor: designTokens.colors.primary.main,
          bgColor: 'bg-white dark:bg-gray-900',
          description: 'Professional healthcare form'
        }
      case 'medical':
        return {
          borderColor: designTokens.colors.medical.critical,
          bgColor: 'bg-white dark:bg-gray-900',
          description: 'Medical information form'
        }
      case 'compliance':
        return {
          borderColor: designTokens.colors.compliance.phi,
          bgColor: 'bg-white dark:bg-gray-900',
          description: 'Compliance documentation form'
        }
      case 'emergency':
        return {
          borderColor: designTokens.colors.alert.critical,
          bgColor: 'bg-red-50 dark:bg-red-950',
          description: 'Emergency form - immediate attention required'
        }
      default:
        return {
          borderColor: designTokens.colors.primary.main,
          bgColor: 'bg-white dark:bg-gray-900',
          description: 'Healthcare form'
        }
    }
  }

  const variantStyles = getVariantStyles()

  // Handle form submission with audit logging
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isReadOnly) {
      event.preventDefault()
      return
    }

    // Audit form submission
    console.log('Healthcare form submitted:', {
      variant,
      containsPHI,
      complianceLevel,
      isEmergency,
      timestamp: new Date().toISOString()
    })

    onSubmit?.(event)
  }

  // Accessibility description compilation
  const getAriaDescribedBy = () => {
    const ids = []
    if (description) ids.push(descriptionId)
    if (validation?.errors?.length) ids.push(errorId)
    if (validation?.warnings?.length) ids.push(warningId)
    if (validation?.isValid) ids.push(successId)
    if (ariaDescribedBy) ids.push(ariaDescribedBy)
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  const renderValidation = () => {
    if (!validation) return null

    return (
      <div className="space-y-3">
        {validation.errors && validation.errors.length > 0 && (
          <div
            id={errorId}
            className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
            aria-label="Form validation errors"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Validation Errors
              </span>
            </div>
            <ul className="text-sm space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-red-600 dark:text-red-400">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings && validation.warnings.length > 0 && (
          <div
            id={warningId}
            className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            role="alert"
            aria-label="Form warnings"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Warnings
              </span>
            </div>
            <ul className="text-sm space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-yellow-600 dark:text-yellow-400">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validation.isValid && (
          <div
            id={successId}
            className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
            role="status"
            aria-label="Form validation passed"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Form validation passed
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDefaultActions = () => {
    if (actions) return actions

    return (
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <HealthcareButton
            variant="secondary"
            size="standard"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </HealthcareButton>
        )}
        <HealthcareButton
          variant={isEmergency ? 'danger' : 'primary'}
          size="standard"
          type="submit"
          isLoading={isLoading}
          complianceLevel={complianceLevel}
          auditAction={`form_submit_${variant}`}
          isEmergency={isEmergency}
        >
          {isEmergency ? 'Emergency Submit' : 'Submit'}
        </HealthcareButton>
      </div>
    )
  }

  return (
    <>
      <Card
        className={cn(
          'w-full max-w-4xl mx-auto shadow-lg',

          // Variant-specific styling
          variantStyles.bgColor,

          // Emergency state styling
          isEmergency && 'ring-4 ring-red-500/50 animate-pulse',

          // PHI indicator styling
          containsPHI && 'border-l-4 border-l-purple-500',

          // Read-only state styling
          isReadOnly && 'opacity-75 bg-gray-50 dark:bg-gray-850',

          // WCAG AAA accessibility: Minimum 44px touch targets
          `min-w-[${designTokens.accessibility.minTouchTarget}]`,

          // Enhanced hover states for better user feedback
          'hover:scale-[1.01] active:scale-[0.99]',
          'disabled:hover:scale-100 disabled:active:scale-100',

          // High contrast mode support
          'contrast-more:border-4 contrast-more:border-current',

          className
        )}
        role="region"
        aria-label={ariaLabel || variantStyles.description}
        aria-describedby={getAriaDescribedBy()}
      >
        <form
          id={formId}
          onSubmit={handleSubmit}
          noValidate
          aria-label={ariaLabel || `${variantStyles.description} form`}
        >
          {(title || description || containsPHI || isEmergency) && (
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {title && (
                    <h2
                      id={headingId}
                      className="text-xl font-semibold mb-2"
                    >
                      {title}
                    </h2>
                  )}

                  {description && (
                    <p
                      id={descriptionId}
                      className="text-default-600 mb-3"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-2 ml-4">
                  {containsPHI && (
                    <div
                      className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full"
                      title="Contains Protected Health Information"
                    >
                      <Shield className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        PHI
                      </span>
                    </div>
                  )}

                  {isEmergency && (
                    <div
                      className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 rounded-full"
                      title="Emergency Form"
                    >
                      <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        URGENT
                      </span>
                    </div>
                  )}

                  {complianceLevel && (
                    <div
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full"
                      title={`${complianceLevel} Compliance Required`}
                    >
                      <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {complianceLevel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          )}

          <CardBody className="space-y-6">
            {/* Validation Messages */}
            {renderValidation()}

            {/* Form Content */}
            <div className="space-y-4">
              {children}
            </div>
          </CardBody>

          <CardFooter className="pt-4">
            <Divider className="mb-4" aria-hidden="true" />
            {renderDefaultActions()}
          </CardFooter>
        </form>
      </Card>
    </>
  )
}

// Predefined healthcare form configurations
export const HealthcareFormPresets = {
  // Patient forms
  patientRegistration: {
    variant: 'patient' as const,
    title: 'Patient Registration',
    description: 'Complete patient information and consent forms',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },

  patientIntake: {
    variant: 'patient' as const,
    title: 'Patient Intake Form',
    description: 'Initial patient assessment and medical history',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },

  // Professional forms
  clinicalAssessment: {
    variant: 'professional' as const,
    title: 'Clinical Assessment',
    description: 'Professional clinical evaluation and notes',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },

  treatmentPlan: {
    variant: 'medical' as const,
    title: 'Treatment Plan',
    description: 'Patient treatment planning and goals',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },

  // Compliance forms
  consentForm: {
    variant: 'compliance' as const,
    title: 'Informed Consent',
    description: 'Patient consent for treatment and data use',
    containsPHI: false,
    complianceLevel: 'Law25' as const,
  },

  // Emergency forms
  emergencyIntake: {
    variant: 'emergency' as const,
    title: 'Emergency Intake',
    description: 'Urgent patient care assessment',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    isEmergency: true,
  },
} as const

export default HealthcareForm