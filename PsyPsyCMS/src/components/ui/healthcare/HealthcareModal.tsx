import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
  Button,
  Chip,
  Badge,
  Divider
} from '@/components/ui/nextui'
import { Shield, AlertTriangle, Lock, X, Eye, FileText, Users, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthcareModalProps extends Omit<ModalProps, 'children'> {
  /**
   * Modal variant for different healthcare contexts
   */
  variant?:
    | 'patient-details'    // Patient information modals
    | 'medical-records'    // Medical records/notes viewing
    | 'appointment'        // Appointment scheduling/editing
    | 'consent'           // Consent management
    | 'emergency'         // Emergency/critical dialogs
    | 'compliance'        // Compliance and audit dialogs
    | 'confirmation'      // Action confirmation dialogs

  /**
   * Modal title
   */
  title?: string

  /**
   * Modal description/subtitle
   */
  description?: string

  /**
   * PHI (Protected Health Information) indicator
   */
  containsPHI?: boolean

  /**
   * Compliance level requirements
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Access level required to view/interact
   */
  accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'

  /**
   * Emergency flag for critical modals
   */
  isEmergency?: boolean

  /**
   * Consent requirements
   */
  requiresConsent?: boolean

  /**
   * Audit logging
   */
  auditAction?: string

  /**
   * Auto-close timer (in seconds)
   */
  autoCloseAfter?: number

  /**
   * Confirmation requirements
   */
  confirmation?: {
    required: boolean
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'danger' | 'warning'
  }

  /**
   * Modal content
   */
  children?: React.ReactNode

  /**
   * Footer actions
   */
  actions?: React.ReactNode

  /**
   * Custom header content
   */
  headerContent?: React.ReactNode

  /**
   * Footer configuration
   */
  footerConfig?: {
    showCancel?: boolean
    cancelText?: string
    showConfirm?: boolean
    confirmText?: string
    confirmVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
    isLoading?: boolean
  }

  /**
   * Event handlers
   */
  onConfirm?: () => void
  onCancel?: () => void
  onOpen?: () => void
  onClose?: () => void
}

/**
 * HealthcareModal - NextUI Modal optimized for healthcare data with HIPAA compliance
 *
 * @example
 * ```tsx
 * <HealthcareModal
 *   variant="patient-details"
 *   title="Patient Information"
 *   containsPHI={true}
 *   complianceLevel="HIPAA"
 *   accessLevel="confidential"
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   auditAction="view_patient_details"
 * >
 *   <PatientDetailsForm />
 * </HealthcareModal>
 * ```
 */
export function HealthcareModal({
  variant = 'patient-details',
  title,
  description,
  containsPHI = false,
  complianceLevel,
  accessLevel = 'public',
  isEmergency = false,
  requiresConsent = false,
  auditAction,
  autoCloseAfter,
  confirmation,
  children,
  actions,
  headerContent,
  footerConfig,
  className,
  onConfirm,
  onCancel,
  onOpen,
  onClose,
  isOpen,
  ...props
}: HealthcareModalProps) {
  const [timeRemaining, setTimeRemaining] = React.useState<number | null>(autoCloseAfter || null)
  const [consentGiven, setConsentGiven] = React.useState(!requiresConsent)

  // Auto-close timer
  React.useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && isOpen) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleClose()
            return null
          }
          return prev ? prev - 1 : null
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, isOpen])

  // Reset timer when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeRemaining(autoCloseAfter || null)
      setConsentGiven(!requiresConsent)

      // Audit modal opening for PHI data
      if (containsPHI && auditAction && complianceLevel) {
        console.log('[Healthcare Audit] Modal Opened:', {
          action: auditAction,
          variant,
          complianceLevel,
          accessLevel,
          containsPHI,
          timestamp: new Date().toISOString(),
        })
      }

      onOpen?.()
    }
  }, [isOpen])

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'patient-details':
        return {
          headerColor: 'bg-blue-50 border-b border-blue-200',
          iconColor: 'text-blue-500',
          icon: <Users className="h-5 w-5" />,
        }
      case 'medical-records':
        return {
          headerColor: 'bg-orange-50 border-b border-orange-200',
          iconColor: 'text-orange-500',
          icon: <FileText className="h-5 w-5" />,
        }
      case 'appointment':
        return {
          headerColor: 'bg-purple-50 border-b border-purple-200',
          iconColor: 'text-purple-500',
          icon: <Calendar className="h-5 w-5" />,
        }
      case 'consent':
        return {
          headerColor: 'bg-green-50 border-b border-green-200',
          iconColor: 'text-green-500',
          icon: <Shield className="h-5 w-5" />,
        }
      case 'emergency':
        return {
          headerColor: 'bg-red-50 border-b border-red-200',
          iconColor: 'text-red-500',
          icon: <AlertTriangle className="h-5 w-5" />,
        }
      case 'compliance':
        return {
          headerColor: 'bg-indigo-50 border-b border-indigo-200',
          iconColor: 'text-indigo-500',
          icon: <Shield className="h-5 w-5" />,
        }
      case 'confirmation':
        return {
          headerColor: 'bg-yellow-50 border-b border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: <AlertTriangle className="h-5 w-5" />,
        }
      default:
        return {
          headerColor: 'bg-gray-50 border-b border-gray-200',
          iconColor: 'text-gray-500',
          icon: <FileText className="h-5 w-5" />,
        }
    }
  }

  const variantStyles = getVariantStyles()

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

  const handleClose = () => {
    // Audit modal closing for PHI data
    if (containsPHI && auditAction && complianceLevel) {
      console.log('[Healthcare Audit] Modal Closed:', {
        action: `${auditAction}_closed`,
        variant,
        complianceLevel,
        timeViewed: autoCloseAfter ? (autoCloseAfter - (timeRemaining || 0)) : 'manual_close',
        timestamp: new Date().toISOString(),
      })
    }

    onClose?.()
  }

  const handleConfirm = () => {
    if (confirmation?.required && !consentGiven) {
      return
    }

    // Audit confirmation action
    if (auditAction && complianceLevel) {
      console.log('[Healthcare Audit] Modal Action Confirmed:', {
        action: `${auditAction}_confirmed`,
        variant,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }

    onConfirm?.()
  }

  const handleCancel = () => {
    // Audit cancellation
    if (auditAction && complianceLevel) {
      console.log('[Healthcare Audit] Modal Action Cancelled:', {
        action: `${auditAction}_cancelled`,
        variant,
        timestamp: new Date().toISOString(),
      })
    }

    onCancel?.()
    handleClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={variant === 'confirmation' ? 'md' : 'lg'}
      className={cn(
        // Base modal styling
        'healthcare-modal',

        // PHI data indicator
        containsPHI && 'ring-2 ring-purple-200',

        // Emergency indicator
        isEmergency && 'ring-2 ring-red-300 shadow-lg shadow-red-200',

        // Compliance indicator
        complianceLevel && 'border-l-4 border-l-blue-500',

        className
      )}
      closeButton={
        <Button
          size="sm"
          variant="light"
          isIconOnly
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      }
      {...props}
    >
      <ModalContent>
        {/* Header */}
        <ModalHeader className={cn('flex flex-col gap-3 p-6', variantStyles.headerColor)}>
          <div className="flex items-center gap-3">
            {/* Variant icon */}
            <div className={cn('flex-shrink-0', variantStyles.iconColor)}>
              {variantStyles.icon}
            </div>

            {/* Title and indicators */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold truncate">{title}</h2>
                {getAccessLevelIcon()}
              </div>
              {description && (
                <p className="text-sm text-default-500">{description}</p>
              )}
            </div>

            {/* Status indicators */}
            <div className="flex flex-col items-end gap-1">
              {/* Auto-close timer */}
              {timeRemaining && timeRemaining > 0 && (
                <Chip color="warning" size="sm" variant="flat">
                  Auto-close: {timeRemaining}s
                </Chip>
              )}

              {/* PHI indicator */}
              {containsPHI && (
                <Badge color="warning" variant="flat" size="sm" content="PHI">
                  <Shield className="h-4 w-4 text-purple-500" />
                </Badge>
              )}

              {/* Emergency indicator */}
              {isEmergency && (
                <Chip color="danger" size="sm" variant="flat">
                  Emergency
                </Chip>
              )}

              {/* Compliance level */}
              {complianceLevel && (
                <Chip color="secondary" size="sm" variant="bordered">
                  {complianceLevel}
                </Chip>
              )}
            </div>
          </div>

          {/* Custom header content */}
          {headerContent && (
            <>
              <Divider />
              {headerContent}
            </>
          )}
        </ModalHeader>

        {/* Body */}
        <ModalBody className="p-6">
          {/* Consent requirement */}
          {requiresConsent && !consentGiven && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Consent Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This action requires your explicit consent to proceed. Please review the information
                    and confirm your understanding.
                  </p>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onClick={() => setConsentGiven(true)}
                    className="mt-3"
                  >
                    I Give Consent
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation message */}
          {confirmation?.required && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Confirmation Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    {confirmation.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          {children}
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="p-6 pt-0">
          {actions ? (
            <div className="flex gap-2 w-full">
              {actions}
            </div>
          ) : (
            <div className="flex gap-2 w-full justify-end">
              {footerConfig?.showCancel !== false && (
                <Button
                  variant="bordered"
                  onClick={handleCancel}
                >
                  {footerConfig?.cancelText || 'Cancel'}
                </Button>
              )}

              {footerConfig?.showConfirm !== false && (
                <Button
                  color={footerConfig?.confirmVariant || 'primary'}
                  onClick={handleConfirm}
                  isLoading={footerConfig?.isLoading}
                  isDisabled={requiresConsent && !consentGiven}
                >
                  {footerConfig?.confirmText || 'Confirm'}
                </Button>
              )}
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Predefined healthcare modal configurations
export const HealthcareModalPresets = {
  // Patient information modal
  patientDetails: {
    variant: 'patient-details' as const,
    title: 'Patient Details',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    auditAction: 'view_patient_details',
  },

  // Medical record viewing
  medicalRecord: {
    variant: 'medical-records' as const,
    title: 'Medical Record',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    auditAction: 'view_medical_record',
    autoCloseAfter: 300, // 5 minutes auto-close for security
  },

  // Emergency protocols
  emergencyAlert: {
    variant: 'emergency' as const,
    title: 'Emergency Protocol',
    isEmergency: true,
    accessLevel: 'emergency' as const,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'emergency_protocol',
  },

  // Consent management
  consentDialog: {
    variant: 'consent' as const,
    title: 'Patient Consent',
    requiresConsent: true,
    complianceLevel: 'Law25' as const,
    auditAction: 'consent_management',
  },

  // Data deletion confirmation
  deleteConfirmation: {
    variant: 'confirmation' as const,
    title: 'Confirm Data Deletion',
    confirmation: {
      required: true,
      message: 'This action will permanently delete patient data and cannot be undone. Please confirm your action.',
      confirmText: 'Delete Data',
      cancelText: 'Keep Data',
      variant: 'danger' as const,
    },
    complianceLevel: 'HIPAA' as const,
    auditAction: 'data_deletion',
    footerConfig: {
      confirmVariant: 'danger' as const,
    },
  },

  // Appointment scheduling
  appointmentScheduling: {
    variant: 'appointment' as const,
    title: 'Schedule Appointment',
    complianceLevel: 'HIPAA' as const,
    auditAction: 'schedule_appointment',
  },

  // Compliance audit
  complianceAudit: {
    variant: 'compliance' as const,
    title: 'Compliance Audit',
    complianceLevel: 'Law25' as const,
    auditAction: 'compliance_audit',
    accessLevel: 'restricted' as const,
  },
} as const