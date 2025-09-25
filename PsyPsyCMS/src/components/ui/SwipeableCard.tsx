import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Heart,
  MessageCircle,
  Calendar,
  Share2,
  Star,
  Phone,
  X,
  Check
} from 'lucide-react'

export interface SwipeAction {
  id: string
  icon: React.ReactNode
  label: string
  color: 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
  action: () => void
}

interface SwipeableCardProps {
  children: React.ReactNode
  className?: string
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  swipeThreshold?: number
  disabled?: boolean
  enableHaptic?: boolean
}

const actionColors = {
  primary: 'bg-blue-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
  secondary: 'bg-purple-500 text-white'
}

export function SwipeableCard({
  children,
  className,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 80,
  disabled = false,
  enableHaptic = true
}: SwipeableCardProps) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isActionTriggered, setIsActionTriggered] = useState(false)
  const [focusedActionIndex, setFocusedActionIndex] = useState<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const lastX = useRef(0)

  const hapticFeedback = () => {
    if (enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return

    setIsDragging(true)
    startX.current = e.touches[0].clientX
    lastX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return

    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    const maxSwipe = 150

    // Limit swipe distance
    const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    setDragOffset(clampedDiff)

    // Trigger haptic feedback at threshold
    if (!isActionTriggered && Math.abs(clampedDiff) > swipeThreshold) {
      setIsActionTriggered(true)
      hapticFeedback()
    } else if (isActionTriggered && Math.abs(clampedDiff) < swipeThreshold) {
      setIsActionTriggered(false)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return

    const absOffset = Math.abs(dragOffset)

    if (absOffset > swipeThreshold) {
      if (dragOffset > 0) {
        // Swiped right
        if (rightActions.length > 0) {
          rightActions[0].action()
        } else {
          onSwipeRight?.()
        }
      } else {
        // Swiped left
        if (leftActions.length > 0) {
          leftActions[0].action()
        } else {
          onSwipeLeft?.()
        }
      }
    }

    // Reset state
    setDragOffset(0)
    setIsDragging(false)
    setIsActionTriggered(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    // Arrow key navigation for swipe actions
    if (e.key === 'ArrowLeft' && leftActions.length > 0) {
      e.preventDefault()
      leftActions[0].action()
      hapticFeedback()
    } else if (e.key === 'ArrowRight' && rightActions.length > 0) {
      e.preventDefault()
      rightActions[0].action()
      hapticFeedback()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // Trigger default action or first available action
      if (rightActions.length > 0) {
        rightActions[0].action()
      } else if (leftActions.length > 0) {
        leftActions[0].action()
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return

    setIsDragging(true)
    startX.current = e.clientX
    lastX.current = e.clientX

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const currentX = e.clientX
      const diff = currentX - startX.current
      const maxSwipe = 150

      const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
      setDragOffset(clampedDiff)

      if (!isActionTriggered && Math.abs(clampedDiff) > swipeThreshold) {
        setIsActionTriggered(true)
        hapticFeedback()
      } else if (isActionTriggered && Math.abs(clampedDiff) < swipeThreshold) {
        setIsActionTriggered(false)
      }
    }

    const handleMouseUp = () => {
      const absOffset = Math.abs(dragOffset)

      if (absOffset > swipeThreshold) {
        if (dragOffset > 0) {
          if (rightActions.length > 0) {
            rightActions[0].action()
          } else {
            onSwipeRight?.()
          }
        } else {
          if (leftActions.length > 0) {
            leftActions[0].action()
          } else {
            onSwipeLeft?.()
          }
        }
      }

      setDragOffset(0)
      setIsDragging(false)
      setIsActionTriggered(false)

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null

    const isVisible = side === 'left' ? dragOffset < -swipeThreshold : dragOffset > swipeThreshold
    const opacity = isVisible ? 1 : 0

    return (
      <div
        className={cn(
          'absolute top-0 bottom-0 flex items-center justify-center transition-opacity duration-200',
          side === 'left' ? 'left-0' : 'right-0',
          'w-16'
        )}
        style={{ opacity }}
      >
        {actions.slice(0, 1).map((action, index) => (
          <button
            key={action.id}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
              actionColors[action.color],
              isVisible ? 'scale-100' : 'scale-0'
            )}
            onClick={(e) => {
              e.stopPropagation()
              action.action()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                action.action()
              }
            }}
            aria-label={action.label}
            tabIndex={isVisible ? 0 : -1}
            role="button"
          >
            {action.icon}
            <span className="sr-only">{action.label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      {renderActions(leftActions, 'left')}
      {renderActions(rightActions, 'right')}

      {/* Main card */}
      <Card
        ref={cardRef}
        className={cn(
          'transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isDragging && 'transition-none',
          disabled && 'cursor-default opacity-60',
          className
        )}
        style={{
          transform: `translateX(${dragOffset}px)`,
        }}
        role="article"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Swipeable card with ${leftActions.length + rightActions.length} available actions. Use arrow keys to navigate, Enter to activate.`}
        aria-disabled={disabled}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Card>
    </div>
  )
}

// Predefined action sets for common use cases
export const SwipeActions = {
  professional: {
    left: [
      {
        id: 'favorite',
        icon: <Heart className="w-5 h-5" />,
        label: 'Add to favorites',
        color: 'danger' as const,
        action: () => console.log('Added to favorites')
      }
    ],
    right: [
      {
        id: 'message',
        icon: <MessageCircle className="w-5 h-5" />,
        label: 'Send message',
        color: 'primary' as const,
        action: () => console.log('Send message')
      }
    ]
  },
  patient: {
    left: [
      {
        id: 'urgent',
        icon: <Star className="w-5 h-5" />,
        label: 'Mark as urgent',
        color: 'warning' as const,
        action: () => console.log('Marked as urgent')
      }
    ],
    right: [
      {
        id: 'schedule',
        icon: <Calendar className="w-5 h-5" />,
        label: 'Schedule appointment',
        color: 'success' as const,
        action: () => console.log('Schedule appointment')
      }
    ]
  },
  appointment: {
    left: [
      {
        id: 'cancel',
        icon: <X className="w-5 h-5" />,
        label: 'Cancel appointment',
        color: 'danger' as const,
        action: () => console.log('Cancel appointment')
      }
    ],
    right: [
      {
        id: 'confirm',
        icon: <Check className="w-5 h-5" />,
        label: 'Confirm appointment',
        color: 'success' as const,
        action: () => console.log('Confirm appointment')
      }
    ]
  }
}