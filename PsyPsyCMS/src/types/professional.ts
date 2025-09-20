/**
 * Professional Types for PsyPsy CMS
 * Quebec Law 25 & PIPEDA Compliant Professional Management
 * Aligned with Rust backend model structure
 */

export interface Professional {
  objectId: string
  userId: string

  // Profile Information (nested)
  profile: UserProfile

  // Location & Contact
  addressObj: AddressObject
  geoPt?: GeoPoint
  phoneNb: PhoneNumber
  bussEmail: string
  businessName: string

  // Professional Details
  profType: number
  eduInstitute: number
  motherTongue: number
  offeredLangArr: number[]

  // Services & Expertise
  expertises: ExpertiseObject[]
  servOfferedArr: number[]
  servOfferedObj: Record<number, ServiceObject>
  servedClientele: number[]

  // Business Operations
  availability: number[]
  meetType: MeetingType
  thirdPartyPayers: number[]
  partOfOrder?: OrderInfo

  // Professional status and verification
  status: ProfessionalStatus
  verification: VerificationInfo
  licenseInfo: LicenseInfo
  rating: Rating

  // Statistics
  totalClients: number
  activeClients: number
  totalAppointments: number
  completedAppointments: number

  // Timestamps (as ISO strings)
  createdAt: string
  updatedAt: string
}

// Core interface definitions matching Rust backend
export interface UserProfile {
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: number // 0=not specified, 1=male, 2=female, 3=other
  profilePicture?: string
  bio?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface AddressObject {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface PhoneNumber {
  countryCode: string
  number: string
  formatted?: string
}

export interface ExpertiseObject {
  category: number
  subcategories: number[]
  experience: number
  certification?: string
}

export interface ServiceObject {
  name: string
  description: string
  duration: number // minutes
  price: number
  currency: string
}

export interface OrderInfo {
  orderNumber: string
  status: string
  createdAt: string
}

export interface VerificationInfo {
  isVerified: boolean
  verificationDate?: string
  verifiedBy?: string
  verificationDocuments: Document[]
}

export interface Document {
  documentType: string
  fileUrl: string
  uploadedAt: string
  isVerified: boolean
}

export interface LicenseInfo {
  licenseNumber: string
  licenseType: string
  issuingState: string
  issueDate: string
  expiryDate: string
  isActive: boolean
}

export interface Rating {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number> // rating -> count
}

export enum MeetingType {
  Both = 0,
  InPerson = 1,
  Online = 2,
}

export enum ProfessionalStatus {
  Active = 'active',
  Pending = 'pending',
  Suspended = 'suspended',
  Inactive = 'inactive',
}

export type LicenseType =
  | 'psychologist'
  | 'psychiatrist'
  | 'social_worker'
  | 'counselor'
  | 'therapist'
  | 'nurse'

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface WorkingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  start?: string // HH:MM format
  end?: string   // HH:MM format
  available: boolean
}

// Legacy interfaces for backward compatibility
export interface Availability {
  date: Date
  timeSlots: AvailableTimeSlot[]
}

export interface AvailableTimeSlot {
  start: string
  end: string
  isAvailable: boolean
  appointmentId?: string
}

// Legacy credential interface
export interface Credential {
  type: string
  name: string
  issuer: string
  number: string
  issuedDate: Date
  expiryDate?: Date
  isVerified: boolean
}

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

// API Response Types matching Rust backend
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ProfessionalStats {
  total: number
  active: number
  averageRating: number
  licenseExpiringSoon: number
}

export interface SearchFilters {
  status?: string
  userType?: string
  assignedProfessional?: string
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

export interface SortOptions {
  field: string
  direction: 'ASC' | 'DESC'
}

// Helper types for display
export interface DisplayProfessional extends Professional {
  displayName: string
  isActive: boolean
}

// Legacy interfaces for backward compatibility (to be phased out)
export interface PersonalInfo {
  firstName: string
  lastName: string
  fullName: string
  phoneNumber: string
  email: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: Address
}

export interface BusinessInfo {
  businessName: string
  businessRegistrationNumber: string
  taxNumber: string
  website: string
  businessAddress: Address
}

// Export default
export default Professional