import React from 'react'
import { HealthcareCard, HealthcareButton, HealthcareCardPresets, Chip, Badge } from '@/components/ui/nextui'
import { Client, AppointmentStatus } from '@/types'
import { formatDate, calculateAge, getInitials } from '@/lib/utils'
import { Calendar, Phone, Mail, MapPin, Clock, AlertCircle } from 'lucide-react'

interface PatientCardProps {
  patient: Client
  showActions?: boolean
  onViewDetails?: (patient: Client) => void
  onScheduleAppointment?: (patient: Client) => void
  onSendMessage?: (patient: Client) => void
  className?: string
}

export function PatientCard({
  patient,
  showActions = true,
  onViewDetails,
  onScheduleAppointment,
  onSendMessage,
  className
}: PatientCardProps) {
  const age = patient.user.profile?.dateOfBirth 
    ? calculateAge(patient.user.profile.dateOfBirth)
    : null

  const nextAppointment = patient.appointments?.find(
    apt => apt.status === 'scheduled' && new Date(apt.scheduledDate) > new Date()
  )

  const hasUrgentAlerts = patient.medicalInfo?.allergies && patient.medicalInfo.allergies.length > 0

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <HealthcareCard
      {...HealthcareCardPresets.patientActive}
      title={patient.user.profile?.fullName || 'Unknown Patient'}
      subtitle={`ID: ${patient.clientId}`}
      avatar={{
        src: patient.user.profile?.avatar,
        name: patient.user.profile?.fullName || 'Unknown Patient',
        color: 'primary'
      }}
      status={{
        type: getStatusChipColor(patient.status) as any,
        label: patient.status,
        icon: hasUrgentAlerts ? <AlertCircle className="h-3 w-3" /> : undefined
      }}
      priority={hasUrgentAlerts ? 'high' : 'medium'}
      auditInfo={{
        lastAccessed: formatDate(patient.updatedAt || patient.createdAt),
        accessedBy: 'Current User'
      }}
      className={className}
      onCardClick={(auditData) => {
        console.log('Patient card accessed:', auditData)
        onViewDetails?.(patient)
      }}
      actions={
        showActions && (
          <div className="flex gap-2 w-full">
            <HealthcareButton
              size="compact"
              variant="secondary"
              onClick={() => onViewDetails?.(patient)}
              auditAction="view_patient_details"
              complianceLevel="HIPAA"
              className="flex-1"
            >
              View Details
            </HealthcareButton>

            <HealthcareButton
              size="compact"
              variant="primary"
              onClick={() => onScheduleAppointment?.(patient)}
              auditAction="schedule_appointment"
              complianceLevel="HIPAA"
              className="flex-1"
            >
              Schedule
            </HealthcareButton>

            {onSendMessage && (
              <HealthcareButton
                size="compact"
                variant="secondary"
                onClick={() => onSendMessage(patient)}
                auditAction="send_message"
                complianceLevel="HIPAA"
              >
                <Mail className="h-4 w-4" />
              </HealthcareButton>
            )}
          </div>
        )
      }
    >

      <div className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-default-500" />
            <span className="truncate">{patient.user.email}</span>
          </div>

          {patient.user.profile?.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-default-500" />
              <span>{patient.user.profile.phone}</span>
            </div>
          )}

          {age && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-default-500" />
              <span>Age: {age}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-default-500" />
            <span>Since: {formatDate(patient.createdAt)}</span>
          </div>
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="bg-primary-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900">
                  Next: {formatDate(nextAppointment.scheduledDate, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <Chip size="sm" color="primary" variant="flat">
                {nextAppointment.type.replace('_', ' ')}
              </Chip>
            </div>
          </div>
        )}

        {/* Medical Alerts */}
        {hasUrgentAlerts && (
          <div className="bg-danger-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-danger-600 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-danger-900">
                  Medical Alerts
                </span>
                <p className="text-sm text-danger-700 mt-1">
                  {patient.medicalInfo?.allergies?.slice(0, 2).join(', ') || 'Requires attention'}
                  {(patient.medicalInfo?.allergies?.length ?? 0) > 2 &&
                    ` +${(patient.medicalInfo?.allergies?.length ?? 0) - 2} more`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Care Team */}
        {patient.assignedProfessionals && patient.assignedProfessionals.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {patient.assignedProfessionals.slice(0, 3).map((professional) => (
              <Chip key={professional.id} size="sm" color="secondary" variant="flat">
                Dr. {professional.user.profile?.lastName || 'Unknown'}
              </Chip>
            ))}
            {patient.assignedProfessionals.length > 3 && (
              <Chip size="sm" color="default" variant="bordered">
                +{patient.assignedProfessionals.length - 3} more
              </Chip>
            )}
          </div>
        )}
      </div>
    </HealthcareCard>
  )
}

// Export with display name for debugging
PatientCard.displayName = 'PatientCard'