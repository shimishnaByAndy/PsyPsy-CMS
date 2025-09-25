import React, { useState } from 'react'
import { SwipeableCard, SwipeActions } from '@/components/ui/SwipeableCard'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Professional } from '@/types/professional'
import { formatDate, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Zap,
  TrendingUp,
  ShieldCheck
} from 'lucide-react'

interface ModernProfessionalCardProps {
  professional: Professional
  variant?: 'default' | 'compact' | 'featured' | 'minimal'
  showActions?: boolean
  showAvailability?: boolean
  showStats?: boolean
  enableSwipe?: boolean
  onViewProfile?: (professional: Professional) => void
  onScheduleWith?: (professional: Professional) => void
  onSendMessage?: (professional: Professional) => void
  onAddToFavorites?: (professional: Professional) => void
  onShare?: (professional: Professional) => void
  className?: string
}

// Status indicators with modern 2025 design
const StatusIndicator = ({ status, size = 'sm' }: { status: 'available' | 'busy' | 'offline' | 'in_session', size?: 'sm' | 'md' }) => {
  const statusConfig = {
    available: { color: 'bg-green-500', icon: Wifi, label: 'Available' },
    busy: { color: 'bg-yellow-500', icon: Clock, label: 'Busy' },
    offline: { color: 'bg-gray-400', icon: WifiOff, label: 'Offline' },
    in_session: { color: 'bg-blue-500', icon: Zap, label: 'In Session' }
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const sizeClass = size === 'md' ? 'w-4 h-4' : 'w-3 h-3'

  return (
    <div className="flex items-center space-x-1.5" role="status" aria-label={`Professional status: ${config.label}`}>
      <div
        className={cn('rounded-full', config.color, size === 'md' ? 'w-3 h-3' : 'w-2 h-2')}
        aria-hidden="true"
      />
      <Icon className={cn(sizeClass, 'text-muted-foreground')} aria-hidden="true" />
      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
    </div>
  )
}

// Modern credential badge
const CredentialBadge = ({ type, verified = true }: { type: string, verified?: boolean }) => (
  <Badge
    variant={verified ? 'default' : 'secondary'}
    className="text-xs font-medium"
    role="img"
    aria-label={`${verified ? 'Verified' : 'Unverified'} credential: ${type}`}
  >
    {verified && <ShieldCheck className="w-3 h-3 mr-1" aria-hidden="true" />}
    {type}
    <span className="sr-only">{verified ? ' (Verified)' : ' (Not verified)'}</span>
  </Badge>
)

// Availability preview component
const AvailabilityPreview = ({ nextSlot, slotsToday }: { nextSlot?: string, slotsToday: number }) => (
  <div
    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/20"
    role="region"
    aria-label="Professional availability information"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-green-600" aria-hidden="true" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          {nextSlot ? `Next: ${nextSlot}` : 'Available today'}
        </span>
      </div>
      <Badge
        variant="outline"
        className="text-green-700 border-green-200"
        aria-label={`${slotsToday} available time slots today`}
      >
        {slotsToday} slots
      </Badge>
    </div>
  </div>
)

export function ModernProfessionalCard({
  professional,
  variant = 'default',
  showActions = true,
  showAvailability = true,
  showStats = true,
  enableSwipe = true,
  onViewProfile,
  onScheduleWith,
  onSendMessage,
  onAddToFavorites,
  onShare,
  className
}: ModernProfessionalCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  // Mock data - in real app, this would come from professional object
  const mockStatus: 'available' | 'busy' | 'offline' | 'in_session' = 'available'
  const mockAvailability = {
    nextSlot: '2:30 PM',
    slotsToday: 3,
    isAvailable: true
  }

  const totalExperience = Math.max(...(professional.expertises?.map(e => e.experience) || [0]))
  const primarySpecialization = professional.expertises?.[0]
  const isVerified = professional.verification?.isVerified || false

  // Swipe actions with modern patterns
  const swipeActions = {
    left: [
      {
        id: 'favorite',
        icon: <Heart className={cn('w-5 h-5', isFavorited && 'fill-current')} />,
        label: isFavorited ? 'Remove from favorites' : 'Add to favorites',
        color: 'danger' as const,
        action: () => {
          setIsFavorited(!isFavorited)
          onAddToFavorites?.(professional)
        }
      }
    ],
    right: [
      {
        id: 'message',
        icon: <MessageCircle className="w-5 h-5" />,
        label: 'Send message',
        color: 'primary' as const,
        action: () => onSendMessage?.(professional)
      }
    ]
  }

  const professionalName = `Dr. ${professional.profile?.firstName} ${professional.profile?.lastName}`
  const cardContent = (
    <div
      className="space-y-4"
      role="article"
      aria-label={`Professional profile for ${professionalName}`}
    >
      {/* Header with photo and status */}
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className={cn(
              'ring-2 ring-offset-2',
              variant === 'featured' ? 'w-16 h-16 ring-4' : 'w-12 h-12',
              mockStatus === 'available' ? 'ring-green-200' :
              mockStatus === 'busy' ? 'ring-yellow-200' :
              'ring-gray-200'
            )}>
              <AvatarImage
                src={professional.profile?.profilePicture}
                alt={`Profile photo of ${professionalName}`}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(`${professional.profile?.firstName} ${professional.profile?.lastName}`)}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator dot */}
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                mockStatus === 'available' ? 'bg-green-500' :
                mockStatus === 'busy' ? 'bg-yellow-500' :
                mockStatus === 'in_session' ? 'bg-blue-500' : 'bg-gray-400'
              )}
              role="status"
              aria-label={`Status: ${mockStatus.replace('_', ' ')}`}
            />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dr. {professional.profile?.firstName} {professional.profile?.lastName}
                </h3>
                {isVerified && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{professional.businessName}</p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap">
              <StatusIndicator status={mockStatus} />
              {totalExperience > 0 && (
                <Badge variant="outline" className="text-xs">
                  {totalExperience}+ years
                </Badge>
              )}
            </div>
          </div>

          {variant !== 'minimal' && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact info with modern layout */}
        {variant !== 'minimal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{professional.bussEmail}</span>
            </div>
            {professional.phoneNb?.formatted && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{professional.phoneNb.formatted}</span>
              </div>
            )}
          </div>
        )}

        {/* Specializations with modern chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specializations</span>
            {professional.expertises && professional.expertises.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{professional.expertises.length - 3} more
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {professional.expertises?.slice(0, 3).map((expertise, index) => (
              <CredentialBadge
                key={index}
                type={expertise.certification || `Category ${expertise.category}`}
                verified={isVerified}
              />
            ))}
          </div>
        </div>

        {/* Stats grid - modern layout */}
        {showStats && variant !== 'minimal' && (
          <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{professional.rating?.averageRating || '4.8'}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{professional.activeClients || '45'}</span>
              </div>
              <p className="text-xs text-muted-foreground">Clients</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{professional.completedAppointments || '1.2k'}</span>
              </div>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>
        )}

        {/* Availability preview with modern design */}
        {showAvailability && mockAvailability.isAvailable && variant !== 'minimal' && (
          <AvailabilityPreview
            nextSlot={mockAvailability.nextSlot}
            slotsToday={mockAvailability.slotsToday}
          />
        )}

        {/* Modern action buttons */}
        {showActions && (
          <div
            className="flex gap-2 pt-2"
            role="group"
            aria-label={`Actions for ${professionalName}`}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile?.(professional)}
              className="flex-1"
              aria-label={`View profile for ${professionalName}`}
            >
              View Profile
            </Button>
            {mockAvailability.isAvailable && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onScheduleWith?.(professional)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                aria-label={`Schedule appointment with ${professionalName}`}
              >
                <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                Schedule
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSendMessage?.(professional)}
              aria-label={`Send message to ${professionalName}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(professional)}
              aria-label={`Share profile of ${professionalName}`}
            >
              <Share2 className="w-4 h-4" />
              <span className="sr-only">Share profile</span>
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  )

  if (enableSwipe) {
    return (
      <SwipeableCard
        leftActions={swipeActions.left}
        rightActions={swipeActions.right}
        className={cn(
          'transition-all duration-200 hover:shadow-lg',
          variant === 'featured' && 'ring-2 ring-blue-200 dark:ring-blue-800',
          className
        )}
      >
        {cardContent}
      </SwipeableCard>
    )
  }

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-lg',
      variant === 'featured' && 'ring-2 ring-blue-200 dark:ring-blue-800',
      className
    )}>
      {cardContent}
    </Card>
  )
}

// Export with display name for debugging
ModernProfessionalCard.displayName = 'ModernProfessionalCard'