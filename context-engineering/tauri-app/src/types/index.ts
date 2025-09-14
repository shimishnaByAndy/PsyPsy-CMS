/**
 * Core type definitions for PsyPsy CMS
 * Healthcare-focused types with strong typing
 */

// Base types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// User Management
export interface User extends BaseEntity {
  email: string
  username?: string
  role: UserRole
  isActive: boolean
  profile?: UserProfile
  lastLogin?: string
  preferences?: UserPreferences
}

export type UserRole = 'admin' | 'professional' | 'client' | 'support'

export interface UserProfile {
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  language: SupportedLanguage
  timezone?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: SupportedLanguage
  notifications: NotificationPreferences
  accessibility: AccessibilityPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  appointmentReminders: boolean
  systemUpdates: boolean
}

export interface AccessibilityPreferences {
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  reduceMotion: boolean
  screenReader: boolean
}

// Client Management
export interface Client extends BaseEntity {
  user: User
  clientId: string
  status: ClientStatus
  medicalInfo?: MedicalInfo
  emergencyContact?: EmergencyContact
  insuranceInfo?: InsuranceInfo
  appointments?: Appointment[]
  notes?: ClientNote[]
  documents?: Document[]
  assignedProfessionals?: Professional[]
}

export type ClientStatus = 'active' | 'inactive' | 'pending' | 'archived'

export interface MedicalInfo {
  allergies?: string[]
  medications?: Medication[]
  medicalConditions?: string[]
  emergencyMedicalInfo?: string
  bloodType?: string
  height?: number // cm
  weight?: number // kg
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  prescribedDate: string
  prescribedBy?: string
  notes?: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
  address?: Address
}

export interface InsuranceInfo {
  provider: string
  policyNumber: string
  groupNumber?: string
  effectiveDate: string
  expirationDate?: string
}

// Professional Management
export interface Professional extends BaseEntity {
  user: User
  professionalId: string
  license: ProfessionalLicense
  specializations: Specialization[]
  qualifications: Qualification[]
  availability: Availability[]
  clients?: Client[]
  appointments?: Appointment[]
  schedule?: Schedule
  settings: ProfessionalSettings
}

export interface ProfessionalLicense {
  type: LicenseType
  number: string
  issuingAuthority: string
  issueDate: string
  expirationDate: string
  status: 'active' | 'expired' | 'suspended' | 'pending'
}

export type LicenseType = 'psychologist' | 'therapist' | 'psychiatrist' | 'counselor' | 'social_worker'

export interface Specialization {
  name: string
  category: SpecializationCategory
  yearsOfExperience: number
  certifications?: string[]
}

export type SpecializationCategory = 
  | 'anxiety_disorders'
  | 'depression'
  | 'trauma_ptsd'
  | 'addiction'
  | 'family_therapy'
  | 'child_adolescent'
  | 'couples_therapy'
  | 'behavioral_therapy'
  | 'cognitive_therapy'
  | 'other'

export interface Qualification {
  degree: string
  institution: string
  graduationYear: number
  fieldOfStudy: string
}

export interface ProfessionalSettings {
  appointmentDuration: number // minutes
  bufferTime: number // minutes between appointments
  maxDailyAppointments: number
  autoAcceptBookings: boolean
  requireDeposit: boolean
  cancellationPolicy: string
}

