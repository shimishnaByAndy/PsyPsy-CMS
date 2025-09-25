# Healthcare Components API Reference

Complete TypeScript interface documentation for all healthcare components.

## HealthcareButton

### Interface

```typescript
interface HealthcareButtonProps extends Omit<ButtonProps, 'color' | 'size'> {
  /**
   * Healthcare-specific button variants
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

  /**
   * Button size (all sizes meet 44px minimum touch target)
   */
  size?: 'compact' | 'standard' | 'large'

  /**
   * Contains Protected Health Information
   */
  containsPHI?: boolean

  /**
   * Required compliance level
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Emergency action flag
   */
  isEmergency?: boolean

  /**
   * Action name for audit logging
   */
  auditAction?: string

  /**
   * Loading state with spinner
   */
  isLoading?: boolean

  /**
   * Custom icon to display
   */
  icon?: React.ReactNode

  /**
   * Icon position
   */
  iconPosition?: 'left' | 'right'
}
```

### Presets

```typescript
export const HealthcareButtonPresets = {
  scheduleAppointment: {
    variant: 'primary' as const,
    icon: <Calendar className="h-4 w-4" />,
    auditAction: 'schedule_appointment',
  },
  viewMedicalRecord: {
    variant: 'secondary' as const,
    icon: <FileText className="h-4 w-4" />,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'view_medical_record',
  },
  emergencyProtocol: {
    variant: 'danger' as const,
    icon: <AlertTriangle className="h-4 w-4" />,
    isEmergency: true,
    auditAction: 'emergency_protocol',
  },
  consentManagement: {
    variant: 'warning' as const,
    icon: <Shield className="h-4 w-4" />,
    complianceLevel: 'Law25' as const,
    auditAction: 'manage_consent',
  },
  signDocument: {
    variant: 'success' as const,
    icon: <PenTool className="h-4 w-4" />,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    auditAction: 'sign_document',
  },
  reviewRequired: {
    variant: 'warning' as const,
    icon: <Eye className="h-4 w-4" />,
    auditAction: 'review_required',
  },
} as const
```

## HealthcareCard

### Interface

```typescript
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
```

### Presets

```typescript
export const HealthcareCardPresets = {
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
  medicalRecord: {
    variant: 'medical' as const,
    containsPHI: true,
    accessLevel: 'confidential' as const,
    complianceLevel: 'HIPAA' as const,
  },
  emergencyAlert: {
    variant: 'emergency' as const,
    isEmergency: true,
    priority: 'critical' as const,
    status: { type: 'danger' as const, label: 'Emergency' },
    accessLevel: 'emergency' as const,
  },
  complianceAudit: {
    variant: 'compliance' as const,
    complianceLevel: 'Law25' as const,
    status: { type: 'info' as const, label: 'Audit Required' },
  },
} as const
```

## HealthcareInput

### Interface

```typescript
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
```

### Presets

```typescript
export const HealthcareInputPresets = {
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
  licenseNumber: {
    healthcareType: 'professional-id' as const,
    accessLevel: 'restricted' as const,
    complianceLevel: 'HIPAA' as const,
  },
  insuranceInfo: {
    healthcareType: 'insurance-info' as const,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
    accessLevel: 'confidential' as const,
    maskPHI: true,
  },
} as const
```

## HealthcareForm

### Interface

```typescript
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
  children?: React.ReactNode

  /**
   * Form actions
   */
  actions?: React.ReactNode

  /**
   * Custom submit handler
   */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void

  /**
   * Custom cancel handler
   */
  onCancel?: () => void

  /**
   * Additional class names
   */
  className?: string
}
```

### Presets

