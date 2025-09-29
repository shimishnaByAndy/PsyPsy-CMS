/**
 * SafeDateDisplay - A component that safely displays dates with proper error handling
 * Prevents common date parsing errors in healthcare applications
 */

import React from 'react'
import { useSafeDate, UseSafeDateOptions } from '@/hooks/use-safe-date'
import { AlertTriangle } from 'lucide-react'

interface SafeDateDisplayProps extends UseSafeDateOptions {
  /** The date input to display */
  date: string | number | Date | null | undefined
  /** Custom className for styling */
  className?: string
  /** Show warning icon for invalid dates */
  showWarning?: boolean
  /** Custom error message for invalid dates */
  errorMessage?: string
  /** Show relative time instead of formatted date */
  showRelative?: boolean
  /** Prefix text (e.g., "Created: ") */
  prefix?: string
  /** Additional props for the container */
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

export const SafeDateDisplay: React.FC<SafeDateDisplayProps> = ({
  date,
  className = '',
  showWarning = false,
  errorMessage,
  showRelative = false,
  prefix = '',
  containerProps,
  ...dateOptions
}) => {
  const { formatted, relative, isValid, original } = useSafeDate(date, {
    ...dateOptions,
    fallback: errorMessage || 'Date not available'
  })

  const displayText = showRelative ? relative : formatted
  const finalText = prefix ? `${prefix}${displayText}` : displayText

  if (!isValid && showWarning) {
    return (
      <div
        className={`flex items-center gap-2 text-amber-600 ${className}`}
        {...containerProps}
        title={`Invalid date input: ${original}`}
      >
        <AlertTriangle size={16} />
        <span>{finalText}</span>
      </div>
    )
  }

  return (
    <span
      className={className}
      {...containerProps}
      title={isValid ? `Original: ${original}` : `Invalid: ${original}`}
    >
      {finalText}
    </span>
  )
}

/**
 * AppointmentTimeDisplay - Specialized component for displaying appointment times
 * with healthcare-specific validation
 */
interface AppointmentTimeDisplayProps {
  startTime: string | Date | null | undefined
  endTime: string | Date | null | undefined
  className?: string
  showDuration?: boolean
  showValidation?: boolean
}

export const AppointmentTimeDisplay: React.FC<AppointmentTimeDisplayProps> = ({
  startTime,
  endTime,
  className = '',
  showDuration = true,
  showValidation = false
}) => {
  const start = useSafeDate(startTime, { format: 'time', timezone: 'America/Montreal' })
  const end = useSafeDate(endTime, { format: 'time', timezone: 'America/Montreal' })

  const duration = React.useMemo(() => {
    if (!start.date || !end.date) return null
    const durationMs = end.date.getTime() - start.date.getTime()
    return Math.floor(durationMs / (1000 * 60))
  }, [start.date, end.date])

  const isValidSession = duration === 50
  const hasValidTimes = start.isValid && end.isValid

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <span className={hasValidTimes ? 'text-gray-900' : 'text-red-600'}>
          {start.formatted} - {end.formatted}
        </span>

        {showDuration && duration !== null && (
          <span className={`text-sm ${isValidSession ? 'text-green-600' : 'text-amber-600'}`}>
            ({duration} min)
          </span>
        )}

        {showValidation && !hasValidTimes && (
          <AlertTriangle size={16} className="text-red-500"  />
        )}

        {showValidation && hasValidTimes && !isValidSession && (
          <AlertTriangle size={16} className="text-amber-500"  />
        )}
      </div>

      {showValidation && !isValidSession && hasValidTimes && (
        <p className="text-xs text-amber-600 mt-1">
          Healthcare sessions should be 50 minutes
        </p>
      )}
    </div>
  )
}

/**
 * RelativeTimeDisplay - Shows time relative to now with automatic updates
 */
interface RelativeTimeDisplayProps {
  date: string | number | Date | null | undefined
  className?: string
  updateInterval?: number
  showTooltip?: boolean
}

export const RelativeTimeDisplay: React.FC<RelativeTimeDisplayProps> = ({
  date,
  className = '',
  showTooltip = true
}) => {
  const { relative, formatted, isValid } = useSafeDate(date, { showRelative: true })

  if (!isValid) {
    return (
      <span className={`text-red-500 ${className}`}>
        Invalid time
      </span>
    )
  }

  return (
    <span
      className={`text-gray-500 ${className}`}
      title={showTooltip ? formatted : undefined}
    >
      {relative}
    </span>
  )
}

/**
 * QuebecComplianceDate - Date display formatted for Quebec Law 25 compliance
 */
interface QuebecComplianceDateProps {
  date: string | number | Date | null | undefined
  className?: string
  showTimezone?: boolean
}

export const QuebecComplianceDate: React.FC<QuebecComplianceDateProps> = ({
  date,
  className = '',
  showTimezone = false
}) => {
  const quebecDate = useSafeDate(date, {
    locale: 'fr-CA',
    timezone: 'America/Montreal',
    format: 'datetime'
  })

  if (!quebecDate.isValid) {
    return (
      <span className={`text-red-500 ${className}`}>
        Date non disponible
      </span>
    )
  }

  return (
    <span className={className}>
      {quebecDate.formatted}
      {showTimezone && (
        <span className="text-xs text-gray-500 ml-1">(HNE)</span>
      )}
    </span>
  )
}