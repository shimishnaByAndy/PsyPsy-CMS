# Healthcare Components - Usage Examples

Practical examples for implementing healthcare components in real-world scenarios.

## Patient Registration Flow

### Complete Patient Registration Form

```tsx
import React, { useState } from 'react'
import {
  HealthcareForm,
  HealthcareInput,
  HealthcareTextarea,
  HealthcareButton,
  HealthcareFormPresets,
  HealthcareInputPresets
} from '@/components/ui/healthcare'

export function PatientRegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    medicalRecordNumber: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: ''
  })

  const [validation, setValidation] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[]
  })

  const validateForm = () => {
    const errors: string[] = []
    const warnings: string[] = []

    // Required field validation
    if (!formData.firstName) errors.push('First name is required')
    if (!formData.lastName) errors.push('Last name is required')
    if (!formData.dateOfBirth) errors.push('Date of birth is required')
    if (!formData.phone) errors.push('Phone number is required')
    if (!formData.emergencyContactName) errors.push('Emergency contact is required')
    if (!formData.emergencyContactPhone) errors.push('Emergency contact phone is required')

    // Format validation
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.push('Phone number must be in format (555) 123-4567')
    }

    const mrnRegex = /^[A-Z]{3}-\d{5}$/
    if (formData.medicalRecordNumber && !mrnRegex.test(formData.medicalRecordNumber)) {
      errors.push('Medical record number must be in format ABC-12345')
    }

    // Warnings for optional but recommended fields
    if (!formData.medicalHistory) warnings.push('Medical history helps provide better care')
    if (!formData.currentMedications) warnings.push('Medication list helps prevent interactions')

    const isValid = errors.length === 0

    setValidation({ isValid, errors, warnings })
    return isValid
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Submit to backend with automatic audit logging
      const response = await submitPatientRegistration(formData)

      // Success handling
      toast.success('Patient registered successfully')
      router.push(`/patients/${response.patientId}`)

    } catch (error) {
      // Error handling with compliance logging
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <HealthcareForm
        {...HealthcareFormPresets.patientRegistration}
        onSubmit={handleSubmit}
        validation={validation}
      >
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthcareInput
            {...HealthcareInputPresets.patientName}
            label="First Name *"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            validation={{
              isValid: formData.firstName.length > 0,
              message: !formData.firstName ? 'First name is required' : undefined,
              type: !formData.firstName ? 'error' : 'success'
            }}
          />

          <HealthcareInput
            {...HealthcareInputPresets.patientName}
            label="Last Name *"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            validation={{
              isValid: formData.lastName.length > 0,
              message: !formData.lastName ? 'Last name is required' : undefined,
              type: !formData.lastName ? 'error' : 'success'
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthcareInput
            type="date"
            label="Date of Birth *"
            containsPHI={true}
            complianceLevel="HIPAA"
            accessLevel="confidential"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            validation={{
              isValid: !!formData.dateOfBirth,
              message: !formData.dateOfBirth ? 'Date of birth is required' : undefined,
              type: !formData.dateOfBirth ? 'error' : 'success'
            }}
          />

          <HealthcareInput
            {...HealthcareInputPresets.medicalRecordNumber}
            label="Medical Record Number"
            placeholder="ABC-12345"
            value={formData.medicalRecordNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, medicalRecordNumber: e.target.value }))}
            validation={{
              isValid: !formData.medicalRecordNumber || /^[A-Z]{3}-\d{5}$/.test(formData.medicalRecordNumber),
              message: formData.medicalRecordNumber && !/^[A-Z]{3}-\d{5}$/.test(formData.medicalRecordNumber)
                ? 'Format: ABC-12345' : undefined,
              type: formData.medicalRecordNumber && !/^[A-Z]{3}-\d{5}$/.test(formData.medicalRecordNumber)
                ? 'error' : 'success'
            }}
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthcareInput
            {...HealthcareInputPresets.patientPhone}
            label="Phone Number *"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            validation={{
              isValid: formData.phone.length > 0 && /^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone),
              message: formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)
                ? 'Format: (555) 123-4567' : undefined,
              type: formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)
                ? 'error' : formData.phone ? 'success' : undefined
            }}
          />

          <HealthcareInput
            type="email"
            label="Email Address"
            placeholder="patient@email.com"
            containsPHI={true}
            complianceLevel="HIPAA"
            accessLevel="confidential"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            validation={{
              isValid: !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
              message: formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                ? 'Please enter a valid email' : undefined,
              type: formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                ? 'error' : formData.email ? 'success' : undefined
            }}
          />
        </div>

        {/* Emergency Contact */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthcareInput
              healthcareType="emergency-contact"
              label="Emergency Contact Name *"
              placeholder="Contact full name"
              containsPHI={true}
              complianceLevel="HIPAA"
              accessLevel="confidential"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
              validation={{
                isValid: formData.emergencyContactName.length > 0,
                message: !formData.emergencyContactName ? 'Emergency contact is required' : undefined,
                type: !formData.emergencyContactName ? 'error' : 'success'
              }}
            />

            <HealthcareInput
              healthcareType="phone-medical"
              label="Emergency Contact Phone *"
              placeholder="(555) 123-4567"
              containsPHI={true}
              complianceLevel="HIPAA"
              accessLevel="confidential"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
              validation={{
                isValid: formData.emergencyContactPhone.length > 0,
                message: !formData.emergencyContactPhone ? 'Emergency contact phone is required' : undefined,
                type: !formData.emergencyContactPhone ? 'error' : 'success'
              }}
            />
          </div>
        </div>

        {/* Insurance Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthcareInput
              {...HealthcareInputPresets.insuranceInfo}
              label="Insurance Provider"
              placeholder="Insurance company name"
              value={formData.insuranceProvider}
              onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
            />

            <HealthcareInput
              {...HealthcareInputPresets.insuranceInfo}
              label="Policy Number"
              placeholder="Policy number"
              value={formData.insurancePolicyNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
          <div className="space-y-6">
            <HealthcareTextarea
              {...HealthcareInputPresets.clinicalNotes}
              label="Medical History"
              placeholder="Previous medical conditions, surgeries, family history..."
              value={formData.medicalHistory}
              onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
            />

            <HealthcareTextarea
              healthcareType="medication"
              label="Current Medications"
              placeholder="List all current medications, dosages, and frequency..."
              containsPHI={true}
              complianceLevel="HIPAA"
              accessLevel="confidential"
              value={formData.currentMedications}
              onChange={(e) => setFormData(prev => ({ ...prev, currentMedications: e.target.value }))}
            />

            <HealthcareTextarea
              healthcareType="medical"
              label="Allergies"
              placeholder="Known allergies to medications, foods, or other substances..."
              containsPHI={true}
              complianceLevel="HIPAA"
              accessLevel="confidential"
              isEmergency={true}
              value={formData.allergies}
              onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
            />
          </div>
        </div>
      </HealthcareForm>
    </div>
  )
}
```

