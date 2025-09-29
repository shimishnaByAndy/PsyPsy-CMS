/**
 * Tauri API Service Layer
 * Type-safe wrappers for all Tauri backend commands
 * Connects frontend to Rust backend methods
 */

import { invoke } from '@tauri-apps/api/core'
import type { User, UserProfile, Client, Professional, Appointment } from '@/types'

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

export interface CreateUserRequest {
  email: string
  username: string
  userType: number // Maps to UserType enum
  firstName: string
  lastName: string
}

export interface UpdateUserRequest {
  objectId: string
  firstName?: string
  lastName?: string
  bio?: string
  profilePicture?: string
}

export interface UserResponse {
  user: User
  displayName: string
  isAvailable: boolean
  loginCount: number
  lastLogin?: string
}

export const userAPI = {
  // Connect to unused User model methods
  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    return invoke('create_user', { request })
  },

  async getUserById(userId: string): Promise<UserResponse> {
    return invoke('get_user_by_id', { userId })
  },

  async updateUserProfile(request: UpdateUserRequest): Promise<UserResponse> {
    return invoke('update_user_profile', { request })
  },

  async recordUserLogin(userId: string): Promise<void> {
    return invoke('record_user_login', { userId })
  },

  async suspendUser(userId: string, reason: string): Promise<void> {
    return invoke('suspend_user', { userId, reason })
  },

  async reactivateUser(userId: string): Promise<void> {
    return invoke('reactivate_user', { userId })
  },

  async getUserDisplayName(userId: string): Promise<string> {
    return invoke('get_user_display_name', { userId })
  },

  async checkUserAvailability(userId: string): Promise<boolean> {
    return invoke('check_user_availability', { userId })
  }
}

// ============================================================================
// CLIENT MANAGEMENT API
// ============================================================================

export interface CreateClientRequest {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  spokenLanguages: number[]
  searchRadius?: number
  emergencyContacts?: Array<{
    name: string
    relationship: string
    phone: string
    email?: string
    isPrimary: boolean
  }>
}

export interface UpdateClientRequest {
  objectId: string
  firstName?: string
  lastName?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  searchRadius?: number
  spokenLanguages?: number[]
  emergencyContacts?: Array<{
    name: string
    relationship: string
    phone: string
    email?: string
    isPrimary: boolean
  }>
}

export interface ClientResponse extends Client {
  isActive: boolean
  displayName: string
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
}

export const clientAPI = {
  // Connect to unused Client model methods
  async createClient(request: CreateClientRequest): Promise<ClientResponse> {
    return invoke('create_client', { request })
  },

  async getClientById(clientId: string): Promise<ClientResponse> {
    return invoke('get_client_by_id', { clientId })
  },

  async updateClient(request: UpdateClientRequest): Promise<ClientResponse> {
    return invoke('update_client', { request })
  },

  async getAllClients(): Promise<ClientResponse[]> {
    return invoke('get_all_clients')
  },

  async assignProfessionalToClient(clientId: string, professionalId: string): Promise<void> {
    return invoke('assign_professional_to_client', { clientId, professionalId })
  },

  async unassignProfessionalFromClient(clientId: string, professionalId: string): Promise<void> {
    return invoke('unassign_professional_from_client', { clientId, professionalId })
  },

  async incrementClientAppointments(clientId: string, appointmentType: 'total' | 'completed' | 'cancelled'): Promise<void> {
    return invoke('increment_client_appointments', { clientId, appointmentType })
  },

  async getClientDisplayName(clientId: string): Promise<string> {
    return invoke('get_client_display_name', { clientId })
  },

  async checkClientActiveStatus(clientId: string): Promise<boolean> {
    return invoke('check_client_active_status', { clientId })
  }
}

// ============================================================================
// PROFESSIONAL MANAGEMENT API
// ============================================================================

export interface CreateProfessionalRequest {
  userId: string
  firstName: string
  lastName: string
  email: string
  licenseNumber: string
  specialization: string[]
  hourlyRate: number
  availabilitySchedule: Record<string, any>
}

export interface ProfessionalResponse extends Professional {
  isActive: boolean
  displayName: string
  totalClients: number
  activeAppointments: number
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  has_next_page: boolean
  has_previous_page: boolean
}

export const professionalAPI = {
  // Connect to unused Professional model methods
  async createProfessional(request: CreateProfessionalRequest): Promise<ProfessionalResponse> {
    return invoke('create_professional', { request })
  },

  async getProfessionalById(id: string): Promise<ProfessionalResponse> {
    return invoke('get_professional', { id })
  },

  async getAllProfessionals(page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<Professional>>> {
    return invoke('get_professionals', { page, limit })
  },

  async updateProfessional(id: string, request: any): Promise<ProfessionalResponse> {
    return invoke('update_professional', { id, request })
  },

  async deleteProfessional(id: string): Promise<void> {
    return invoke('delete_professional', { id })
  },

  async searchProfessionals(query: string, limit?: number): Promise<ProfessionalResponse[]> {
    return invoke('search_professionals', { query, limit })
  },

  async checkProfessionalActiveStatus(professionalId: string): Promise<boolean> {
    return invoke('check_professional_active_status', { professionalId })
  },

  async getProfessionalDisplayName(professionalId: string): Promise<string> {
    return invoke('get_professional_display_name', { professionalId })
  },

  async updateProfessionalVerification(professionalId: string, verified: boolean, verificationNotes?: string): Promise<ProfessionalResponse> {
    return invoke('update_professional_verification', { professionalId, verified, verificationNotes })
  },

  async getProfessionalStats(): Promise<any> {
    return invoke('get_professional_stats')
  }
}

// ============================================================================
// APPOINTMENT MANAGEMENT API
// ============================================================================

export interface CreateAppointmentRequest {
  clientId: string
  professionalId: string
  dateTime: string
  duration: number
  appointmentType: string
  notes?: string
}

export interface AppointmentResponse extends Appointment {
  canStart: boolean
  estimatedCost: number
  professionalAssigned: boolean
}

export const appointmentAPI = {
  // Connect to unused Appointment model methods
  async createAppointment(request: CreateAppointmentRequest): Promise<AppointmentResponse> {
    return invoke('create_appointment', { request })
  },

  async getAppointmentById(appointmentId: string): Promise<AppointmentResponse> {
    return invoke('get_appointment_by_id', { appointmentId })
  },

  async getAllAppointments(): Promise<AppointmentResponse[]> {
    return invoke('get_all_appointments')
  },

  async assignProfessionalToAppointment(appointmentId: string, professionalId: string, estimatedCost: number): Promise<void> {
    return invoke('assign_professional_to_appointment', { appointmentId, professionalId, estimatedCost })
  },

  async startAppointmentSession(appointmentId: string): Promise<void> {
    return invoke('start_appointment_session', { appointmentId })
  },

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    return invoke('update_appointment_status', { appointmentId, status })
  }
}

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  validationErrors?: Record<string, string[]>
}