```typescript
export const HealthcareFormPresets = {
  patientRegistration: {
    variant: 'patient' as const,
    title: 'Patient Registration',
    description: 'Complete patient information and consent forms',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },
  patientUpdate: {
    variant: 'patient' as const,
    title: 'Update Patient Information',
    description: 'Modify existing patient records',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },
  medicalHistory: {
    variant: 'medical' as const,
    title: 'Medical History',
    description: 'Patient medical history and current conditions',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },
  clinicalNotes: {
    variant: 'medical' as const,
    title: 'Clinical Notes',
    description: 'Session notes and observations',
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },
  licenseVerification: {
    variant: 'professional' as const,
    title: 'License Verification',
    description: 'Verify professional credentials and licensing',
    complianceLevel: 'Law25' as const,
  },
  emergencyInformation: {
    variant: 'emergency' as const,
    title: 'Emergency Information',
    description: 'Critical information for emergency situations',
    isEmergency: true,
    containsPHI: true,
    complianceLevel: 'HIPAA' as const,
  },
  consentForm: {
    variant: 'compliance' as const,
    title: 'Consent Management',
    description: 'Quebec Law 25 and PIPEDA consent tracking',
    complianceLevel: 'Law25' as const,
  },
} as const
```

## Design Tokens

### Interface

```typescript
interface DesignTokens {
  colors: {
    // Healthcare status colors
    status: {
      available: string    // #22c55e - Available/healthy
      busy: string        // #f59e0b - Busy/occupied
      emergency: string   // #ef4444 - Emergency situations
    }

    // Compliance and PHI colors
    compliance: {
      phi: string         // #8b5cf6 - PHI data indicators
      encrypted: string   // #06b6d4 - Encrypted data
      audit: string       // #6366f1 - Audit trail markers
    }

    // Interactive elements
    interactive: {
      primary: string     // #3b82f6 - Primary actions
      secondary: string   // #6b7280 - Secondary actions
      accent: string      // #8b5cf6 - Accent elements
    }

    // Alert states
    alert: {
      success: string     // #22c55e - Success states
      warning: string     // #f59e0b - Warning states
      critical: string    // #ef4444 - Critical alerts
    }

    // Text colors
    text: {
      primary: string     // #111827 - Primary text
      secondary: string   // #6b7280 - Secondary text
      muted: string       // #9ca3af - Muted text
    }

    // Background colors
    background: {
      default: string     // #ffffff - Default background
      subtle: string      // #f9fafb - Subtle background
      muted: string       // #f3f4f6 - Muted background
    }

    // Border colors
    border: {
      default: string     // #d1d5db - Default borders
      subtle: string      // #e5e7eb - Subtle borders
      muted: string       // #f3f4f6 - Muted borders
    }
  }

  // Dark mode colors
  colorsDark: {
    // Same structure as colors but optimized for dark mode
  }

  typography: {
    fontSize: {
      xs: string          // 0.75rem (12px)
      sm: string          // 0.875rem (14px)
      base: string        // 1rem (16px) - WCAG minimum
      lg: string          // 1.125rem (18px)
      xl: string          // 1.25rem (20px)
      '2xl': string       // 1.5rem (24px)
      '3xl': string       // 1.875rem (30px)
      '4xl': string       // 2.25rem (36px)
    }

    fontWeight: {
      normal: string      // 400
      medium: string      // 500
      semibold: string    // 600
      bold: string        // 700
    }

    lineHeight: {
      tight: string       // 1.25
      normal: string      // 1.5
      relaxed: string     // 1.75
    }

    letterSpacing: {
      tight: string       // -0.025em
      normal: string      // 0em
      wide: string        // 0.025em
    }
  }

  spacing: {
    [key: string]: string  // 8px grid system (0.5rem increments)
  }

  shadows: {
    sm: string            // Small shadow
    md: string            // Medium shadow
    lg: string            // Large shadow
    xl: string            // Extra large shadow
  }

  borderRadius: {
    sm: string            // 0.125rem (2px)
    md: string            // 0.375rem (6px)
    lg: string            // 0.5rem (8px)
    xl: string            // 0.75rem (12px)
  }

  breakpoints: {
    sm: string            // 640px
    md: string            // 768px
    lg: string            // 1024px
    xl: string            // 1280px
    '2xl': string         // 1536px
  }

  zIndex: {
    dropdown: number      // 1000
    sticky: number        // 1020
    fixed: number         // 1030
    modal: number         // 1040
    popover: number       // 1050
    tooltip: number       // 1060
  }

  animation: {
    duration: {
      fast: string        // 150ms
      base: string        // 200ms
      slow: string        // 300ms
    }

    easing: {
      linear: string      // linear
      easeIn: string      // ease-in
      easeOut: string     // ease-out
      easeInOut: string   // ease-in-out
    }
  }

  componentDefaults: {
    button: {
      minHeight: string   // 44px (accessibility requirement)
      padding: string     // 0.75rem 1rem
      borderRadius: string // 0.375rem
    }

    input: {
      minHeight: string   // 44px (accessibility requirement)
      padding: string     // 0.75rem
      borderRadius: string // 0.375rem
    }

    card: {
      padding: string     // 1.5rem
      borderRadius: string // 0.5rem
      shadow: string      // shadow-sm
    }
  }

  accessibility: {
    minTouchTarget: string // 44px
    focusRingWidth: string // 2px
    focusRingOffset: string // 2px
  }
}
```