## Appointment Scheduling Interface

### Appointment Calendar with Healthcare Cards

```tsx
import React, { useState } from 'react'
import {
  HealthcareCard,
  HealthcareButton,
  HealthcareCardPresets,
  HealthcareButtonPresets
} from '@/components/ui/healthcare'

export function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ]

  const scheduledAppointments = [
    {
      id: 'appt-001',
      time: '09:00',
      patientName: 'Emily Johnson',
      patientId: 'PAT-001',
      duration: 50,
      type: 'Initial Consultation',
      status: 'confirmed'
    },
    {
      id: 'appt-002',
      time: '15:00',
      patientName: 'Michael Chen',
      patientId: 'PAT-002',
      duration: 50,
      type: 'Follow-up',
      status: 'scheduled'
    }
  ]

  const handleScheduleAppointment = (time: string) => {
    setSelectedTime(time)
    // Open appointment booking modal
  }

  const handleAppointmentClick = (appointment: any) => {
    // Navigate to appointment details
    console.log('Appointment accessed:', appointment)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <HealthcareCard
            variant="appointment"
            title="Schedule New Appointment"
            subtitle="Select date and time"
          >
            {/* Calendar component would go here */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selected Date: {selectedDate.toLocaleDateString()}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Times</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((time) => {
                    const isBooked = scheduledAppointments.some(apt => apt.time === time)
                    return (
                      <HealthcareButton
                        key={time}
                        variant={isBooked ? "secondary" : "primary"}
                        size="compact"
                        disabled={isBooked}
                        onClick={() => handleScheduleAppointment(time)}
                        className={isBooked ? "opacity-50" : ""}
                      >
                        {time} {isBooked && "(Booked)"}
                      </HealthcareButton>
                    )
                  })}
                </div>
              </div>
            </div>
          </HealthcareCard>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Today's Appointments</h2>

            {scheduledAppointments.map((appointment) => (
              <HealthcareCard
                key={appointment.id}
                {...HealthcareCardPresets.appointmentScheduled}
                title={`${appointment.time} - ${appointment.type}`}
                subtitle={`${appointment.patientName} (${appointment.patientId})`}
                status={{
                  type: appointment.status === 'confirmed' ? 'success' : 'info',
                  label: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                }}
                priority={appointment.time < '12:00' ? 'high' : 'medium'}
                onCardClick={() => handleAppointmentClick(appointment)}
                actions={
                  <div className="flex gap-2">
                    <HealthcareButton
                      {...HealthcareButtonPresets.viewMedicalRecord}
                      size="compact"
                    >
                      View Patient
                    </HealthcareButton>
                    <HealthcareButton
                      variant="warning"
                      size="compact"
                      auditAction="reschedule_appointment"
                    >
                      Reschedule
                    </HealthcareButton>
                  </div>
                }
              >
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Duration:</strong> {appointment.duration} minutes
                  </p>
                  <p className="text-sm">
                    <strong>Session Type:</strong> {appointment.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Standard 50-minute therapy session
                  </p>
                </div>
              </HealthcareCard>
            ))}

            {/* Emergency Slot */}
            <HealthcareCard
              {...HealthcareCardPresets.emergencyAlert}
              title="Emergency Slot Available"
              subtitle="Reserved for urgent consultations"
              actions={
                <HealthcareButton
                  {...HealthcareButtonPresets.emergencyProtocol}
                  size="compact"
                >
                  Book Emergency
                </HealthcareButton>
              }
            >
              <p className="text-sm">
                Available for immediate urgent consultations.
                Patient screening required before booking.
              </p>
            </HealthcareCard>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Professional Dashboard

### Healthcare Professional Interface

```tsx
import React from 'react'
import {
  HealthcareCard,
  HealthcareButton,
  HealthcareCardPresets,
  HealthcareButtonPresets,
  designTokens
} from '@/components/ui/healthcare'

