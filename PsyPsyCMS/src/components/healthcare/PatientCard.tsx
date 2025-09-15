import React from 'react'
import { HealthcareCard, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <HealthcareCard 
      variant="patient" 
      priority={hasUrgentAlerts ? 'high' : 'medium'}
      className={className}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={patient.user.profile?.avatar} 
                alt={patient.user.profile?.fullName}
              />
              <AvatarFallback>
                {getInitials(patient.user.profile?.fullName || patient.user.email)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="healthcare-header text-lg">
                  {patient.user.profile?.fullName || 'Unknown Patient'}
                </h3>
                {hasUrgentAlerts && (
                  <AlertCircle className="h-4 w-4 text-red-500" aria-label="Medical alerts" />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
                <span className="healthcare-text">
                  ID: {patient.clientId}
                </span>
                {age && (
                  <span className="healthcare-text">
                    Age: {age}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="healthcare-text text-xs">
              Patient since {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 healthcare-text">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{patient.user.email}</span>
          </div>
          
          {patient.user.profile?.phone && (
            <div className="flex items-center space-x-2 healthcare-text">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.user.profile.phone}</span>
            </div>
          )}
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="healthcare-label text-blue-900 dark:text-blue-100">
                Next Appointment
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 healthcare-text">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDate(nextAppointment.scheduledDate, { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {' at '}
                  {formatDate(nextAppointment.scheduledDate, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {nextAppointment.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}

        {/* Medical Alerts */}
        {hasUrgentAlerts && (
          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="healthcare-label text-red-900 dark:text-red-100">
                Medical Alerts
              </span>
            </div>
            <div className="healthcare-text text-red-800 dark:text-red-200">
              {patient.medicalInfo.allergies.slice(0, 3).join(', ')}
              {patient.medicalInfo.allergies.length > 3 && ` +${patient.medicalInfo.allergies.length - 3} more`}
            </div>
          </div>
        )}

        {/* Assigned Professionals */}
        {patient.assignedProfessionals && patient.assignedProfessionals.length > 0 && (
          <div>
            <span className="healthcare-label">
              Care Team ({patient.assignedProfessionals.length})
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {patient.assignedProfessionals.slice(0, 3).map((professional) => (
                <Badge key={professional.id} variant="secondary" className="text-xs">
                  Dr. {professional.user.profile?.lastName || 'Unknown'}
                </Badge>
              ))}
              {patient.assignedProfessionals.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{patient.assignedProfessionals.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(patient)}
              className="flex-1 min-w-fit"
            >
              View Details
            </Button>
            
            <Button
              variant="psypsy"
              size="sm"
              onClick={() => onScheduleAppointment?.(patient)}
              className="flex-1 min-w-fit"
            >
              Schedule
            </Button>
            
            {onSendMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSendMessage(patient)}
              >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </HealthcareCard>
  )
}

// Export with display name for debugging
PatientCard.displayName = 'PatientCard'