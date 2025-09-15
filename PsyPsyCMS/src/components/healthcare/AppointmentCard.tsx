import React from 'react'
import { HealthcareCard, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Appointment, AppointmentStatus } from '@/types'
import { formatDate, formatTime, formatDuration, getAppointmentStatusColor, getInitials } from '@/lib/utils'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react'

interface AppointmentCardProps {
  appointment: Appointment
  showActions?: boolean
  viewMode?: 'client' | 'professional' | 'admin'
  onViewDetails?: (appointment: Appointment) => void
  onStartSession?: (appointment: Appointment) => void
  onReschedule?: (appointment: Appointment) => void
  onCancel?: (appointment: Appointment) => void
  className?: string
}

export function AppointmentCard({
  appointment,
  showActions = true,
  viewMode = 'admin',
  onViewDetails,
  onStartSession,
  onReschedule,
  onCancel,
  className
}: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.scheduledDate)
  const now = new Date()
  const isToday = appointmentDate.toDateString() === now.toDateString()
  const isPast = appointmentDate < now
  const isUpcoming = appointmentDate > now && appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000
  const canStart = isToday && Math.abs(appointmentDate.getTime() - now.getTime()) < 15 * 60 * 1000 // Within 15 minutes

  const getLocationIcon = () => {
    switch (appointment.location.type) {
      case 'video_call':
        return <Video className="h-4 w-4" />
      case 'phone_call':
        return <Phone className="h-4 w-4" />
      case 'in_person':
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getStatusIcon = () => {
    switch (appointment.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
      case 'no_show':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
      default:
        return <Calendar className="h-4 w-4 text-blue-600" />
    }
  }

  const getUrgencyLevel = () => {
    if (appointment.type === 'emergency') return 'high'
    if (isUpcoming) return 'medium'
    return 'low'
  }

  // Determine which person to show based on view mode
  const displayPerson = viewMode === 'client' ? appointment.professional : appointment.client
  const personTitle = viewMode === 'client' ? 'with Dr.' : 'Patient:'

  return (
    <HealthcareCard 
      variant="appointment" 
      priority={getUrgencyLevel()}
      className={className}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={displayPerson.user.profile?.avatar} 
                alt={displayPerson.user.profile?.fullName}
              />
              <AvatarFallback>
                {getInitials(displayPerson.user.profile?.fullName || displayPerson.user.email)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="healthcare-subheader text-base">
                  {personTitle} {displayPerson.user.profile?.fullName || 'Unknown'}
                </h3>
                {appointment.type === 'emergency' && (
                  <AlertCircle className="h-4 w-4 text-red-500" aria-label="Emergency appointment" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge className={getAppointmentStatusColor(appointment.status)}>
                  {getStatusIcon()}
                  <span className="ml-1">{appointment.status.replace('_', ' ')}</span>
                </Badge>
                
                <Badge variant="outline" className="text-xs">
                  {appointment.type.replace('_', ' ')}
                </Badge>

                {isToday && (
                  <Badge variant="info" className="text-xs animate-pulse-gentle">
                    Today
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="healthcare-text text-xs">
              ID: {appointment.appointmentId}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="healthcare-text">
              <p className="font-medium">
                {formatDate(appointmentDate, { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTime(appointmentDate)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="healthcare-text">
              <p className="font-medium">
                {formatDuration(appointment.duration)}
              </p>
              <p className="text-xs text-muted-foreground">
                Duration
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2">
          {getLocationIcon()}
          <div className="healthcare-text flex-1">
            <p className="font-medium capitalize">
              {appointment.location.type.replace('_', ' ')}
            </p>
            {appointment.location.address && (
              <p className="text-xs text-muted-foreground">
                {appointment.location.address.street}, {appointment.location.address.city}
              </p>
            )}
            {appointment.location.instructions && (
              <p className="text-xs text-muted-foreground mt-1">
                {appointment.location.instructions}
              </p>
            )}
          </div>
        </div>

        {/* Notes Preview */}
        {appointment.notes && appointment.notes.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="healthcare-label">
                Notes ({appointment.notes.length})
              </span>
            </div>
            <p className="healthcare-text text-sm">
              {appointment.notes[0].content.substring(0, 100)}
              {appointment.notes[0].content.length > 100 && '...'}
            </p>
          </div>
        )}

        {/* Session Summary (if completed) */}
        {appointment.status === 'completed' && appointment.sessionSummary && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="healthcare-label text-green-900 dark:text-green-100">
                Session Completed
              </span>
            </div>
            {appointment.sessionSummary.keyTopics.length > 0 && (
              <div className="healthcare-text text-green-800 dark:text-green-200">
                <p className="text-xs font-medium mb-1">Key Topics:</p>
                <p className="text-xs">
                  {appointment.sessionSummary.keyTopics.slice(0, 3).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Billing Information */}
        {appointment.billing && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="healthcare-text">
              <span className="text-xs text-muted-foreground">Amount:</span>
              <span className="ml-1 font-medium">
                ${appointment.billing.amount.toFixed(2)}
              </span>
            </div>
            <Badge 
              variant={appointment.billing.status === 'paid' ? 'success' : 'warning'}
              className="text-xs"
            >
              {appointment.billing.status}
            </Badge>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(appointment)}
              className="flex-1 min-w-fit"
            >
              View Details
            </Button>
            
            {canStart && appointment.status === 'scheduled' && (
              <Button
                variant="psypsy"
                size="sm"
                onClick={() => onStartSession?.(appointment)}
                className="flex-1 min-w-fit"
              >
                Start Session
              </Button>
            )}
            
            {appointment.status === 'scheduled' && !isPast && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReschedule?.(appointment)}
                >
                  Reschedule
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel?.(appointment)}
                  className="text-destructive hover:text-destructive"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </HealthcareCard>
  )
}

// Export with display name for debugging
AppointmentCard.displayName = 'AppointmentCard'