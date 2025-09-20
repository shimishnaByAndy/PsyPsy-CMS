/**
 * User Types for PsyPsy CMS
 * Quebec Law 25 & PIPEDA Compliant User Management
 */

// Define types first
export type UserType =
  | 'admin'
  | 'professional'
  | 'receptionist'
  | 'client'
  | 'guest'

export type UserRole =
  | 'super_admin'
  | 'system_admin'
  | 'clinic_admin'
  | 'psychologist'
  | 'psychiatrist'
  | 'therapist'
  | 'counselor'
  | 'social_worker'
  | 'nurse'
  | 'receptionist'
  | 'assistant'
  | 'client'
  | 'guardian'
  | 'emergency_contact'

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification'
  | 'archived'

export interface User {
  id: string
  email: string
  name: string
  userType: UserType
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  profileImageUrl?: string

  // Quebec Law 25 compliance fields
  consentGiven: boolean
  consentDate: Date
  dataRetentionDate: Date
  auditTrail: AuditEntry[]
}

export interface UserProfile {
  userId: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  phoneNumber?: string
  address?: Address
  emergencyContact?: EmergencyContact

  // Professional-specific fields
  licenseNumber?: string
  specializations?: string[]
  credentials?: Credential[]

  // Client-specific fields
  healthCardNumber?: string // PHI - must be encrypted
  insuranceInfo?: InsuranceInfo // PHI - must be encrypted

  // Quebec Law 25 compliance
  preferredLanguage: 'en' | 'fr'
  privacyPreferences: PrivacyPreferences
  consentHistory: ConsentRecord[]
}

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
  email?: string
}

export interface Credential {
  type: 'license' | 'certification' | 'degree'
  name: string
  issuer: string
  number: string
  issuedDate: Date
  expiryDate?: Date
  isVerified: boolean
}

export interface InsuranceInfo {
  provider: string
  policyNumber: string // PHI - must be encrypted
  groupNumber?: string
  expiryDate?: Date
}

export interface PrivacyPreferences {
  allowMarketing: boolean
  allowDataSharing: boolean
  allowResearch: boolean
  preferredContactMethod: 'email' | 'phone' | 'sms'
  dataRetentionPeriod: number // in years
}

export interface ConsentRecord {
  id: string
  userId: string
  consentType: ConsentType
  purpose: string
  granted: boolean
  timestamp: Date
  expiryDate?: Date
  withdrawnDate?: Date
  legalBasis: string
  version: string
}

export type ConsentType =
  | 'data_processing'
  | 'marketing'
  | 'research'
  | 'data_sharing'
  | 'cookies'
  | 'location_tracking'
  | 'biometric_data'
  | 'medical_records'

export interface AuditEntry {
  id: string
  timestamp: Date
  action: AuditAction
  userId: string
  performedBy: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string

  // Quebec Law 25 specific
  dataSubject?: string
  legalBasis?: string
  processingPurpose?: string
}

export type AuditAction =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'profile_viewed'
  | 'profile_updated'
  | 'consent_granted'
  | 'consent_withdrawn'
  | 'data_exported'
  | 'data_deleted'
  | 'permission_changed'
  | 'role_assigned'
  | 'role_removed'

// Form types for user management
export interface CreateUserData {
  email: string
  name: string
  userType: UserType
  role: UserRole
  temporaryPassword?: string
  profile?: Partial<UserProfile>
}

export interface UpdateUserData {
  name?: string
  userType?: UserType
  role?: UserRole
  status?: UserStatus
  profile?: Partial<UserProfile>
}

export interface UserTableFilters {
  search?: string
  userType?: UserType | 'all'
  role?: UserRole | 'all'
  status?: UserStatus | 'all'
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface UserTableSorting {
  field: keyof User | 'profile.firstName' | 'profile.lastName'
  direction: 'asc' | 'desc'
}

export interface UserTablePagination {
  page: number
  pageSize: number
  total: number
}

// Quebec Law 25 specific types
export interface DataSubjectRequest {
  id: string
  userId: string
  requestType: DataSubjectRequestType
  status: DataSubjectRequestStatus
  requestedAt: Date
  completedAt?: Date
  description: string
  response?: string
  documents?: string[]
}

export type DataSubjectRequestType =
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'portability'
  | 'restriction'
  | 'objection'

export type DataSubjectRequestStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled'

// API Response types
export interface UsersResponse {
  users: User[]
  pagination: UserTablePagination
  filters: UserTableFilters
  sorting: UserTableSorting
}

export interface UserResponse {
  user: User
  profile?: UserProfile
  permissions: string[]
  auditTrail: AuditEntry[]
}

// All types are exported above - no re-export needed