export function ProfessionalDashboard() {
  const professionalData = {
    name: "Dr. Sarah Wilson",
    licenseNumber: "PSY-QC-12345",
    specialization: "Clinical Psychology",
    status: "available",
    nextAppointment: "2:00 PM - Emily Johnson",
    activePatients: 24,
    pendingReviews: 3,
    complianceStatus: "up-to-date"
  }

  const recentPatients = [
    {
      id: "PAT-001",
      name: "Emily Johnson",
      lastSession: "2025-01-18",
      nextSession: "2025-01-25",
      status: "active",
      requiresReview: false
    },
    {
      id: "PAT-002",
      name: "Michael Chen",
      lastSession: "2025-01-17",
      nextSession: "2025-01-24",
      status: "active",
      requiresReview: true
    },
    {
      id: "PAT-003",
      name: "Sarah Martinez",
      lastSession: "2025-01-16",
      nextSession: "2025-01-30",
      status: "active",
      requiresReview: false
    }
  ]

  const pendingActions = [
    {
      type: "review",
      title: "Session Notes Review Required",
      description: "3 session notes pending professional review",
      priority: "high",
      dueDate: "Today"
    },
    {
      type: "license",
      title: "License Renewal Reminder",
      description: "Professional license renewal due in 30 days",
      priority: "medium",
      dueDate: "February 20, 2025"
    },
    {
      type: "compliance",
      title: "PIPEDA Compliance Training",
      description: "Annual compliance training due",
      priority: "medium",
      dueDate: "February 15, 2025"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Professional Profile Header */}
      <HealthcareCard
        {...HealthcareCardPresets.professionalActive}
        title={professionalData.name}
        subtitle={`License: ${professionalData.licenseNumber}`}
        avatar={{
          name: professionalData.name,
          color: "success"
        }}
        status={{
          type: "success",
          label: "Available"
        }}
        actions={
          <div className="flex gap-2">
            <HealthcareButton
              variant="primary"
              size="compact"
              auditAction="update_availability"
            >
              Update Status
            </HealthcareButton>
            <HealthcareButton
              variant="secondary"
              size="compact"
              auditAction="view_schedule"
            >
              View Schedule
            </HealthcareButton>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-medium">Specialization</p>
            <p className="text-gray-600">{professionalData.specialization}</p>
          </div>
          <div>
            <p className="font-medium">Next Appointment</p>
            <p className="text-gray-600">{professionalData.nextAppointment}</p>
          </div>
          <div>
            <p className="font-medium">Active Patients</p>
            <p className="text-gray-600">{professionalData.activePatients}</p>
          </div>
          <div>
            <p className="font-medium">Compliance Status</p>
            <p className={`text-[${designTokens.colors.alert.success}] font-medium`}>
              {professionalData.complianceStatus}
            </p>
          </div>
        </div>
      </HealthcareCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Patients */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Recent Patients</h2>

          {recentPatients.map((patient) => (
            <HealthcareCard
              key={patient.id}
              {...HealthcareCardPresets.patientActive}
              title={patient.name}
              subtitle={`Patient ID: ${patient.id}`}
              status={{
                type: "success",
                label: "Active"
              }}
              priority={patient.requiresReview ? "high" : "medium"}
              actions={
                <div className="flex gap-2">
                  <HealthcareButton
                    {...HealthcareButtonPresets.viewMedicalRecord}
                    size="compact"
                  >
                    View Record
                  </HealthcareButton>
                  {patient.requiresReview && (
                    <HealthcareButton
                      {...HealthcareButtonPresets.reviewRequired}
                      size="compact"
                    >
                      Review Required
                    </HealthcareButton>
                  )}
                </div>
              }
            >
              <div className="space-y-1 text-sm">
                <p><strong>Last Session:</strong> {patient.lastSession}</p>
                <p><strong>Next Session:</strong> {patient.nextSession}</p>
                {patient.requiresReview && (
                  <p className={`text-[${designTokens.colors.alert.warning}] font-medium`}>
                    ⚠ Session notes require review
                  </p>
                )}
              </div>
            </HealthcareCard>
          ))}
        </div>

        {/* Pending Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Actions</h2>

          {pendingActions.map((action, index) => (
            <HealthcareCard
              key={index}
              variant={action.type === "review" ? "medical" : "compliance"}
              title={action.title}
              subtitle={`Due: ${action.dueDate}`}
              priority={action.priority as "high" | "medium"}
              status={{
                type: action.priority === "high" ? "warning" : "info",
                label: action.priority === "high" ? "Urgent" : "Pending"
              }}
              actions={
                <HealthcareButton
                  variant={action.priority === "high" ? "warning" : "primary"}
                  size="compact"
                  auditAction={`complete_${action.type}`}
                >
                  {action.type === "review" ? "Review Now" : "Complete"}
                </HealthcareButton>
              }
            >
              <p className="text-sm text-gray-600">{action.description}</p>
            </HealthcareCard>
          ))}

          {/* Compliance Summary */}
          <HealthcareCard
            {...HealthcareCardPresets.complianceAudit}
            title="Quebec Law 25 Compliance"
            subtitle="Last audit: January 15, 2025"
            status={{
              type: "success",
              label: "Compliant"
            }}
            actions={
              <HealthcareButton
                variant="secondary"
                size="compact"
                auditAction="view_compliance_report"
              >
                View Report
              </HealthcareButton>
            }
          >
            <div className="space-y-1 text-sm">
              <p className={`text-[${designTokens.colors.alert.success}]`}>
                ✓ Data residency compliance
              </p>
              <p className={`text-[${designTokens.colors.alert.success}]`}>
                ✓ Consent management up-to-date
              </p>
              <p className={`text-[${designTokens.colors.alert.success}]`}>
                ✓ Audit trails active
              </p>
            </div>
          </HealthcareCard>
        </div>
      </div>
    </div>
  )
}
```

## Clinical Notes Interface

### Session Notes with PHI Handling

```tsx
import React, { useState } from 'react'
import {
  HealthcareForm,
  HealthcareInput,
  HealthcareTextarea,
  HealthcareButton,
  HealthcareCard,
  HealthcareFormPresets,
  HealthcareInputPresets
} from '@/components/ui/healthcare'

export function ClinicalNotesEditor() {
  const [sessionData, setSessionData] = useState({
    patientId: 'PAT-001',
    patientName: 'Emily Johnson',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionType: 'regular',
    duration: 50,
    objectives: '',
    observations: '',
    interventions: '',
    patientResponse: '',
    homework: '',
    nextSessionPlan: '',
    riskAssessment: 'low',
    medications: '',
    sideEffects: '',
    progressNotes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validation, setValidation] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[]
  })

  const validateNotes = () => {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!sessionData.objectives) errors.push('Session objectives are required')
    if (!sessionData.observations) errors.push('Clinical observations are required')
    if (!sessionData.progressNotes) errors.push('Progress notes are required')

    // Completeness warnings
    if (!sessionData.homework && sessionData.sessionType === 'regular') {
      warnings.push('Consider assigning homework for continued progress')
    }
    if (!sessionData.nextSessionPlan) {
      warnings.push('Next session planning helps maintain continuity')
    }

    const isValid = errors.length === 0
    setValidation({ isValid, errors, warnings })
    return isValid
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateNotes()) return

    setIsSubmitting(true)

    try {
      // Submit with automatic PHI audit logging
      await submitClinicalNotes({
        ...sessionData,
        submittedAt: new Date().toISOString(),
        submittedBy: getCurrentProfessional().id
      })

      toast.success('Clinical notes saved successfully')

    } catch (error) {
      console.error('Failed to save notes:', error)
      toast.error('Failed to save notes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Patient Context Card */}
      <HealthcareCard
        variant="patient"
        title={sessionData.patientName}
        subtitle={`Patient ID: ${sessionData.patientId}`}
        containsPHI={true}
        complianceLevel="HIPAA"
        accessLevel="confidential"
        className="mb-6"
      >
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">Session Date</p>
            <p>{sessionData.sessionDate}</p>
          </div>
          <div>
            <p className="font-medium">Session Type</p>
            <p className="capitalize">{sessionData.sessionType}</p>
          </div>
          <div>
            <p className="font-medium">Duration</p>
            <p>{sessionData.duration} minutes</p>
          </div>
        </div>
      </HealthcareCard>

      {/* Clinical Notes Form */}
      <HealthcareForm
        {...HealthcareFormPresets.clinicalNotes}
        onSubmit={handleSubmit}
        validation={validation}
        isPending={isSubmitting}
      >
        {/* Session Planning */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Session Planning</h3>

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Session Objectives *"
            placeholder="What were the main goals for this session?"
            value={sessionData.objectives}
            onChange={(e) => setSessionData(prev => ({ ...prev, objectives: e.target.value }))}
            validation={{
              isValid: sessionData.objectives.length > 0,
              message: !sessionData.objectives ? 'Session objectives are required' : undefined,
              type: !sessionData.objectives ? 'error' : 'success'
            }}
          />
        </div>

        {/* Clinical Observations */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Clinical Observations</h3>

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Clinical Observations *"
            placeholder="Patient presentation, mood, behavior, cognitive state..."
            value={sessionData.observations}
            onChange={(e) => setSessionData(prev => ({ ...prev, observations: e.target.value }))}
            validation={{
              isValid: sessionData.observations.length > 0,
              message: !sessionData.observations ? 'Clinical observations are required' : undefined,
              type: !sessionData.observations ? 'error' : 'success'
            }}
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Interventions Used"
            placeholder="Therapeutic techniques, interventions, and approaches used..."
            value={sessionData.interventions}
            onChange={(e) => setSessionData(prev => ({ ...prev, interventions: e.target.value }))}
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Patient Response"
            placeholder="How did the patient respond to interventions and discussion?"
            value={sessionData.patientResponse}
            onChange={(e) => setSessionData(prev => ({ ...prev, patientResponse: e.target.value }))}
          />
        </div>

        {/* Risk Assessment */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Risk Assessment</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Risk Level</label>
              <div className="space-y-2">
                {['low', 'medium', 'high', 'critical'].map((level) => (
                  <label key={level} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="riskLevel"
                      value={level}
                      checked={sessionData.riskAssessment === level}
                      onChange={(e) => setSessionData(prev => ({ ...prev, riskAssessment: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {sessionData.riskAssessment !== 'low' && (
              <HealthcareTextarea
                {...HealthcareInputPresets.emergencyNotes}
                label="Risk Details"
                placeholder="Describe risk factors and mitigation strategies..."
                value={sessionData.riskAssessment}
                onChange={(e) => setSessionData(prev => ({ ...prev, riskAssessment: e.target.value }))}
              />
            )}
          </div>
        </div>

        {/* Medications & Side Effects */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Medication Review</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthcareTextarea
              healthcareType="medication"
              label="Current Medications"
              placeholder="List current medications and dosages..."
              containsPHI={true}
              complianceLevel="HIPAA"
              accessLevel="confidential"
              value={sessionData.medications}
              onChange={(e) => setSessionData(prev => ({ ...prev, medications: e.target.value }))}
            />

            <HealthcareTextarea
              healthcareType="notes-clinical"
              label="Side Effects or Concerns"
              placeholder="Any reported side effects or medication concerns..."
              containsPHI={true}
              complianceLevel="HIPAA"
              accessLevel="confidential"
              value={sessionData.sideEffects}
              onChange={(e) => setSessionData(prev => ({ ...prev, sideEffects: e.target.value }))}
            />
          </div>
        </div>

        {/* Progress & Planning */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Progress & Next Steps</h3>

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Progress Notes *"
            placeholder="Patient progress, goal achievement, areas of improvement..."
            value={sessionData.progressNotes}
            onChange={(e) => setSessionData(prev => ({ ...prev, progressNotes: e.target.value }))}
            validation={{
              isValid: sessionData.progressNotes.length > 0,
              message: !sessionData.progressNotes ? 'Progress notes are required' : undefined,
              type: !sessionData.progressNotes ? 'error' : 'success'
            }}
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Homework/Between-Session Tasks"
            placeholder="Assignments, exercises, or activities for patient to complete..."
            value={sessionData.homework}
            onChange={(e) => setSessionData(prev => ({ ...prev, homework: e.target.value }))}
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.clinicalNotes}
            label="Next Session Plan"
            placeholder="Goals and focus areas for the next session..."
            value={sessionData.nextSessionPlan}
            onChange={(e) => setSessionData(prev => ({ ...prev, nextSessionPlan: e.target.value }))}
          />
        </div>

        {/* Custom Actions */}
        <div slot="actions" className="flex gap-3 justify-end">
          <HealthcareButton
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
          >
            Cancel
          </HealthcareButton>

          <HealthcareButton
            variant="warning"
            auditAction="save_draft_notes"
            disabled={isSubmitting}
          >
            Save Draft
          </HealthcareButton>

          <HealthcareButton
            variant="primary"
            type="submit"
            isPending={isSubmitting}
            complianceLevel="HIPAA"
            auditAction="submit_clinical_notes"
            containsPHI={true}
          >
            Submit Notes
          </HealthcareButton>
        </div>
      </HealthcareForm>
    </div>
  )
}
```

## Emergency Protocols Interface

### Emergency Contact and Crisis Management

```tsx
import React, { useState } from 'react'
import {
  HealthcareCard,
  HealthcareButton,
  HealthcareForm,
  HealthcareInput,
  HealthcareTextarea,
  HealthcareCardPresets,
  HealthcareButtonPresets,
  HealthcareFormPresets
} from '@/components/ui/healthcare'

export function EmergencyProtocolInterface() {
  const [activeEmergency, setActiveEmergency] = useState<any>(null)
  const [emergencyType, setEmergencyType] = useState<string>('')

  const emergencyContacts = [
    {
      type: 'Crisis Line',
      number: '1-833-456-4566',
      description: 'Quebec Crisis Line (24/7)',
      language: 'French/English'
    },
    {
      type: 'Emergency Services',
      number: '911',
      description: 'Immediate medical emergency',
      language: 'All languages'
    },
    {
      type: 'Poison Control',
      number: '1-800-463-5060',
      description: 'Quebec Poison Control Centre',
      language: 'French/English'
    },
    {
      type: 'Mental Health Crisis',
      number: '1-866-277-3553',
      description: 'Mental Health Crisis Line',
      language: 'French/English'
    }
  ]

  const handleEmergencyCall = (contact: any) => {
    // Log emergency call for audit trail
    console.log('[EMERGENCY AUDIT] Emergency call initiated:', {
      contactType: contact.type,
      number: contact.number,
      timestamp: new Date().toISOString(),
      initiatedBy: getCurrentUser().id
    })

    // Trigger actual call (would integrate with phone system)
    window.open(`tel:${contact.number}`)
  }

  const handleEmergencyReport = (type: string) => {
    setEmergencyType(type)
    setActiveEmergency({
      type,
      timestamp: new Date().toISOString(),
      status: 'active'
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* Emergency Status Banner */}
      {activeEmergency && (
        <HealthcareCard
          {...HealthcareCardPresets.emergencyAlert}
          title="🚨 ACTIVE EMERGENCY PROTOCOL"
          subtitle={`Type: ${activeEmergency.type} | Started: ${new Date(activeEmergency.timestamp).toLocaleTimeString()}`}
          className="animate-pulse border-2 border-red-500"
        >
          <div className="flex gap-4">
            <HealthcareButton
              {...HealthcareButtonPresets.emergencyProtocol}
              onClick={() => handleEmergencyCall(emergencyContacts[1])}
            >
              Call 911 Now
            </HealthcareButton>
            <HealthcareButton
              variant="warning"
              onClick={() => setActiveEmergency(null)}
            >
              Resolve Emergency
            </HealthcareButton>
          </div>
        </HealthcareCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Emergency Contacts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Emergency Contacts</h2>

          {emergencyContacts.map((contact, index) => (
            <HealthcareCard
              key={index}
              variant="emergency"
              title={contact.type}
              subtitle={contact.number}
              priority="critical"
              actions={
                <HealthcareButton
                  {...HealthcareButtonPresets.emergencyProtocol}
                  onClick={() => handleEmergencyCall(contact)}
                  size="compact"
                >
                  Call Now
                </HealthcareButton>
              }
            >
              <div className="space-y-1 text-sm">
                <p><strong>Service:</strong> {contact.description}</p>
                <p><strong>Languages:</strong> {contact.language}</p>
              </div>
            </HealthcareCard>
          ))}
        </div>

        {/* Emergency Protocols */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Emergency Protocols</h2>

          <HealthcareCard
            variant="emergency"
            title="Suicidal Ideation Protocol"
            subtitle="Immediate risk assessment required"
            priority="critical"
            actions={
              <HealthcareButton
                {...HealthcareButtonPresets.emergencyProtocol}
                onClick={() => handleEmergencyReport('suicide_risk')}
                size="compact"
              >
                Activate Protocol
              </HealthcareButton>
            }
          >
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Ensure immediate safety</li>
              <li>Contact crisis line: 1-833-456-4566</li>
              <li>Complete risk assessment form</li>
              <li>Arrange immediate follow-up</li>
              <li>Document all actions taken</li>
            </ol>
          </HealthcareCard>

          <HealthcareCard
            variant="emergency"
            title="Medical Emergency Protocol"
            subtitle="Physical health emergency"
            priority="critical"
            actions={
              <HealthcareButton
                {...HealthcareButtonPresets.emergencyProtocol}
                onClick={() => handleEmergencyReport('medical_emergency')}
                size="compact"
              >
                Activate Protocol
              </HealthcareButton>
            }
          >
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Call 911 immediately</li>
              <li>Provide first aid if trained</li>
              <li>Contact patient emergency contact</li>
              <li>Notify supervisor/manager</li>
              <li>Complete incident report</li>
            </ol>
          </HealthcareCard>

          <HealthcareCard
            variant="emergency"
            title="Substance Use Crisis"
            subtitle="Overdose or severe intoxication"
            priority="critical"
            actions={
              <HealthcareButton
                {...HealthcareButtonPresets.emergencyProtocol}
                onClick={() => handleEmergencyReport('substance_crisis')}
                size="compact"
              >
                Activate Protocol
              </HealthcareButton>
            }
          >
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Assess consciousness and breathing</li>
              <li>Call 911 if unconscious/overdose</li>
              <li>Contact Poison Control: 1-800-463-5060</li>
              <li>Monitor vital signs</li>
              <li>Document substances involved</li>
            </ol>
          </HealthcareCard>
        </div>
      </div>

      {/* Emergency Incident Form */}
      {activeEmergency && (
        <HealthcareForm
          {...HealthcareFormPresets.emergencyInformation}
          title="Emergency Incident Report"
          description="Document emergency response actions"
        >
          <HealthcareInput
            label="Emergency Type"
            value={emergencyType}
            readOnlyReason="Set by protocol activation"
            containsPHI={true}
            complianceLevel="HIPAA"
          />

          <HealthcareInput
            type="datetime-local"
            label="Emergency Start Time"
            value={activeEmergency.timestamp.slice(0, 16)}
            readOnlyReason="Automatically recorded"
            containsPHI={true}
            complianceLevel="HIPAA"
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.emergencyNotes}
            label="Actions Taken"
            placeholder="Document all emergency response actions, contacts made, and outcomes..."
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.emergencyNotes}
            label="Emergency Contacts Called"
            placeholder="List all emergency contacts called, response received..."
          />

          <HealthcareTextarea
            {...HealthcareInputPresets.emergencyNotes}
            label="Resolution and Follow-up"
            placeholder="How was the emergency resolved? What follow-up actions are required?"
          />
        </HealthcareForm>
      )}
    </div>
  )
}
```

These examples demonstrate comprehensive usage of the healthcare components in real-world scenarios, showing proper PHI handling, compliance features, and professional healthcare workflows.