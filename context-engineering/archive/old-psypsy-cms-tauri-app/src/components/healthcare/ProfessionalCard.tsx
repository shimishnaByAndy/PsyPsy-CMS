import React from 'react'
import { HealthcareCard, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Professional, LicenseType } from '@/types'
import { formatDate, getInitials } from '@/lib/utils'
import { 
  Award, 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  Star,
  Briefcase
} from 'lucide-react'

interface ProfessionalCardProps {
  professional: Professional
  showActions?: boolean
  showAvailability?: boolean
  onViewProfile?: (professional: Professional) => void
  onScheduleWith?: (professional: Professional) => void
  onSendMessage?: (professional: Professional) => void
  className?: string
}

export function ProfessionalCard({
  professional,
  showActions = true,
  showAvailability = true,
  onViewProfile,
  onScheduleWith,
  onSendMessage,
  className
}: ProfessionalCardProps) {
  const isLicenseActive = professional.license.status === 'active'
  const licenseExpiringSoon = new Date(professional.license.expirationDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 // 90 days
  
  const totalExperience = professional.specializations.reduce(
    (max, spec) => Math.max(max, spec.yearsOfExperience), 0
  )
  
  const primarySpecialization = professional.specializations[0]
  const clientCount = professional.clients?.length || 0

  const getLicenseStatusColor = () => {
    switch (professional.license.status) {
      case 'active':
        return licenseExpiringSoon 
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'expired':
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getLicenseIcon = () => {
    if (professional.license.status === 'active' && !licenseExpiringSoon) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (licenseExpiringSoon) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
    return <Award className="h-4 w-4" />
  }

  const formatLicenseType = (type: LicenseType): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Mock availability for today (this would come from real data)
  const todayAvailability = {
    available: Math.random() > 0.3,
    nextSlot: '2:00 PM',
    slotsRemaining: Math.floor(Math.random() * 5) + 1
  }

  return (
    <HealthcareCard 
      variant="professional" 
      priority={!isLicenseActive ? 'high' : licenseExpiringSoon ? 'medium' : 'low'}
      className={className}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={professional.user.profile?.avatar} 
                alt={professional.user.profile?.fullName}
              />
              <AvatarFallback>
                {getInitials(professional.user.profile?.fullName || professional.user.email)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="healthcare-header text-lg">
                  Dr. {professional.user.profile?.fullName || 'Unknown Professional'}
                </h3>
                {!isLicenseActive && (
                  <AlertTriangle className="h-4 w-4 text-red-500" aria-label="License issue" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge className={getLicenseStatusColor()}>
                  {getLicenseIcon()}
                  <span className="ml-1">{formatLicenseType(professional.license.type)}</span>
                </Badge>
                
                {totalExperience > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalExperience} years exp.
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="healthcare-text text-xs">
              ID: {professional.professionalId}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 healthcare-text">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{professional.user.email}</span>
          </div>
          
          {professional.user.profile?.phone && (
            <div className="flex items-center space-x-2 healthcare-text">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{professional.user.profile.phone}</span>
            </div>
          )}
        </div>

        {/* Specializations */}
        <div>
          <span className="healthcare-label">
            Specializations ({professional.specializations.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {professional.specializations.slice(0, 4).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec.name.replace(/_/g, ' ')}
              </Badge>
            ))}
            {professional.specializations.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{professional.specializations.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Client Load and Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="healthcare-text">
              <p className="font-medium">{clientCount} clients</p>
              <p className="text-xs text-muted-foreground">Active caseload</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="healthcare-text">
              <p className="font-medium">{professional.settings.appointmentDuration}min</p>
              <p className="text-xs text-muted-foreground">Session length</p>
            </div>
          </div>
        </div>

        {/* Availability Today */}
        {showAvailability && (
          <div className={`p-3 rounded-md ${todayAvailability.available 
            ? 'bg-green-50 dark:bg-green-950/20' 
            : 'bg-gray-50 dark:bg-gray-900'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="healthcare-label">
                Today's Availability
              </span>
            </div>
            
            {todayAvailability.available ? (
              <div className="healthcare-text text-green-800 dark:text-green-200">
                <p className="text-sm">
                  Next available: {todayAvailability.nextSlot}
                </p>
                <p className="text-xs text-muted-foreground">
                  {todayAvailability.slotsRemaining} slots remaining
                </p>
              </div>
            ) : (
              <div className="healthcare-text">
                <p className="text-sm">No availability today</p>
                <p className="text-xs text-muted-foreground">
                  Next available slot tomorrow
                </p>
              </div>
            )}
          </div>
        )}

        {/* License Information */}
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="healthcare-label">License</span>
            </div>
            <Badge className={getLicenseStatusColor()}>
              {professional.license.status}
            </Badge>
          </div>
          
          <div className="healthcare-text space-y-1">
            <p className="text-sm">
              #{professional.license.number}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires: {formatDate(professional.license.expirationDate)}
            </p>
            {licenseExpiringSoon && isLicenseActive && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Expires in less than 90 days
              </p>
            )}
          </div>
        </div>

        {/* Qualifications */}
        {professional.qualifications.length > 0 && (
          <div>
            <span className="healthcare-label">Education</span>
            <div className="mt-1 space-y-1">
              {professional.qualifications.slice(0, 2).map((qual, index) => (
                <div key={index} className="flex items-center space-x-2 healthcare-text text-sm">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  <span>{qual.degree} - {qual.institution} ({qual.graduationYear})</span>
                </div>
              ))}
              {professional.qualifications.length > 2 && (
                <p className="healthcare-text text-xs">
                  +{professional.qualifications.length - 2} more qualifications
                </p>
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
              onClick={() => onViewProfile?.(professional)}
              className="flex-1 min-w-fit"
            >
              View Profile
            </Button>
            
            {isLicenseActive && todayAvailability.available && (
              <Button
                variant="psypsy"
                size="sm"
                onClick={() => onScheduleWith?.(professional)}
                className="flex-1 min-w-fit"
              >
                Schedule
              </Button>
            )}
            
            {onSendMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSendMessage(professional)}
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
ProfessionalCard.displayName = 'ProfessionalCard'