## Event Handlers

### Audit Logging Events

All components with `containsPHI={true}` automatically trigger audit events:

```typescript
// Button clicks
auditPHIAccess(auditAction, {
  componentType: 'button',
  containsPHI: boolean,
  complianceLevel: string,
  timestamp: string,
  userId: string
})

// Input focus/blur
auditPHIAccess(auditAction, {
  componentType: 'input',
  healthcareType: string,
  action: 'focus' | 'blur',
  containsPHI: boolean,
  timestamp: string
})

// Card access
auditPHIAccess('card_access', {
  cardType: string,
  containsPHI: boolean,
  accessLevel: string,
  timestamp: string
})

// Form submission
auditPHIAccess('form_submit', {
  variant: string,
  containsPHI: boolean,
  complianceLevel: string,
  timestamp: string,
  isEmergency: boolean
})
```

### Custom Event Handlers

```typescript
// HealthcareCard click with audit data
const handleCardClick = (auditData: CardAuditData) => {
  console.log('Card accessed:', auditData)
  // Custom logic here
}

// HealthcareForm submission with validation
const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  // Form data is automatically audited
  // Custom submission logic here
}

// HealthcareInput change with validation
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  // PHI access is automatically audited on focus
  setValue(value)

  // Custom validation
  setValidation({
    isValid: value.length > 0,
    message: value.length === 0 ? 'This field is required' : undefined,
    type: value.length === 0 ? 'error' : 'success'
  })
}
```

## Error States

### Validation Error Types

```typescript
type ValidationState = {
  isValid?: boolean
  message?: string
  type?: 'error' | 'warning' | 'success' | 'info'
}

// Error examples
const errorStates = {
  required: {
    isValid: false,
    message: 'This field is required',
    type: 'error' as const
  },

  format: {
    isValid: false,
    message: 'Please enter a valid format (ABC-12345)',
    type: 'error' as const
  },

  warning: {
    isValid: true,
    message: 'Consider adding additional information',
    type: 'warning' as const
  },

  success: {
    isValid: true,
    message: 'Valid format',
    type: 'success' as const
  }
}
```

### HIPAA Compliance Errors

```typescript
// Compliance-related error states
const complianceErrors = {
  phiAccessDenied: {
    isValid: false,
    message: 'Insufficient permissions to access PHI data',
    type: 'error' as const
  },

  auditLogFailure: {
    isValid: false,
    message: 'Audit logging failed - action blocked for compliance',
    type: 'error' as const
  },

  consentRequired: {
    isValid: false,
    message: 'Patient consent required before proceeding',
    type: 'warning' as const
  }
}
```