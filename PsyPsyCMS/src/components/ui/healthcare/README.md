# Healthcare UI Components

A comprehensive design system for healthcare applications built on NextUI with HIPAA compliance and Quebec Law 25 support.

## Overview

The Healthcare UI Components provide a complete set of medical-grade interface elements designed specifically for healthcare workflows. All components feature:

- **HIPAA Compliance**: Built-in PHI data handling and audit trails
- **Quebec Law 25 Support**: Explicit consent tracking and data residency compliance
- **WCAG AAA Accessibility**: 7:1 contrast ratios and 44px minimum touch targets
- **Design Token Integration**: Consistent styling through centralized tokens
- **NextUI Foundation**: Built on top of NextUI v2.6.11 for robust functionality

## Quick Start

```tsx
import {
  HealthcareButton,
  HealthcareCard,
  HealthcareInput,
  HealthcareForm,
  designTokens
} from '@/components/ui/healthcare'

// Basic usage
<HealthcareButton variant="primary" containsPHI={false}>
  Schedule Appointment
</HealthcareButton>
```

## Components

### HealthcareButton

Professional-grade buttons with healthcare-specific styling and compliance features.

#### Basic Usage

```tsx
<HealthcareButton
  variant="primary"
  size="standard"
  onClick={handleClick}
>
  Primary Action
</HealthcareButton>
```

#### Healthcare-Specific Variants

```tsx
// Emergency actions
<HealthcareButton
  variant="danger"
  isEmergency={true}
  auditAction="emergency_protocol"
>
  Emergency Protocol
</HealthcareButton>

// PHI data actions
<HealthcareButton
  variant="secondary"
  containsPHI={true}
  complianceLevel="HIPAA"
  auditAction="view_medical_record"
>
  View Medical Record
</HealthcareButton>
```

#### Available Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'compact' \| 'standard' \| 'large'` | `'standard'` | Button size (all meet 44px minimum) |
| `containsPHI` | `boolean` | `false` | Whether action involves PHI data |
| `complianceLevel` | `'HIPAA' \| 'Law25' \| 'PIPEDA'` | - | Required compliance level |
| `isEmergency` | `boolean` | `false` | Emergency action flag |
| `auditAction` | `string` | - | Action name for audit logs |

#### Presets

```tsx
import { HealthcareButtonPresets } from '@/components/ui/healthcare'

<HealthcareButton {...HealthcareButtonPresets.scheduleAppointment}>
  Schedule Appointment
</HealthcareButton>
```

Available presets: `scheduleAppointment`, `viewMedicalRecord`, `emergencyProtocol`, `consentManagement`, `signDocument`, `reviewRequired`

### HealthcareCard

Information display cards optimized for medical data presentation.

#### Basic Usage

```tsx
<HealthcareCard
  variant="patient"
  title="Emily Johnson"
  subtitle="Patient ID: PAT-001"
  containsPHI={true}
  complianceLevel="HIPAA"
  status={{ type: 'success', label: 'Active' }}
>
  <p>Next appointment: Jan 25, 2025</p>
</HealthcareCard>
```

#### Variants

- **`patient`**: Patient information cards
- **`professional`**: Healthcare professional cards
- **`appointment`**: Appointment scheduling cards
- **`medical`**: Medical records and notes
- **`compliance`**: Compliance and audit information
- **`emergency`**: Emergency and critical alerts

#### Advanced Features

```tsx
<HealthcareCard
  variant="emergency"
  title="Critical Alert"
  isEmergency={true}
  priority="critical"
  accessLevel="emergency"
  auditInfo={{
    lastAccessed: "2025-01-20T10:30:00Z",
    accessedBy: "Dr. Wilson",
    actionRequired: true
  }}
  onCardClick={(auditData) => {
    console.log('Card accessed:', auditData)
  }}
>
  Emergency content
</HealthcareCard>
```

### HealthcareInput

Form inputs with PHI handling and healthcare-specific validation.

#### Basic Usage

```tsx
<HealthcareInput
  healthcareType="patient-name"
  label="Patient Name"
  containsPHI={true}
  complianceLevel="HIPAA"
  value={patientName}
  onChange={(e) => setPatientName(e.target.value)}
/>
```

#### Healthcare Types

- **`patient-name`**: Patient full names
- **`medical-id`**: Medical record numbers, patient IDs
- **`professional-id`**: Professional license numbers
- **`phone-medical`**: Healthcare phone numbers
- **`email-medical`**: Medical email addresses
- **`notes-clinical`**: Clinical notes and observations
- **`emergency-contact`**: Emergency contact information

#### PHI Masking

```tsx
<HealthcareInput
  healthcareType="medical-id"
  label="Medical Record Number"
  containsPHI={true}
  maskPHI={true}
  auditAction="view_mrn"
  value={medicalId}
  onChange={handleChange}
/>
```

#### Validation

