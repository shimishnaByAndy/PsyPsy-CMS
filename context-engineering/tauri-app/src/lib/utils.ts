import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * This ensures Tailwind classes are properly merged without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for healthcare display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  
  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format time for healthcare display
 */
export function formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  }
  
  return dateObj.toLocaleTimeString('en-US', defaultOptions)
}

/**
 * Format currency for billing display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce utility for search and input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Generate a random ID for temporary use
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Healthcare-specific utilities
 */

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format appointment duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get appointment status color
 */
export function getAppointmentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400'
    case 'in-progress':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
    case 'completed':
      return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
    case 'cancelled':
      return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400'
    case 'no-show':
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400'
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400'
  }
}

/**
 * Get priority level color
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
    case 'low':
      return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400'
  }
}