// Appointment Management
export interface Appointment extends BaseEntity {
  appointmentId: string
  client: Client
  professional: Professional
  scheduledDate: string
  duration: number // minutes
  status: AppointmentStatus
  type: AppointmentType
  location: AppointmentLocation
  notes?: AppointmentNote[]
  reminders?: AppointmentReminder[]
  billing?: BillingInfo
  sessionSummary?: SessionSummary
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
  | 'therapy_session'
  | 'assessment'
  | 'follow_up'
  | 'group_session'
  | 'emergency'

export interface AppointmentLocation {
  type: 'in_person' | 'video_call' | 'phone_call'
  address?: Address
  videoCallLink?: string
  instructions?: string
}

export interface AppointmentNote {
  id: string
  content: string
  type: 'professional' | 'client' | 'system'
  createdAt: string
  createdBy: string
  isPrivate: boolean
}

export interface AppointmentReminder {
  id: string
  type: 'email' | 'sms' | 'push'
  scheduledFor: string
  sent: boolean
  sentAt?: string
}

export interface SessionSummary {
  objectives: string[]
  keyTopics: string[]
  interventions: string[]
  clientProgress: string
  nextSteps: string[]
  homeworkAssigned?: string[]
  professionalNotes: string
}

// Scheduling
export interface Schedule {
  professionalId: string
  workingDays: WorkingDay[]
  timeZone: string
  exceptions: ScheduleException[]
}

export interface WorkingDay {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  isWorking: boolean
  shifts: TimeSlot[]
}

export interface TimeSlot {
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  isAvailable: boolean
  appointmentId?: string
}

export interface Availability {
  date: string
  timeSlots: TimeSlot[]
  isAvailable: boolean
}

export interface ScheduleException {
  id: string
  date: string
  type: 'holiday' | 'vacation' | 'sick_day' | 'conference' | 'other'
  reason?: string
  isRecurring: boolean
  recurringRule?: RecurringRule
}

export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  count?: number
}

// Billing & Payments
export interface BillingInfo {
  amount: number
  currency: string
  status: BillingStatus
  invoiceId?: string
  paymentMethod?: PaymentMethod
  paidAt?: string
  dueDate?: string
}

export type BillingStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'insurance' | 'cash'
  lastFour?: string
  expiryMonth?: number
  expiryYear?: number
}

// Documents & Files
export interface Document extends BaseEntity {
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  type: DocumentType
  clientId?: string
  professionalId?: string
  appointmentId?: string
  tags?: string[]
  isConfidential: boolean
  uploadedBy: string
}

export type DocumentType = 
  | 'assessment'
  | 'treatment_plan'
  | 'progress_note'
  | 'insurance_form'
  | 'consent_form'
  | 'prescription'
  | 'lab_result'
  | 'image'
  | 'other'

// Notes & Communication
export interface ClientNote extends BaseEntity {
  clientId: string
  professionalId: string
  appointmentId?: string
  content: string
  type: NoteType
  tags?: string[]
  isPrivate: boolean
  attachments?: Document[]
}

export type NoteType = 'progress' | 'session' | 'assessment' | 'treatment_plan' | 'general'

// Analytics & Reporting
export interface DashboardStats {
  totalClients: number
  activeClients: number
  totalProfessionals: number
  activeProfessionals: number
  appointmentsToday: number
  appointmentsThisWeek: number
  appointmentsThisMonth: number
  revenue: RevenueStats
  clientSatisfaction?: number
  utilizationRate?: number
}

export interface RevenueStats {
  daily: number
  weekly: number
  monthly: number
  yearly: number
  currency: string
}

// System Configuration
export type SupportedLanguage = 'en' | 'fr'

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form Types
export interface FormValidationError {
  field: string
  message: string
}

export interface FormState<T = any> {
  data: T
  errors: FormValidationError[]
  isSubmitting: boolean
  isValid: boolean
}

// Search & Filtering
export interface SearchFilters {
  query?: string
  status?: string[]
  dateFrom?: string
  dateTo?: string
  professionalId?: string
  clientId?: string
  tags?: string[]
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface TableColumn<T = any> {
  id: string
  label: string
  accessor: keyof T | ((item: T) => any)
  sortable?: boolean
  filterable?: boolean
  width?: number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, item: T) => React.ReactNode
}

// UI Component Types
export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
  icon?: React.ComponentType<any>
}

export interface TabItem {
  id: string
  label: string
  icon?: React.ComponentType<any>
  content: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

export interface MenuItem {
  id: string
  label: string
  icon?: React.ComponentType<any>
  href?: string
  onClick?: () => void
  children?: MenuItem[]
  disabled?: boolean
  badge?: string | number
}

// Theme Types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    [key: string]: string
  }
  fonts: {
    sans: string[]
    mono: string[]
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
}