```tsx
<HealthcareInput
  healthcareType="patient-name"
  label="Patient Name"
  validation={{
    isValid: name.length > 2,
    message: name.length <= 2 ? "Name must be at least 3 characters" : undefined,
    type: name.length <= 2 ? "error" : "success"
  }}
  value={name}
  onChange={handleNameChange}
/>
```

### HealthcareTextarea

Multi-line text inputs for clinical notes and medical documentation.

```tsx
<HealthcareTextarea
  healthcareType="notes-clinical"
  label="Clinical Notes"
  containsPHI={true}
  complianceLevel="HIPAA"
  accessLevel="confidential"
  placeholder="Enter clinical observations..."
  value={notes}
  onChange={handleNotesChange}
/>
```

### HealthcareForm

Complete form wrapper with validation and compliance features.

#### Basic Usage

```tsx
<HealthcareForm
  title="Patient Registration"
  variant="patient"
  containsPHI={true}
  complianceLevel="HIPAA"
  onSubmit={handleSubmit}
  validation={{
    isValid: formIsValid,
    errors: validationErrors,
    warnings: validationWarnings
  }}
>
  <HealthcareInput {...patientNameProps} />
  <HealthcareInput {...medicalIdProps} />
  <HealthcareTextarea {...notesProps} />
</HealthcareForm>
```

#### Form Presets

```tsx
import { HealthcareFormPresets } from '@/components/ui/healthcare'

<HealthcareForm {...HealthcareFormPresets.patientRegistration}>
  {/* Form fields */}
</HealthcareForm>
```

Available presets: `patientRegistration`, `patientUpdate`, `medicalHistory`, `clinicalNotes`, `licenseVerification`, `emergencyInformation`, `consentForm`

## Design Tokens

### Accessing Design Tokens

```tsx
import { designTokens } from '@/components/ui/healthcare'

// Use in components
<div style={{
  color: designTokens.colors.status.available,
  fontSize: designTokens.typography.fontSize.base,
  padding: designTokens.spacing[4]
}}>
  Content
</div>
```

### Color System

#### Healthcare Status Colors
- `designTokens.colors.status.available` - Available/healthy status
- `designTokens.colors.status.busy` - Busy/occupied status
- `designTokens.colors.status.emergency` - Emergency situations

#### Compliance Colors
- `designTokens.colors.compliance.phi` - PHI data indicators
- `designTokens.colors.compliance.encrypted` - Encrypted data
- `designTokens.colors.compliance.audit` - Audit trail markers

#### Alert Colors
- `designTokens.colors.alert.success` - Success states
- `designTokens.colors.alert.warning` - Warning states
- `designTokens.colors.alert.critical` - Critical alerts

### Typography Scale

All typography meets WCAG AAA standards with minimum 16px base font size:

- `designTokens.typography.fontSize.xs` - 12px (captions only)
- `designTokens.typography.fontSize.sm` - 14px (secondary text)
- `designTokens.typography.fontSize.base` - 16px (body text minimum)
- `designTokens.typography.fontSize.lg` - 18px (large body text)
- `designTokens.typography.fontSize.xl` - 20px (subheadings)

### Spacing System

8px grid system for consistent spacing:

- `designTokens.spacing[1]` - 0.25rem (2px)
- `designTokens.spacing[2]` - 0.5rem (8px)
- `designTokens.spacing[3]` - 0.75rem (12px)
- `designTokens.spacing[4]` - 1rem (16px)
- `designTokens.spacing[6]` - 1.5rem (24px)
- `designTokens.spacing[8]` - 2rem (32px)

## Accessibility Features

### WCAG AAA Compliance

All components meet WCAG AAA standards:

- **7:1 contrast ratio** for normal text
- **4.5:1 contrast ratio** for large text (18px+)
- **44px minimum touch targets** for all interactive elements
- **Semantic HTML** with proper ARIA attributes
- **Keyboard navigation** support
- **Screen reader** compatibility

### Touch Target Requirements

```tsx
// All interactive elements automatically meet 44px minimum
<HealthcareButton size="compact">  {/* Still 44px minimum height */}
  Compact Button
</HealthcareButton>
```

### Focus Management

```tsx
// Built-in focus management for PHI data
<HealthcareInput
  containsPHI={true}
  // Automatically handles focus indicators and audit logging
/>
```

## Compliance Features

### HIPAA Compliance

#### PHI Data Marking

```tsx
// Automatically marks and audits PHI data access
<HealthcareInput
  containsPHI={true}
  auditAction="view_patient_name"
  // Logs all access for compliance
/>
```

#### Audit Logging

```tsx
// All PHI interactions are automatically logged
<HealthcareButton
  containsPHI={true}
  auditAction="export_medical_record"
  onClick={handleExport}
>
  Export Record
</HealthcareButton>
```

### Quebec Law 25 Compliance

#### Explicit Consent Tracking

```tsx
<HealthcareForm
  complianceLevel="Law25"
  title="Data Collection Consent"
  // Automatically tracks consent for Quebec compliance
>
  <HealthcareInput
    healthcareType="patient-name"
    label="Name (required for service delivery)"
    containsPHI={true}
  />
</HealthcareForm>
```

