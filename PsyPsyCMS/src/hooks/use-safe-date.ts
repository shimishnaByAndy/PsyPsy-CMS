/**
 * Custom hook for safe date handling in React components
 * Prevents common date parsing errors and provides formatted output
 */

import { useMemo } from 'react'
import {
  parseDate,
  formatDate,
  formatRelativeTime,
  isValidDate,
  toISOString
} from '@/utils/date-utils'

export interface UseSafeDateOptions {
  format?: 'short' | 'medium' | 'long' | 'time' | 'datetime'
  locale?: string
  timezone?: string
  fallback?: string
  showRelative?: boolean
}

export interface SafeDateResult {
  /** The parsed Date object (null if invalid) */
  date: Date | null
  /** Formatted date string */
  formatted: string
  /** Relative time string (e.g., "2 hours ago") */
  relative: string
  /** ISO string for API calls */
  iso: string | null
  /** Whether the date is valid */
  isValid: boolean
  /** Original input for debugging */
  original: unknown
}

/**
 * Safely handle date parsing and formatting
 */
export function useSafeDate(
  dateInput: string | number | Date | null | undefined,
  options: UseSafeDateOptions = {}
): SafeDateResult {
  const {
    format = 'medium',
    locale = 'en-CA',
    timezone = 'America/Montreal',
    fallback = 'Date not available',
    showRelative = false
  } = options

  const result = useMemo((): SafeDateResult => {
    const parsedDate = parseDate(dateInput)
    const valid = parsedDate !== null && isValidDate(parsedDate)

    return {
      date: parsedDate,
      formatted: valid
        ? formatDate(parsedDate, { format, locale, timezone })
        : fallback,
      relative: valid
        ? formatRelativeTime(parsedDate, locale)
        : fallback,
      iso: valid ? toISOString(parsedDate) : null,
      isValid: valid,
      original: dateInput
    }
  }, [dateInput, format, locale, timezone, fallback])

  return result
}

/**
 * Hook for appointment time validation
 */
export function useAppointmentTime(
  startTime: string | Date | null | undefined,
  endTime: string | Date | null | undefined
) {
  return useMemo(() => {
    const start = parseDate(startTime)
    const end = parseDate(endTime)

    if (!start || !end) {
      return {
        isValid: false,
        duration: 0,
        errors: ['Invalid start or end time'],
        formatted: {
          start: 'Invalid time',
          end: 'Invalid time',
          duration: 'Invalid duration'
        }
      }
    }

    const durationMs = end.getTime() - start.getTime()
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    const errors: string[] = []

    if (durationMinutes !== 50) {
      errors.push(`Session must be 50 minutes, got ${durationMinutes} minutes`)
    }

    if (start >= end) {
      errors.push('Start time must be before end time')
    }

    return {
      isValid: errors.length === 0,
      duration: durationMinutes,
      errors,
      formatted: {
        start: formatDate(start, { format: 'time', timezone: 'America/Montreal' }),
        end: formatDate(end, { format: 'time', timezone: 'America/Montreal' }),
        duration: `${durationMinutes} minutes`
      }
    }
  }, [startTime, endTime])
}

/**
 * Hook for relative time that updates periodically
 */
export function useLiveRelativeTime(
  dateInput: string | number | Date | null | undefined,
  updateInterval: number = 60000 // 1 minute
) {
  const { relative, isValid, original } = useSafeDate(dateInput, { showRelative: true })

  // Note: In a real implementation, you might use useEffect with setInterval
  // to update the relative time periodically. For now, we return the static value.

  return {
    relative,
    isValid,
    original
  }
}

/**
 * Hook for Quebec compliance date formatting
 */
export function useQuebecDate(
  dateInput: string | number | Date | null | undefined
) {
  return useMemo(() => {
    const date = parseDate(dateInput)

    if (!date) {
      return {
        date: null,
        formatted: 'Date non disponible',
        iso: null,
        isValid: false
      }
    }

    return {
      date,
      formatted: formatDate(date, {
        locale: 'fr-CA',
        timezone: 'America/Montreal',
        format: 'datetime'
      }),
      iso: toISOString(date),
      isValid: true
    }
  }, [dateInput])
}