export const responseAPI = {
  // Connect to unused ApiResponse methods from common.rs
  success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    }
  },

  error(message: string): ApiResponse<never> {
    return {
      success: false,
      error: message
    }
  },

  validationError(errors: Record<string, string[]>): ApiResponse<never> {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: errors
    }
  }
}

// ============================================================================
// OFFLINE SYNC API
// ============================================================================

export interface SyncStatus {
  lastSync?: string
  pendingUploads: string[]
  conflictNotes: string[]
  syncEnabled: boolean
  firebaseCollection: string
}

export const offlineSyncAPI = {
  // Connect to unused OfflineSyncService methods
  async initializeSyncService(userId: string, enableFirebaseSync: boolean): Promise<{ success: boolean; message: string }> {
    return invoke('initialize_sync_service', { userId, enableFirebaseSync })
  },

  async performManualSync(): Promise<{ success: boolean; message: string }> {
    return invoke('perform_manual_sync')
  },

  async getSyncStatus(): Promise<{ success: boolean; data: SyncStatus }> {
    return invoke('get_sync_status')
  },

  async setSyncEnabled(enabled: boolean): Promise<{ success: boolean; message: string }> {
    return invoke('set_sync_enabled', { enabled })
  },

  async forceSyncNote(noteId: string): Promise<{ success: boolean; message: string }> {
    return invoke('force_sync_note', { noteId })
  },

  async getConflictNotes(): Promise<{ success: boolean; data: any[] }> {
    return invoke('get_conflict_notes')
  },

  async resolveConflictManually(noteId: string, resolutionStrategy: string, resolvedNote: any): Promise<{ success: boolean; message: string }> {
    return invoke('resolve_conflict_manually', { noteId, resolutionStrategy, resolvedNote })
  },

  async checkNetworkConnectivity(): Promise<{ success: boolean; data: boolean }> {
    return invoke('check_network_connectivity')
  },

  async getPendingSyncCount(): Promise<{ success: boolean; data: number }> {
    return invoke('get_pending_sync_count')
  },

  async startBackgroundSync(): Promise<{ success: boolean; message: string }> {
    return invoke('start_background_sync')
  },

  async stopBackgroundSync(): Promise<{ success: boolean; message: string }> {
    return invoke('stop_background_sync')
  }
}

// ============================================================================
// AUDIO PROCESSING API
// ============================================================================

export const audioAPI = {
  // Connect to unused audio processing functions
  async normalizeAudio(audioData: Float32Array): Promise<Float32Array> {
    return invoke('normalize_audio', { audioData: Array.from(audioData) })
  },

  async spectralSubtraction(audioData: Float32Array, noiseLevel: number): Promise<Float32Array> {
    return invoke('spectral_subtraction', { audioData: Array.from(audioData), noiseLevel })
  },

  async calculateAverageNoiseSpectrum(audioData: Float32Array): Promise<number> {
    return invoke('calculate_average_noise_spectrum', { audioData: Array.from(audioData) })
  },

  async resampleAudio(audioData: Float32Array, fromSampleRate: number, toSampleRate: number): Promise<Float32Array> {
    return invoke('resample_audio', {
      audioData: Array.from(audioData),
      fromSampleRate,
      toSampleRate
    })
  },

  async writeAudioToFile(audioData: Float32Array, sampleRate: number, outputPath: string, deviceName: string, skipEncoding: boolean): Promise<string> {
    return invoke('write_audio_to_file', {
      audioData: Array.from(audioData),
      sampleRate,
      outputPath,
      deviceName,
      skipEncoding
    })
  }
}

// ============================================================================
// DEVTOOLS API
// ============================================================================

export const devToolsAPI = {
  // Connect to unused DevTools functionality
  async initializeDevTools(): Promise<void> {
    return invoke('initialize_devtools')
  },

  async createTracingLayer(): Promise<void> {
    return invoke('create_tracing_layer')
  }
}

// ============================================================================
// COMBINED HEALTHCARE API
// ============================================================================

export const healthcareAPI = {
  user: userAPI,
  client: clientAPI,
  professional: professionalAPI,
  appointment: appointmentAPI,
  response: responseAPI,
  offlineSync: offlineSyncAPI,
  audio: audioAPI,
  devTools: devToolsAPI
}

export default healthcareAPI