/**
 * Appointment Types for PsyPsy CMS
 * Quebec Law 25 & PIPEDA Compliant Appointment Management
 */

export interface Appointment {
  id: string
  clientId: string
  professionalId: string
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  type: AppointmentType
  title: string
  description?: string
  location?: string
  isVirtual: boolean
  virtualMeetingUrl?: string
  notes?: string

  // Quebec Law 25 compliance
  consentForRecording: boolean
  dataRetentionDate: Date
  auditTrail: AuditEntry[]

  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'

export type AppointmentType =
  | 'initial_consultation'
  | 'follow_up'
  | 'therapy_session'
  | 'assessment'
  | 'group_session'
  | 'emergency'
  | 'consultation'

export interface AuditEntry {
  id: string
  timestamp: Date
  action: string
  userId: string
  performedBy: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
}

// Export default interface
export default Appointment