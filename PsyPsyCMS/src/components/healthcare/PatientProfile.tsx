/**
 * PatientProfile Component
 *
 * Comprehensive patient profile view component with WCAG AAA accessibility
 * and Quebec Law 25 compliance for healthcare data display.
 */

import React, { useState } from 'react'
import {
  HealthcareCard,
  HealthcareButton,
  HealthcareCardPresets,
  Chip,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader
} from '@/components/ui/nextui'
import { Client, EmergencyContact, InsuranceInfo } from '@/types'
import { formatDate, calculateAge, getInitials } from '@/lib/utils'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Shield,
  AlertTriangle,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  UserCheck,
  Activity
} from 'lucide-react'

interface PatientProfileProps {
  patient: Client
  isOpen: boolean
  onClose: () => void
  onEdit?: (patient: Client) => void
  onScheduleAppointment?: (patient: Client) => void
  onViewMedicalHistory?: (patient: Client) => void
  canEdit?: boolean
  showPHI?: boolean
}

interface PHIVisibilityState {
  medicalInfo: boolean
  emergencyContact: boolean
  insuranceInfo: boolean
}

export function PatientProfile({
  patient,
  isOpen,
  onClose,
  onEdit,
  onScheduleAppointment,
  onViewMedicalHistory,
  canEdit = false,
  showPHI = false
}: PatientProfileProps) {
  const [phiVisibility, setPHIVisibility] = useState<PHIVisibilityState>({
    medicalInfo: showPHI,
    emergencyContact: showPHI,
    insuranceInfo: showPHI
  })
  const [selectedTab, setSelectedTab] = useState<string>('overview')

  const age = patient.user.profile?.dateOfBirth
    ? calculateAge(patient.user.profile.dateOfBirth)
    : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      case 'pending':
        return 'warning'
      case 'archived':
        return 'danger'
      default:
        return 'default'
    }
  }

  const togglePHIVisibility = (section: keyof PHIVisibilityState) => {
    setPHIVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }))

    // Audit PHI access
    console.log(`PHI visibility toggled for ${section}:`, {
      patientId: patient.id,
      section,
      visible: !phiVisibility[section],
      timestamp: new Date().toISOString()
    })
  }

  const maskPHI = (value: string, visible: boolean): string => {
    if (visible || !value) return value
    return '•'.repeat(Math.min(value.length, 8))
  }

  const formatPhoneNumber = (phone: string, visible: boolean): string => {
    if (!phone) return 'Not provided'
    if (visible) return phone
    return phone.replace(/\d(?=\d{4})/g, '•')
  }

  const nextAppointment = patient.appointments?.find(
    apt => apt.status === 'scheduled' && new Date(apt.scheduledDate) > new Date()
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        wrapper: "z-[1001]",
        backdrop: "z-[1000]",
        base: "max-h-[90vh]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-3 border-b border-divider">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={patient.user.profile?.avatar}
                    name={patient.user.profile?.fullName || 'Unknown Patient'}
                    size="lg"
                    color="primary"
                    isBordered
                  />
                  <div>
                    <h2 className="text-xl font-semibold">
                      {patient.user.profile?.fullName || 'Unknown Patient'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-default-600">
                        ID: {patient.clientId}
                      </span>
                      <Chip
                        size="sm"
                        color={getStatusColor(patient.status) as any}
                        variant="flat"
                      >
                        {patient.status}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {canEdit && (
                    <HealthcareButton
                      size="sm"
                      variant="secondary"
                      onClick={() => onEdit?.(patient)}
                      auditAction="edit_patient_profile"
                      complianceLevel="HIPAA"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </HealthcareButton>
                  )}

                  <HealthcareButton
                    size="sm"
                    variant="primary"
                    onClick={() => onScheduleAppointment?.(patient)}
                    auditAction="schedule_appointment"
                    complianceLevel="HIPAA"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </HealthcareButton>
                </div>
              </div>

              {/* PHI Visibility Controls */}
              <div className="flex items-center gap-2 p-2 bg-warning-50 rounded-lg border border-warning-200">
                <Shield className="h-4 w-4 text-warning-600" />
                <span className="text-sm font-medium text-warning-800">
                  Protected Health Information Controls
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => togglePHIVisibility('medicalInfo')}
                    aria-label={`Toggle medical information visibility`}
                  >
                    {phiVisibility.medicalInfo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Medical
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => togglePHIVisibility('emergencyContact')}
                    aria-label={`Toggle emergency contact visibility`}
                  >
                    {phiVisibility.emergencyContact ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Emergency
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => togglePHIVisibility('insuranceInfo')}
                    aria-label={`Toggle insurance information visibility`}
                  >
                    {phiVisibility.insuranceInfo ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Insurance
                  </Button>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-6">
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                aria-label="Patient information tabs"
                classNames={{
                  tabList: "w-full",
                  cursor: "w-full bg-primary-500",
                  tab: "max-w-fit px-4 h-12",
                  tabContent: "group-data-[selected=true]:text-white"
                }}
              >
                <Tab key="overview" title="Overview">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary-600" />
                          <h3 className="text-lg font-semibold">Basic Information</h3>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-default-700">Full Name</label>
                            <p className="text-default-900">
                              {patient.user.profile?.fullName || 'Not provided'}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-default-700">Email</label>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-default-600" />
                              <p className="text-default-900">{patient.user.email}</p>
                            </div>
                          </div>

                          {patient.user.profile?.phone && (
                            <div>
                              <label className="text-sm font-medium text-default-700">Phone</label>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-default-600" />
                                <p className="text-default-900">
                                  {formatPhoneNumber(patient.user.profile.phone, true)}
                                </p>
                              </div>
                            </div>
                          )}

                          {age && (
                            <div>
                              <label className="text-sm font-medium text-default-700">Age</label>
                              <p className="text-default-900">{age} years old</p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium text-default-700">Patient Since</label>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-default-600" />
                              <p className="text-default-900">
                                {formatDate(patient.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-default-700">Last Updated</label>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-default-600" />
                              <p className="text-default-900">
                                {formatDate(patient.updatedAt || patient.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Next Appointment */}
                    {nextAppointment && (
                      <Card className="bg-primary-50 border border-primary-200">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary-600" />
                            <h3 className="text-lg font-semibold text-primary-900">Next Appointment</h3>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-primary-900">
                                {formatDate(nextAppointment.scheduledDate, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-sm text-primary-700">
                                {nextAppointment.type.replace('_', ' ')} • {nextAppointment.duration} minutes
                              </p>
                            </div>
                            <Chip size="sm" color="primary" variant="flat">
                              {nextAppointment.status}
                            </Chip>
                          </div>
                        </CardBody>
                      </Card>
                    )}

                    {/* Assigned Professionals */}
                    {patient.assignedProfessionals && patient.assignedProfessionals.length > 0 && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-primary-600" />
                            <h3 className="text-lg font-semibold">Care Team</h3>
                          </div>
                        </CardHeader>
                        <CardBody>
                          <div className="flex flex-wrap gap-2">
                            {patient.assignedProfessionals.map((professional) => (
                              <Chip
                                key={professional.id}
                                size="md"
                                color="secondary"
                                variant="flat"
                                avatar={
                                  <Avatar
                                    src={professional.user.profile?.avatar}
                                    name={professional.user.profile?.fullName || 'Dr. Unknown'}
                                    size="sm"
                                  />
                                }
                              >
                                Dr. {professional.user.profile?.lastName || 'Unknown'}
                              </Chip>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </Tab>

                <Tab key="medical" title="Medical Information">
                  <div className="space-y-6">
                    {patient.medicalInfo ? (
                      <Card className={!phiVisibility.medicalInfo ? 'opacity-50' : ''}>
                        <CardHeader>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Heart className="h-5 w-5 text-primary-600" />
                              <h3 className="text-lg font-semibold">Medical Information</h3>
                              <Badge color="warning" variant="flat">PHI</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => togglePHIVisibility('medicalInfo')}
                              aria-label="Toggle medical information visibility"
                            >
                              {phiVisibility.medicalInfo ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                          {patient.medicalInfo.allergies && patient.medicalInfo.allergies.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-default-700 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-danger-600" />
                                Allergies
                              </label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {patient.medicalInfo.allergies.map((allergy, index) => (
                                  <Chip
                                    key={index}
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                  >
                                    {phiVisibility.medicalInfo ? allergy : maskPHI(allergy, false)}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}

                          {patient.medicalInfo.medicalConditions && patient.medicalInfo.medicalConditions.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-default-700">Medical Conditions</label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {patient.medicalInfo.medicalConditions.map((condition, index) => (
                                  <Chip
                                    key={index}
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                  >
                                    {phiVisibility.medicalInfo ? condition : maskPHI(condition, false)}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}

                          {patient.medicalInfo.medications && patient.medicalInfo.medications.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-default-700">Current Medications</label>
                              <div className="space-y-2 mt-2">
                                {patient.medicalInfo.medications.map((medication, index) => (
                                  <div key={index} className="p-3 bg-default-100 rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">
                                          {phiVisibility.medicalInfo ? medication.name : maskPHI(medication.name, false)}
                                        </p>
                                        <p className="text-sm text-default-600">
                                          {phiVisibility.medicalInfo ? medication.dosage : maskPHI(medication.dosage, false)} • {phiVisibility.medicalInfo ? medication.frequency : maskPHI(medication.frequency, false)}
                                        </p>
                                      </div>
                                      <Chip size="sm" color="primary" variant="flat">
                                        {formatDate(medication.prescribedDate)}
                                      </Chip>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patient.medicalInfo.bloodType && (
                              <div>
                                <label className="text-sm font-medium text-default-700">Blood Type</label>
                                <p className="text-default-900">
                                  {phiVisibility.medicalInfo ? patient.medicalInfo.bloodType : maskPHI(patient.medicalInfo.bloodType, false)}
                                </p>
                              </div>
                            )}

                            {patient.medicalInfo.height && (
                              <div>
                                <label className="text-sm font-medium text-default-700">Height</label>
                                <p className="text-default-900">
                                  {phiVisibility.medicalInfo ? `${patient.medicalInfo.height} cm` : '••• cm'}
                                </p>
                              </div>
                            )}

                            {patient.medicalInfo.weight && (
                              <div>
                                <label className="text-sm font-medium text-default-700">Weight</label>
                                <p className="text-default-900">
                                  {phiVisibility.medicalInfo ? `${patient.medicalInfo.weight} kg` : '••• kg'}
                                </p>
                              </div>
                            )}
                          </div>

                          {patient.medicalInfo.emergencyMedicalInfo && (
                            <div>
                              <label className="text-sm font-medium text-default-700">Emergency Medical Information</label>
                              <p className="text-default-900 mt-1 p-3 bg-danger-50 rounded-lg border border-danger-200">
                                {phiVisibility.medicalInfo ? patient.medicalInfo.emergencyMedicalInfo : maskPHI(patient.medicalInfo.emergencyMedicalInfo, false)}
                              </p>
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    ) : (
                      <Card>
                        <CardBody className="text-center py-8">
                          <Heart className="h-12 w-12 text-default-300 mx-auto mb-4" />
                          <p className="text-default-600">No medical information available</p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </Tab>

                <Tab key="emergency" title="Emergency Contact">
                  <div className="space-y-6">
                    {patient.emergencyContact ? (
                      <Card className={!phiVisibility.emergencyContact ? 'opacity-50' : ''}>
                        <CardHeader>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-danger-600" />
                              <h3 className="text-lg font-semibold">Emergency Contact</h3>
                              <Badge color="warning" variant="flat">PHI</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => togglePHIVisibility('emergencyContact')}
                              aria-label="Toggle emergency contact visibility"
                            >
                              {phiVisibility.emergencyContact ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-default-700">Name</label>
                              <p className="text-default-900">
                                {phiVisibility.emergencyContact ? patient.emergencyContact.name : maskPHI(patient.emergencyContact.name, false)}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-default-700">Relationship</label>
                              <p className="text-default-900">
                                {phiVisibility.emergencyContact ? patient.emergencyContact.relationship : maskPHI(patient.emergencyContact.relationship, false)}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-default-700">Phone</label>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-default-600" />
                                <p className="text-default-900">
                                  {formatPhoneNumber(patient.emergencyContact.phone, phiVisibility.emergencyContact)}
                                </p>
                              </div>
                            </div>

                            {patient.emergencyContact.email && (
                              <div>
                                <label className="text-sm font-medium text-default-700">Email</label>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-default-600" />
                                  <p className="text-default-900">
                                    {phiVisibility.emergencyContact ? patient.emergencyContact.email : maskPHI(patient.emergencyContact.email, false)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <Card>
                        <CardBody className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 text-default-300 mx-auto mb-4" />
                          <p className="text-default-600">No emergency contact information available</p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </Tab>

                <Tab key="insurance" title="Insurance">
                  <div className="space-y-6">
                    {patient.insuranceInfo ? (
                      <Card className={!phiVisibility.insuranceInfo ? 'opacity-50' : ''}>
                        <CardHeader>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-primary-600" />
                              <h3 className="text-lg font-semibold">Insurance Information</h3>
                              <Badge color="warning" variant="flat">PHI</Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => togglePHIVisibility('insuranceInfo')}
                              aria-label="Toggle insurance information visibility"
                            >
                              {phiVisibility.insuranceInfo ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardBody className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-default-700">Provider</label>
                              <p className="text-default-900">
                                {phiVisibility.insuranceInfo ? patient.insuranceInfo.provider : maskPHI(patient.insuranceInfo.provider, false)}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-default-700">Policy Number</label>
                              <p className="text-default-900">
                                {phiVisibility.insuranceInfo ? patient.insuranceInfo.policyNumber : maskPHI(patient.insuranceInfo.policyNumber, false)}
                              </p>
                            </div>

                            {patient.insuranceInfo.groupNumber && (
                              <div>
                                <label className="text-sm font-medium text-default-700">Group Number</label>
                                <p className="text-default-900">
                                  {phiVisibility.insuranceInfo ? patient.insuranceInfo.groupNumber : maskPHI(patient.insuranceInfo.groupNumber, false)}
                                </p>
                              </div>
                            )}

                            <div>
                              <label className="text-sm font-medium text-default-700">Effective Date</label>
                              <p className="text-default-900">
                                {formatDate(patient.insuranceInfo.effectiveDate)}
                              </p>
                            </div>

                            {patient.insuranceInfo.expirationDate && (
                              <div>
                                <label className="text-sm font-medium text-default-700">Expiration Date</label>
                                <p className="text-default-900">
                                  {formatDate(patient.insuranceInfo.expirationDate)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <Card>
                        <CardBody className="text-center py-8">
                          <Shield className="h-12 w-12 text-default-300 mx-auto mb-4" />
                          <p className="text-default-600">No insurance information available</p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>

            <ModalFooter className="border-t border-divider">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2 text-sm text-default-600">
                  <Activity className="h-4 w-4" />
                  <span>Last viewed: {formatDate(new Date().toISOString())}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="light" onPress={onClose}>
                    Close
                  </Button>

                  {onViewMedicalHistory && (
                    <HealthcareButton
                      variant="secondary"
                      onClick={() => onViewMedicalHistory(patient)}
                      auditAction="view_medical_history"
                      complianceLevel="HIPAA"
                    >
                      View Medical History
                    </HealthcareButton>
                  )}
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

// Export with display name for debugging
PatientProfile.displayName = 'PatientProfile'