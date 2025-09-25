/**
 * PatientMedicalInfo Component
 *
 * Specialized component for displaying and managing patient medical information
 * with Quebec Law 25 compliance, PHI protection, and WCAG AAA accessibility.
 */

import React, { useState, useId } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Badge,
  Button,
  Accordion,
  AccordionItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Tooltip,
  Divider
} from '@/components/ui/nextui'
import { HealthcareButton } from '@/components/ui/nextui'
import { MedicalInfo, Medication, Client } from '@/types'
import { formatDate } from '@/lib/utils'
import {
  Heart,
  AlertTriangle,
  Pill,
  Activity,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  Calendar,
  Clock,
  User,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

interface PatientMedicalInfoProps {
  patient: Client
  medicalInfo?: MedicalInfo
  canEdit?: boolean
  showPHI?: boolean
  onEdit?: (medicalInfo: MedicalInfo) => void
  onAddMedication?: () => void
  onEditMedication?: (medication: Medication) => void
  onRemoveMedication?: (medication: Medication) => void
  onExportMedicalData?: () => void
  onImportMedicalData?: () => void
  className?: string
}

interface PHIVisibility {
  allergies: boolean
  medications: boolean
  conditions: boolean
  vitals: boolean
  emergencyInfo: boolean
}

interface MedicationInteractionCheck {
  medication1: string
  medication2: string
  severity: 'low' | 'moderate' | 'high' | 'severe'
  description: string
}

export function PatientMedicalInfo({
  patient,
  medicalInfo,
  canEdit = false,
  showPHI = false,
  onEdit,
  onAddMedication,
  onEditMedication,
  onRemoveMedication,
  onExportMedicalData,
  onImportMedicalData,
  className
}: PatientMedicalInfoProps) {
  const [phiVisibility, setPHIVisibility] = useState<PHIVisibility>({
    allergies: showPHI,
    medications: showPHI,
    conditions: showPHI,
    vitals: showPHI,
    emergencyInfo: showPHI
  })
  const [showInteractionWarnings, setShowInteractionWarnings] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)

  const medicalInfoId = useId()
  const allergiesId = useId()
  const medicationsId = useId()
  const conditionsId = useId()
  const vitalsId = useId()

  // Mock medication interaction checker (in real app, this would be an API call)
  const checkMedicationInteractions = (medications: Medication[]): MedicationInteractionCheck[] => {
    if (!medications || medications.length < 2) return []

    // Mock interactions for demonstration
    const interactions: MedicationInteractionCheck[] = []

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase()
        const med2 = medications[j].name.toLowerCase()

        // Example interaction rules (simplified)
        if (med1.includes('warfarin') && med2.includes('aspirin')) {
          interactions.push({
            medication1: medications[i].name,
            medication2: medications[j].name,
            severity: 'high',
            description: 'Increased risk of bleeding when taken together'
          })
        }
      }
    }

    return interactions
  }

  const togglePHIVisibility = (section: keyof PHIVisibility) => {
    setPHIVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }))

    // Audit PHI access
    console.log(`Medical PHI visibility toggled for ${section}:`, {
      patientId: patient.id,
      section,
      visible: !phiVisibility[section],
      timestamp: new Date().toISOString(),
      complianceLevel: 'PIPEDA_LAW25'
    })
  }

  const maskPHI = (value: string, visible: boolean): string => {
    if (visible || !value) return value
    return '•'.repeat(Math.min(value.length, 12))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'success'
      case 'moderate':
        return 'warning'
      case 'high':
        return 'danger'
      case 'severe':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getAllergyRiskLevel = (allergies: string[]) => {
    if (!allergies || allergies.length === 0) return 'none'
    if (allergies.length === 1) return 'low'
    if (allergies.length <= 3) return 'moderate'
    return 'high'
  }

  const getBMI = (height?: number, weight?: number): number | null => {
    if (!height || !weight) return null
    return Number((weight / ((height / 100) ** 2)).toFixed(1))
  }

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'warning' }
    if (bmi < 25) return { category: 'Normal', color: 'success' }
    if (bmi < 30) return { category: 'Overweight', color: 'warning' }
    return { category: 'Obese', color: 'danger' }
  }

  const interactions = medicalInfo?.medications
    ? checkMedicationInteractions(medicalInfo.medications)
    : []

  const bmi = getBMI(medicalInfo?.height, medicalInfo?.weight)
  const bmiInfo = bmi ? getBMICategory(bmi) : null

  if (!medicalInfo) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-12">
          <Heart className="h-16 w-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-default-600 mb-2">
            No Medical Information Available
          </h3>
          <p className="text-default-500 mb-6">
            Medical information has not been provided for this patient.
          </p>
          {canEdit && (
            <HealthcareButton
              variant="primary"
              onClick={() => onEdit?.(medicalInfo || {} as MedicalInfo)}
              auditAction="add_medical_info"
              complianceLevel="HIPAA"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medical Information
            </HealthcareButton>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold">Medical Information</h2>
                <p className="text-sm text-default-600">
                  Last updated: {formatDate(patient.updatedAt || patient.createdAt)}
                </p>
              </div>
              <Badge color="warning" variant="flat">PHI Protected</Badge>
            </div>

            <div className="flex items-center gap-2">
              {interactions.length > 0 && (
                <Tooltip content={`${interactions.length} drug interaction(s) detected`}>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onClick={() => setShowInteractionWarnings(true)}
                    aria-label="View drug interactions"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {interactions.length}
                  </Button>
                </Tooltip>
              )}

              {canEdit && (
                <div className="flex gap-2">
                  {onImportMedicalData && (
                    <HealthcareButton
                      size="sm"
                      variant="secondary"
                      onClick={onImportMedicalData}
                      auditAction="import_medical_data"
                      complianceLevel="HIPAA"
                    >
                      <Upload className="h-4 w-4" />
                    </HealthcareButton>
                  )}

                  {onExportMedicalData && (
                    <HealthcareButton
                      size="sm"
                      variant="secondary"
                      onClick={onExportMedicalData}
                      auditAction="export_medical_data"
                      complianceLevel="HIPAA"
                    >
                      <Download className="h-4 w-4" />
                    </HealthcareButton>
                  )}

                  <HealthcareButton
                    size="sm"
                    variant="primary"
                    onClick={() => onEdit?.(medicalInfo)}
                    auditAction="edit_medical_info"
                    complianceLevel="HIPAA"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </HealthcareButton>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Medical Information Accordion */}
      <Accordion
        variant="splitted"
        selectionMode="multiple"
        defaultExpandedKeys={['allergies', 'medications']}
      >
        {/* Allergies Section */}
        <AccordionItem
          key="allergies"
          aria-label="Allergies and adverse reactions"
          title={
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
              <span className="font-semibold">Allergies & Adverse Reactions</span>
              {medicalInfo.allergies && medicalInfo.allergies.length > 0 && (
                <Chip
                  size="sm"
                  color={getSeverityColor(getAllergyRiskLevel(medicalInfo.allergies)) as any}
                  variant="flat"
                >
                  {medicalInfo.allergies.length} allergie(s)
                </Chip>
              )}
              <Button
                size="sm"
                variant="light"
                onClick={() => togglePHIVisibility('allergies')}
                aria-label="Toggle allergies visibility"
              >
                {phiVisibility.allergies ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          }
        >
          <div className={`space-y-4 ${!phiVisibility.allergies ? 'opacity-50' : ''}`}>
            {medicalInfo.allergies && medicalInfo.allergies.length > 0 ? (
              <div className="grid gap-3">
                {medicalInfo.allergies.map((allergy, index) => (
                  <Card key={index} className="border border-danger-200 bg-danger-50">
                    <CardBody className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-danger-600" />
                          <span className="font-medium text-danger-900">
                            {phiVisibility.allergies ? allergy : maskPHI(allergy, false)}
                          </span>
                        </div>
                        <Chip size="sm" color="danger" variant="flat">
                          High Priority
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-success-500 mx-auto mb-2" />
                <p className="text-success-700 font-medium">No known allergies</p>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Current Medications */}
        <AccordionItem
          key="medications"
          aria-label="Current medications"
          title={
            <div className="flex items-center gap-3">
              <Pill className="h-5 w-5 text-primary-600" />
              <span className="font-semibold">Current Medications</span>
              {medicalInfo.medications && medicalInfo.medications.length > 0 && (
                <Chip size="sm" color="primary" variant="flat">
                  {medicalInfo.medications.length} medication(s)
                </Chip>
              )}
              <Button
                size="sm"
                variant="light"
                onClick={() => togglePHIVisibility('medications')}
                aria-label="Toggle medications visibility"
              >
                {phiVisibility.medications ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          }
        >
          <div className={`space-y-4 ${!phiVisibility.medications ? 'opacity-50' : ''}`}>
            {medicalInfo.medications && medicalInfo.medications.length > 0 ? (
              <div className="space-y-3">
                {medicalInfo.medications.map((medication, index) => (
                  <Card key={index} className="border border-primary-200">
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-primary-900">
                              {phiVisibility.medications ? medication.name : maskPHI(medication.name, false)}
                            </h4>
                            <Chip size="sm" color="primary" variant="flat">
                              Active
                            </Chip>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <label className="text-default-600 font-medium">Dosage</label>
                              <p className="text-default-900">
                                {phiVisibility.medications ? medication.dosage : maskPHI(medication.dosage, false)}
                              </p>
                            </div>

                            <div>
                              <label className="text-default-600 font-medium">Frequency</label>
                              <p className="text-default-900">
                                {phiVisibility.medications ? medication.frequency : maskPHI(medication.frequency, false)}
                              </p>
                            </div>

                            <div>
                              <label className="text-default-600 font-medium">Prescribed</label>
                              <p className="text-default-900">
                                {formatDate(medication.prescribedDate)}
                              </p>
                            </div>
                          </div>

                          {medication.prescribedBy && (
                            <div className="mt-2 text-sm">
                              <label className="text-default-600 font-medium">Prescribed by</label>
                              <p className="text-default-900">
                                {phiVisibility.medications ? medication.prescribedBy : maskPHI(medication.prescribedBy, false)}
                              </p>
                            </div>
                          )}

                          {medication.notes && (
                            <div className="mt-2 text-sm">
                              <label className="text-default-600 font-medium">Notes</label>
                              <p className="text-default-700">
                                {phiVisibility.medications ? medication.notes : maskPHI(medication.notes, false)}
                              </p>
                            </div>
                          )}
                        </div>

                        {canEdit && (
                          <div className="flex gap-1 ml-4">
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => onEditMedication?.(medication)}
                              aria-label={`Edit ${medication.name}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onClick={() => onRemoveMedication?.(medication)}
                              aria-label={`Remove ${medication.name}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}

                {canEdit && onAddMedication && (
                  <Card className="border-2 border-dashed border-default-300">
                    <CardBody className="text-center py-6">
                      <HealthcareButton
                        variant="secondary"
                        onClick={onAddMedication}
                        auditAction="add_medication"
                        complianceLevel="HIPAA"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </HealthcareButton>
                    </CardBody>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Pill className="h-8 w-8 text-default-300 mx-auto mb-2" />
                <p className="text-default-600 mb-4">No current medications</p>
                {canEdit && onAddMedication && (
                  <HealthcareButton
                    variant="primary"
                    onClick={onAddMedication}
                    auditAction="add_medication"
                    complianceLevel="HIPAA"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Medication
                  </HealthcareButton>
                )}
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Medical Conditions */}
        <AccordionItem
          key="conditions"
          aria-label="Medical conditions"
          title={
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-warning-600" />
              <span className="font-semibold">Medical Conditions</span>
              {medicalInfo.medicalConditions && medicalInfo.medicalConditions.length > 0 && (
                <Chip size="sm" color="warning" variant="flat">
                  {medicalInfo.medicalConditions.length} condition(s)
                </Chip>
              )}
              <Button
                size="sm"
                variant="light"
                onClick={() => togglePHIVisibility('conditions')}
                aria-label="Toggle conditions visibility"
              >
                {phiVisibility.conditions ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          }
        >
          <div className={`space-y-4 ${!phiVisibility.conditions ? 'opacity-50' : ''}`}>
            {medicalInfo.medicalConditions && medicalInfo.medicalConditions.length > 0 ? (
              <div className="grid gap-2">
                {medicalInfo.medicalConditions.map((condition, index) => (
                  <Card key={index} className="border border-warning-200 bg-warning-50">
                    <CardBody className="py-3">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-warning-600" />
                        <span className="font-medium text-warning-900">
                          {phiVisibility.conditions ? condition : maskPHI(condition, false)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-success-500 mx-auto mb-2" />
                <p className="text-success-700 font-medium">No known medical conditions</p>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Vital Statistics */}
        <AccordionItem
          key="vitals"
          aria-label="Vital statistics"
          title={
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-secondary-600" />
              <span className="font-semibold">Vital Statistics</span>
              <Button
                size="sm"
                variant="light"
                onClick={() => togglePHIVisibility('vitals')}
                aria-label="Toggle vitals visibility"
              >
                {phiVisibility.vitals ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
            </div>
          }
        >
          <div className={`space-y-6 ${!phiVisibility.vitals ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {medicalInfo.height && (
                <Card>
                  <CardBody className="text-center py-4">
                    <p className="text-2xl font-bold text-primary-600">
                      {phiVisibility.vitals ? `${medicalInfo.height}` : '•••'}
                    </p>
                    <p className="text-sm text-default-600">Height (cm)</p>
                  </CardBody>
                </Card>
              )}

              {medicalInfo.weight && (
                <Card>
                  <CardBody className="text-center py-4">
                    <p className="text-2xl font-bold text-primary-600">
                      {phiVisibility.vitals ? `${medicalInfo.weight}` : '•••'}
                    </p>
                    <p className="text-sm text-default-600">Weight (kg)</p>
                  </CardBody>
                </Card>
              )}

              {bmi && (
                <Card>
                  <CardBody className="text-center py-4">
                    <p className={`text-2xl font-bold text-${bmiInfo?.color}-600`}>
                      {phiVisibility.vitals ? bmi : '••.•'}
                    </p>
                    <p className="text-sm text-default-600">BMI</p>
                    {bmiInfo && phiVisibility.vitals && (
                      <Chip size="sm" color={bmiInfo.color as any} variant="flat" className="mt-1">
                        {bmiInfo.category}
                      </Chip>
                    )}
                  </CardBody>
                </Card>
              )}

              {medicalInfo.bloodType && (
                <Card>
                  <CardBody className="text-center py-4">
                    <p className="text-2xl font-bold text-danger-600">
                      {phiVisibility.vitals ? medicalInfo.bloodType : '•••'}
                    </p>
                    <p className="text-sm text-default-600">Blood Type</p>
                  </CardBody>
                </Card>
              )}
            </div>

            {!medicalInfo.height && !medicalInfo.weight && !medicalInfo.bloodType && (
              <div className="text-center py-6">
                <Heart className="h-8 w-8 text-default-300 mx-auto mb-2" />
                <p className="text-default-600">No vital statistics recorded</p>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Emergency Medical Information */}
        {medicalInfo.emergencyMedicalInfo && (
          <AccordionItem
            key="emergency"
            aria-label="Emergency medical information"
            title={
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
                <span className="font-semibold">Emergency Medical Information</span>
                <Badge color="danger" variant="flat">Critical</Badge>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => togglePHIVisibility('emergencyInfo')}
                  aria-label="Toggle emergency info visibility"
                >
                  {phiVisibility.emergencyInfo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </div>
            }
          >
            <Card className="border border-danger-200 bg-danger-50">
              <CardBody className={!phiVisibility.emergencyInfo ? 'opacity-50' : ''}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-danger-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-danger-900 mb-2">
                      Critical Emergency Information
                    </h4>
                    <p className="text-danger-800">
                      {phiVisibility.emergencyInfo
                        ? medicalInfo.emergencyMedicalInfo
                        : maskPHI(medicalInfo.emergencyMedicalInfo, false)
                      }
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </AccordionItem>
        )}
      </Accordion>

      {/* Drug Interaction Warnings Modal */}
      <Modal
        isOpen={showInteractionWarnings}
        onClose={() => setShowInteractionWarnings(false)}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-danger-600" />
                Drug Interaction Warnings
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {interactions.map((interaction, index) => (
                    <Card
                      key={index}
                      className={`border border-${getSeverityColor(interaction.severity)}-200`}
                    >
                      <CardBody>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className={`h-4 w-4 text-${getSeverityColor(interaction.severity)}-600`} />
                              <span className="font-semibold">
                                {interaction.medication1} + {interaction.medication2}
                              </span>
                              <Chip
                                size="sm"
                                color={getSeverityColor(interaction.severity) as any}
                                variant="flat"
                              >
                                {interaction.severity} risk
                              </Chip>
                            </div>
                            <p className="text-default-700">
                              {interaction.description}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Acknowledge
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

// Export with display name for debugging
PatientMedicalInfo.displayName = 'PatientMedicalInfo'