#### Data Residency Indicators

```tsx
<HealthcareCard
  complianceLevel="Law25"
  // Shows Quebec compliance indicators
>
  Data stored in Quebec, Canada
</HealthcareCard>
```

## Best Practices

### Component Composition

```tsx
// ✅ Good: Compose components with proper PHI handling
const PatientRegistrationForm = () => {
  return (
    <HealthcareForm
      variant="patient"
      containsPHI={true}
      complianceLevel="HIPAA"
    >
      <HealthcareInput
        {...HealthcareInputPresets.patientName}
        label="Full Legal Name"
      />
      <HealthcareInput
        {...HealthcareInputPresets.medicalRecordNumber}
        label="Medical Record Number"
      />
      <HealthcareTextarea
        {...HealthcareInputPresets.clinicalNotes}
        label="Initial Assessment Notes"
      />
    </HealthcareForm>
  )
}
```

### Error Handling

```tsx
// ✅ Good: Comprehensive error handling with audit trails
const handleFormSubmit = async (data: PatientData) => {
  try {
    await submitPatientData(data)
    auditLogSuccess('patient_registration', data.id)
  } catch (error) {
    auditLogError('patient_registration_failed', {
      error: error.message,
      containsPHI: true,
      requiresNotification: true
    })
    setFormError('Registration failed. Please try again.')
  }
}
```

### Styling Customization

```tsx
// ✅ Good: Use design tokens for consistent styling
<HealthcareCard
  className={cn(
    'custom-card',
    `border-[${designTokens.colors.status.available}]`,
    `p-[${designTokens.spacing[4]}]`
  )}
>
  Custom styled card
</HealthcareCard>
```

## Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react'
import { HealthcareButton } from '@/components/ui/healthcare'

test('logs audit trail for PHI buttons', () => {
  const auditSpy = jest.spyOn(auditService, 'logPHIAccess')

  render(
    <HealthcareButton
      containsPHI={true}
      auditAction="view_record"
    >
      View Record
    </HealthcareButton>
  )

  fireEvent.click(screen.getByRole('button'))

  expect(auditSpy).toHaveBeenCalledWith(
    'view_record',
    expect.objectContaining({
      containsPHI: true,
      timestamp: expect.any(String)
    })
  )
})
```

### Accessibility Testing

```tsx
test('meets WCAG AAA contrast requirements', () => {
  render(<HealthcareButton variant="primary">Test</HealthcareButton>)

  // Test contrast ratios automatically with axe-core
  expect(screen.getByRole('button')).toHaveAccessibleName()
  expect(screen.getByRole('button')).toHaveAttribute('aria-label')
})
```

## Migration Guide

### From Standard NextUI Components

```tsx
// Before: Standard NextUI
import { Button, Input, Card } from '@nextui-org/react'

<Button color="primary">Action</Button>
<Input label="Name" />
<Card>Content</Card>

// After: Healthcare components
import { HealthcareButton, HealthcareInput, HealthcareCard } from '@/components/ui/healthcare'

<HealthcareButton variant="primary">Action</HealthcareButton>
<HealthcareInput healthcareType="patient-name" label="Name" />
<HealthcareCard variant="patient">Content</HealthcareCard>
```

### Adding PHI Compliance

```tsx
// Before: No compliance
<Input
  label="Patient Name"
  value={name}
  onChange={setName}
/>

// After: PHI compliant
<HealthcareInput
  healthcareType="patient-name"
  label="Patient Name"
  containsPHI={true}
  complianceLevel="HIPAA"
  auditAction="edit_patient_name"
  value={name}
  onChange={setName}
/>
```

## Troubleshooting

### Common Issues

#### Design Tokens Not Applied

```tsx
// ❌ Wrong: Direct color values
<div className="text-blue-500">Text</div>

// ✅ Correct: Use design tokens
<div className={`text-[${designTokens.colors.interactive.primary}]`}>Text</div>
```

#### Missing Audit Logs

```tsx
// ❌ Wrong: No audit logging for PHI
<HealthcareButton containsPHI={true}>
  View Record
</HealthcareButton>

// ✅ Correct: Include audit action
<HealthcareButton
  containsPHI={true}
  auditAction="view_patient_record"
>
  View Record
</HealthcareButton>
```

#### Accessibility Violations

```tsx
// ❌ Wrong: Custom sizing that breaks touch targets
<HealthcareButton className="h-8">
  Too Small
</HealthcareButton>

// ✅ Correct: Use size prop (maintains 44px minimum)
<HealthcareButton size="compact">
  Proper Size
</HealthcareButton>
```

## Support

For issues, questions, or contributions:

1. **Design System**: Check design tokens in `/src/ui/design-tokens/`
2. **Component API**: Refer to TypeScript definitions in component files
3. **Compliance**: Review audit logging in browser console
4. **Accessibility**: Test with screen reader and keyboard navigation

## License

This healthcare design system is part of the PsyPsy CMS project and follows the same licensing terms.