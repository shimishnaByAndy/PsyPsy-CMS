/**
 * Date utility functions for PsyPsy CMS
 * Handles date parsing, formatting, and conversion between different formats
 */

/**
 * Safely parse a date string or timestamp
 */
export function parseDate(dateInput: string | number | Date | null | undefined): Date | null {
  if (!dateInput) return null

  try {
    if (dateInput instanceof Date) {
      return isValidDate(dateInput) ? dateInput : null
    }

    if (typeof dateInput === 'number') {
      // Handle Unix timestamps (both seconds and milliseconds)
      const timestamp = dateInput < 10000000000 ? dateInput * 1000 : dateInput
      const date = new Date(timestamp)
      return isValidDate(date) ? date : null
    }

    if (typeof dateInput === 'string') {
      // Handle various string formats
      if (dateInput.trim() === '') return null

      // Try parsing as ISO string first (from Firestore RFC3339)
      if (dateInput.includes('T') || dateInput.includes('Z')) {
        const date = new Date(dateInput)
        return isValidDate(date) ? date : null
      }

      // Try parsing other formats
      const date = new Date(dateInput)
      return isValidDate(date) ? date : null
    }

    return null
  } catch (error) {
    console.warn('Date parsing error:', error, 'Input:', dateInput)
    return null
  }
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Format date for display in healthcare context
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined,
  options: {
    format?: 'short' | 'medium' | 'long' | 'time' | 'datetime'
    locale?: string
    timezone?: string
  } = {}
): string {
  const date = parseDate(dateInput)
  if (!date) return 'Invalid Date'

  const { format = 'medium', locale = 'en-CA', timezone = 'America/Montreal' } = options

  try {
    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
    }

    switch (format) {
      case 'short':
        formatOptions.dateStyle = 'short'
        break
      case 'medium':
        formatOptions.dateStyle = 'medium'
        break
      case 'long':
        formatOptions.dateStyle = 'long'
        break
      case 'time':
        formatOptions.timeStyle = 'short'
        break
      case 'datetime':
        formatOptions.dateStyle = 'medium'
        formatOptions.timeStyle = 'short'
        break
    }

    return new Intl.DateTimeFormat(locale, formatOptions).format(date)
  } catch (error) {
    console.warn('Date formatting error:', error)
    return date.toLocaleDateString()
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  dateInput: string | number | Date | null | undefined,
  locale: string = 'en-CA'
): string {
  const date = parseDate(dateInput)
  if (!date) return 'Unknown time'

  try {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    // Use Intl.RelativeTimeFormat for proper localization
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (diffDays > 0) {
      return rtf.format(-diffDays, 'day')
    } else if (diffHours > 0) {
      return rtf.format(-diffHours, 'hour')
    } else if (diffMinutes > 0) {
      return rtf.format(-diffMinutes, 'minute')
    } else {
      return rtf.format(-diffSeconds, 'second')
    }
  } catch (error) {
    console.warn('Relative time formatting error:', error)
    return 'Some time ago'
  }
}

/**
 * Convert date to ISO string for API calls
 */
export function toISOString(dateInput: string | number | Date | null | undefined): string | null {
  const date = parseDate(dateInput)
  return date ? date.toISOString() : null
}

/**
 * Get current date in Quebec timezone
 */
export function nowInQuebec(): Date {
  return new Date()
}

/**
 * Format date for Quebec healthcare compliance (Law 25)
 */
export function formatForCompliance(
  dateInput: string | number | Date | null | undefined
): string {
  const date = parseDate(dateInput)
  if (!date) return 'Date not available'

  // Quebec format: YYYY-MM-DD HH:mm (24-hour time)
  return formatDate(date, {
    locale: 'fr-CA',
    timezone: 'America/Montreal',
    format: 'datetime'
  })
}

/**
 * Validate appointment time (50-minute session compliance)
 */
export function validateAppointmentTime(
  startTime: string | Date,
  endTime: string | Date
): { isValid: boolean; durationMinutes: number; errors: string[] } {
  const start = parseDate(startTime)
  const end = parseDate(endTime)
  const errors: string[] = []

  if (!start) errors.push('Invalid start time')
  if (!end) errors.push('Invalid end time')

  if (!start || !end) {
    return { isValid: false, durationMinutes: 0, errors }
  }

  const durationMs = end.getTime() - start.getTime()
  const durationMinutes = Math.floor(durationMs / (1000 * 60))

  if (durationMinutes !== 50) {
    errors.push(`Session must be 50 minutes, got ${durationMinutes} minutes`)
  }

  if (start >= end) {
    errors.push('Start time must be before end time')
  }

  return {
    isValid: errors.length === 0,
    durationMinutes,
    errors
  }
}

/**
 * Create a 50-minute appointment slot
 */
export function createAppointmentSlot(startTime: string | Date): {
  start: Date
  end: Date
  duration: number
} | null {
  const start = parseDate(startTime)
  if (!start) return null

  const end = new Date(start.getTime() + 50 * 60 * 1000) // 50 minutes

  return {
    start,
    end,
    duration: 50
  }
}

/**
 * Check if date is within Quebec business hours
 */
export function isQuebecBusinessHours(dateInput: string | Date): boolean {
  const date = parseDate(dateInput)
  if (!date) return false

  // Convert to Quebec time
  const quebecTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/Montreal' }))
  const hour = quebecTime.getHours()
  const day = quebecTime.getDay() // 0 = Sunday, 6 = Saturday

  // Business hours: Monday-Friday, 8 AM - 6 PM
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18
}