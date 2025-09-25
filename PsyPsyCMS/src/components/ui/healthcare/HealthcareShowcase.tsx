import React, { useState } from 'react'
import { Card, CardHeader, CardBody, Divider } from '@/components/ui/nextui'
import { Heart, Shield, Users, Calendar, FileText, AlertTriangle } from 'lucide-react'
import { designTokens } from '@/ui/design-tokens'
import {
  HealthcareButton,
  HealthcareButtonPresets,
  HealthcareCard,
  HealthcareCardPresets,
  HealthcareInput,
  HealthcareTextarea,
  HealthcareInputPresets,
  HealthcareForm,
  HealthcareFormPresets,
} from './index'

/**
 * HealthcareShowcase - Demonstrates all healthcare components with design token integration
 *
 * This component showcases:
 * - Design token integration across all components
 * - Healthcare-specific variants and styling
 * - HIPAA compliance features
 * - Quebec Law 25 compliance indicators
 * - Accessibility features (44px touch targets, WCAG AAA colors)
 */
export function HealthcareShowcase() {
  const [selectedVariant, setSelectedVariant] = useState<'patient' | 'professional' | 'emergency'>('patient')
  const [showPHI, setShowPHI] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    medicalId: '',
    notes: '',
  })

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-4 text-[${designTokens.colors.text.primary}]`}>
          PsyPsy Healthcare Design System
        </h1>
        <p className={`text-lg text-[${designTokens.colors.text.secondary}] max-w-3xl mx-auto`}>
          A comprehensive design system built on NextUI with healthcare-specific components,
          design tokens, HIPAA compliance, and Quebec Law 25 support.
        </p>
      </div>

      {/* Design Token Showcase */}
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Heart className={`h-6 w-6 text-[${designTokens.colors.alert.critical}]`} />
            Design Token Integration
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Healthcare Colors */}
            <div>
              <h3 className="font-semibold mb-3">Healthcare Status Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.status.available }}
                  />
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.status.busy }}
                  />
                  <span className="text-sm">Busy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.status.emergency }}
                  />
                  <span className="text-sm">Emergency</span>
                </div>
              </div>
            </div>

            {/* Compliance Colors */}
            <div>
              <h3 className="font-semibold mb-3">Compliance Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.compliance.phi }}
                  />
                  <span className="text-sm">PHI Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.compliance.encrypted }}
                  />
                  <span className="text-sm">Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.compliance.audit }}
                  />
                  <span className="text-sm">Audit Trail</span>
                </div>
              </div>
            </div>

            {/* Alert Colors */}
            <div>
              <h3 className="font-semibold mb-3">Alert Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.alert.success }}
                  />
                  <span className="text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.alert.warning }}
                  />
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: designTokens.colors.alert.critical }}
                  />
                  <span className="text-sm">Critical</span>
                </div>
              </div>
            </div>

            {/* Typography Scale */}
            <div>
              <h3 className="font-semibold mb-3">Typography Scale</h3>
              <div className="space-y-1">
                <p style={{ fontSize: designTokens.typography.fontSize.xs }}>12px - Captions</p>
                <p style={{ fontSize: designTokens.typography.fontSize.sm }}>14px - Secondary</p>
                <p style={{ fontSize: designTokens.typography.fontSize.base }}>16px - Body (Min)</p>
                <p style={{ fontSize: designTokens.typography.fontSize.lg }}>18px - Large</p>
                <p style={{ fontSize: designTokens.typography.fontSize.xl }}>20px - Subheading</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Healthcare Buttons */}
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className={`h-6 w-6 text-[${designTokens.colors.interactive.primary}]`} />
            Healthcare Buttons
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HealthcareButton
              {...HealthcareButtonPresets.scheduleAppointment}
            >
              Schedule Appointment
            </HealthcareButton>

            <HealthcareButton
              {...HealthcareButtonPresets.viewMedicalRecord}
            >
              View Medical Record
            </HealthcareButton>

            <HealthcareButton
              {...HealthcareButtonPresets.emergencyProtocol}
            >
              Emergency Protocol
            </HealthcareButton>

            <HealthcareButton
              {...HealthcareButtonPresets.consentManagement}
            >
              Consent Management
            </HealthcareButton>

            <HealthcareButton
              {...HealthcareButtonPresets.signDocument}
            >
              Sign Document
            </HealthcareButton>

            <HealthcareButton
              {...HealthcareButtonPresets.reviewRequired}
            >
              Review Required
            </HealthcareButton>
          </div>
        </CardBody>
      </Card>

      {/* Healthcare Cards */}
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className={`h-6 w-6 text-[${designTokens.colors.status.available}]`} />
            Healthcare Cards
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HealthcareCard
              {...HealthcareCardPresets.patientActive}
              title="Emily Johnson"
              subtitle="Patient ID: PAT-001"
              avatar={{
                name: "Emily Johnson",
                color: "primary"
              }}
            >
              <p className="text-sm">Next appointment: Jan 25, 2025 at 2:00 PM</p>
              <p className="text-sm text-gray-600">Last visit: Jan 10, 2025</p>
            </HealthcareCard>

            <HealthcareCard
              {...HealthcareCardPresets.professionalActive}
              title="Dr. Sarah Wilson"
              subtitle="License: PSY-QC-12345"
              avatar={{
                name: "Dr. Sarah Wilson",
                color: "success"
              }}
            >
              <p className="text-sm">Specialization: Clinical Psychology</p>
              <p className="text-sm text-gray-600">Available: 9:00 AM - 5:00 PM</p>
            </HealthcareCard>

            <HealthcareCard
              {...HealthcareCardPresets.appointmentScheduled}
              title="Therapy Session"
              subtitle="50-minute session"
            >
              <p className="text-sm">Jan 25, 2025 at 2:00 PM</p>
              <p className="text-sm text-gray-600">Patient: Emily Johnson</p>
              <p className="text-sm text-gray-600">Provider: Dr. Sarah Wilson</p>
            </HealthcareCard>

            <HealthcareCard
              {...HealthcareCardPresets.emergencyAlert}
              title="Emergency Alert"
              subtitle="Critical patient notification"
            >
              <p className="text-sm font-medium text-red-600">
                Patient requires immediate attention
              </p>
              <p className="text-sm">Contact: Emergency Line ext. 911</p>
            </HealthcareCard>

            <HealthcareCard
              {...HealthcareCardPresets.medicalRecord}
              title="Medical Record"
              subtitle="Session Notes - Jan 10, 2025"
            >
              <p className="text-sm">Patient showed significant improvement...</p>
              <p className="text-sm text-gray-600">Signed by: Dr. Sarah Wilson</p>
            </HealthcareCard>

            <HealthcareCard
              {...HealthcareCardPresets.complianceAudit}
              title="Compliance Review"
              subtitle="Quebec Law 25 Audit"
            >
              <p className="text-sm">Annual compliance review required</p>
              <p className="text-sm text-gray-600">Due: Feb 1, 2025</p>
            </HealthcareCard>
          </div>
        </CardBody>
      </Card>

      {/* Healthcare Form */}
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className={`h-6 w-6 text-[${designTokens.colors.alert.warning}]`} />
            Healthcare Forms
          </h2>
        </CardHeader>
        <CardBody>
          <HealthcareForm
            {...HealthcareFormPresets.patientRegistration}
            onSubmit={handleFormSubmit}
            validation={{
              isValid: formData.patientName.length > 0 && formData.medicalId.length > 0,
              warnings: formData.notes.length === 0 ? ['Consider adding clinical notes'] : undefined,
            }}
          >
            <HealthcareInput
              {...HealthcareInputPresets.patientName}
              label="Patient Full Name"
              placeholder="Enter patient's full legal name"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              validation={{
                isValid: formData.patientName.length > 2,
                message: formData.patientName.length > 0 && formData.patientName.length <= 2
                  ? 'Name must be at least 3 characters'
                  : undefined,
                type: formData.patientName.length > 0 && formData.patientName.length <= 2
                  ? 'error'
                  : formData.patientName.length > 2
                    ? 'success'
                    : undefined
              }}
            />

            <HealthcareInput
              {...HealthcareInputPresets.medicalRecordNumber}
              label="Medical Record Number"
              placeholder="MRN-12345"
              value={formData.medicalId}
              onChange={(e) => setFormData(prev => ({ ...prev, medicalId: e.target.value }))}
              validation={{
                isValid: /^[A-Z]{3}-\d{5}$/.test(formData.medicalId),
                message: formData.medicalId.length > 0 && !/^[A-Z]{3}-\d{5}$/.test(formData.medicalId)
                  ? 'Format: ABC-12345'
                  : undefined,
                type: formData.medicalId.length > 0 && !/^[A-Z]{3}-\d{5}$/.test(formData.medicalId)
                  ? 'error'
                  : /^[A-Z]{3}-\d{5}$/.test(formData.medicalId)
                    ? 'success'
                    : undefined
              }}
            />

            <HealthcareTextarea
              {...HealthcareInputPresets.clinicalNotes}
              label="Clinical Notes"
              placeholder="Enter clinical observations and notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </HealthcareForm>
        </CardBody>
      </Card>

      {/* Accessibility Features */}
      <Card className="p-6">
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className={`h-6 w-6 text-[${designTokens.colors.compliance.phi}]`} />
            Accessibility & Compliance Features
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">WCAG AAA Compliance</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  7:1 contrast ratio for normal text
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  4.5:1 contrast ratio for large text
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Minimum 16px font size for body text
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  44px minimum touch targets
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Semantic HTML and ARIA attributes
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">HIPAA & Quebec Law 25</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  PHI data marking and encryption
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Comprehensive audit logging
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Quebec data residency compliance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  72-hour breach notification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  Explicit consent tracking
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Footer */}
      <div className="text-center py-8">
        <p className={`text-sm text-[${designTokens.colors.text.secondary}]`}>
          PsyPsy Healthcare Design System • Built with NextUI + Healthcare Design Tokens
          <br />
          HIPAA Compliant • Quebec Law 25 Compliant • WCAG AAA Accessible
        </p>
      </div>
    </div>
  )
}