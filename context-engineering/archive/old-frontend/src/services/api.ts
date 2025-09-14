/**
 * TypeScript API layer for Rust backend communication via Tauri
 * Healthcare-focused with comprehensive error handling and type safety
 */

import { invoke } from '@tauri-apps/api/tauri'
import { z } from 'zod'
import { 
  Client, 
  Professional, 
  Appointment, 
  User, 
  ApiResponse, 
  PaginatedResponse,
  SearchFilters,
  SortOptions,
  DashboardStats
} from '@/types'

/**
 * API Error Classes
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network connection failed') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', validationErrors)
    this.name = 'ValidationError'
  }
}

/**
 * Base API client with error handling and request/response transformation
 */
class BaseApiClient {
  private async invokeCommand<T>(
    command: string,
    args?: Record<string, any>
  ): Promise<T> {
    try {
      const result = await invoke<ApiResponse<T>>(command, args)
      
      if (!result.success) {
        if (result.errors) {
          throw new ValidationError(
            result.message || 'Validation failed',
            result.errors
          )
        }
        throw new ApiError(
          result.message || 'API call failed',
          undefined,
          'API_ERROR'
        )
      }
      
      return result.data!
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Handle Tauri invoke errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string
        
        if (message.includes('network') || message.includes('connection')) {
          throw new NetworkError(message)
        }
        
        throw new ApiError(message, undefined, 'TAURI_ERROR')
      }
      
      throw new ApiError('Unknown error occurred', undefined, 'UNKNOWN_ERROR')
    }
  }

  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.invokeCommand<T>('api_get', { endpoint, params })
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.invokeCommand<T>('api_post', { endpoint, data })
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.invokeCommand<T>('api_put', { endpoint, data })
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.invokeCommand<T>('api_delete', { endpoint })
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.invokeCommand<T>('api_patch', { endpoint, data })
  }
}

/**
 * Authentication API
 */
class AuthApi extends BaseApiClient {
  async login(email: string, password: string): Promise<{
    user: User
    token: string
    refreshToken: string
  }> {
    return this.post('/auth/login', { email, password })
  }

  async logout(): Promise<void> {
    return this.post('/auth/logout')
  }

  async refreshToken(refreshToken: string): Promise<{
    token: string
    refreshToken: string
  }> {
    return this.post('/auth/refresh', { refreshToken })
  }

  async getCurrentUser(): Promise<User> {
    return this.get('/auth/user')
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.patch('/auth/user', data)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.post('/auth/password', { currentPassword, newPassword })
  }

  async requestPasswordReset(email: string): Promise<void> {
    return this.post('/auth/password-reset', { email })
  }
}

/**
 * Client Management API
 */
class ClientsApi extends BaseApiClient {
  async getClients(options?: {
    page?: number
    limit?: number
    filters?: SearchFilters
    sort?: SortOptions
  }): Promise<PaginatedResponse<Client>> {
    return this.get('/clients', options)
  }

  async getClient(id: string): Promise<Client> {
    return this.get(`/clients/${id}`)
  }

  async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    return this.post('/clients', data)
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    return this.patch(`/clients/${id}`, data)
  }

  async deleteClient(id: string): Promise<void> {
    return this.delete(`/clients/${id}`)
  }

  async searchClients(query: string, limit = 10): Promise<Client[]> {
    return this.get('/clients/search', { query, limit })
  }

  async getClientAppointments(id: string): Promise<Appointment[]> {
    return this.get(`/clients/${id}/appointments`)
  }

  async getClientNotes(id: string): Promise<any[]> {
    return this.get(`/clients/${id}/notes`)
  }

  async assignProfessional(clientId: string, professionalId: string): Promise<void> {
    return this.post(`/clients/${clientId}/professionals`, { professionalId })
  }

  async unassignProfessional(clientId: string, professionalId: string): Promise<void> {
    return this.delete(`/clients/${clientId}/professionals/${professionalId}`)
  }

  async getClientStats(): Promise<{
    total: number
    active: number
    new_this_month: number
    retention_rate: number
  }> {
    return this.get('/clients/stats')
  }
}

/**
 * Professional Management API
 */
class ProfessionalsApi extends BaseApiClient {
  async getProfessionals(options?: {
    page?: number
    limit?: number
    filters?: SearchFilters
    sort?: SortOptions
  }): Promise<PaginatedResponse<Professional>> {
    return this.get('/professionals', options)
  }

  async getProfessional(id: string): Promise<Professional> {
    return this.get(`/professionals/${id}`)
  }

  async createProfessional(data: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>): Promise<Professional> {
    return this.post('/professionals', data)
  }

  async updateProfessional(id: string, data: Partial<Professional>): Promise<Professional> {
    return this.patch(`/professionals/${id}`, data)
  }

  async deleteProfessional(id: string): Promise<void> {
    return this.delete(`/professionals/${id}`)
  }

  async getProfessionalAvailability(id: string, date?: string): Promise<any[]> {
    return this.get(`/professionals/${id}/availability`, date ? { date } : undefined)
  }

  async updateAvailability(id: string, availability: any[]): Promise<void> {
    return this.put(`/professionals/${id}/availability`, { availability })
  }

  async getProfessionalClients(id: string): Promise<Client[]> {
    return this.get(`/professionals/${id}/clients`)
  }

  async getProfessionalStats(): Promise<{
    total: number
    active: number
    average_rating: number
    license_expiring_soon: number
  }> {
    return this.get('/professionals/stats')
  }
}

/**
 * Appointment Management API
 */
class AppointmentsApi extends BaseApiClient {
  async getAppointments(options?: {
    page?: number
    limit?: number
    filters?: SearchFilters
    sort?: SortOptions
  }): Promise<PaginatedResponse<Appointment>> {
    return this.get('/appointments', options)
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.get(`/appointments/${id}`)
  }

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return this.post('/appointments', data)
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return this.patch(`/appointments/${id}`, data)
  }

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    return this.post(`/appointments/${id}/cancel`, { reason })
  }

  async rescheduleAppointment(id: string, newDateTime: string): Promise<Appointment> {
    return this.post(`/appointments/${id}/reschedule`, { scheduledDate: newDateTime })
  }

  async startAppointment(id: string): Promise<Appointment> {
    return this.post(`/appointments/${id}/start`)
  }

  async completeAppointment(id: string, sessionSummary: any): Promise<Appointment> {
    return this.post(`/appointments/${id}/complete`, { sessionSummary })
  }

  async getUpcomingAppointments(limit = 10): Promise<Appointment[]> {
    return this.get('/appointments/upcoming', { limit })
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
    return this.get('/appointments/today')
  }

  async getCalendarData(date: string): Promise<{
    appointments: Appointment[]
    availability: any[]
  }> {
    return this.get(`/appointments/calendar/${date}`)
  }

  async getAppointmentStats(): Promise<{
    today: number
    this_week: number
    this_month: number
    completion_rate: number
    no_show_rate: number
  }> {
    return this.get('/appointments/stats')
  }
}

/**
 * Notes and Documents API
 */
class NotesApi extends BaseApiClient {
  async getNotes(options?: {
    page?: number
    limit?: number
    filters?: SearchFilters
  }): Promise<PaginatedResponse<any>> {
    return this.get('/notes', options)
  }

  async getNote(id: string): Promise<any> {
    return this.get(`/notes/${id}`)
  }

  async createNote(data: any): Promise<any> {
    return this.post('/notes', data)
  }

  async updateNote(id: string, data: Partial<any>): Promise<any> {
    return this.patch(`/notes/${id}`, data)
  }

  async deleteNote(id: string): Promise<void> {
    return this.delete(`/notes/${id}`)
  }

  async uploadDocument(file: File, metadata: any): Promise<any> {
    // This would use Tauri's file system API
    return this.post('/documents/upload', { file, metadata })
  }

  async getDocuments(options?: {
    page?: number
    limit?: number
    filters?: SearchFilters
  }): Promise<PaginatedResponse<any>> {
    return this.get('/documents', options)
  }

  async downloadDocument(id: string): Promise<Blob> {
    return this.get(`/documents/${id}/download`)
  }
}

/**
 * Dashboard and Analytics API
 */
class DashboardApi extends BaseApiClient {
  async getDashboardStats(): Promise<DashboardStats> {
    return this.get('/dashboard/stats')
  }

  async getOverviewData(period = '7d'): Promise<{
    appointments: any[]
    revenue: any[]
    clients: any[]
    satisfaction: any[]
  }> {
    return this.get('/dashboard/overview', { period })
  }

  async getChartData(type: string, period = '7d'): Promise<any[]> {
    return this.get(`/dashboard/charts/${type}`, { period })
  }

  async getRecentActivity(limit = 10): Promise<any[]> {
    return this.get('/dashboard/activity', { limit })
  }
}

/**
 * Settings API
 */
class SettingsApi extends BaseApiClient {
  async getUserSettings(): Promise<any> {
    return this.get('/settings/user')
  }

  async updateUserSettings(settings: any): Promise<any> {
    return this.patch('/settings/user', settings)
  }

  async getSystemSettings(): Promise<any> {
    return this.get('/settings/system')
  }

  async updateSystemSettings(settings: any): Promise<any> {
    return this.patch('/settings/system', settings)
  }
}

/**
 * Main API client with all endpoints
 */
export class ApiClient {
  readonly auth = new AuthApi()
  readonly clients = new ClientsApi()
  readonly professionals = new ProfessionalsApi()
  readonly appointments = new AppointmentsApi()
  readonly notes = new NotesApi()
  readonly dashboard = new DashboardApi()
  readonly settings = new SettingsApi()
}

// Export singleton instance
export const api = new ApiClient()

// Export specific error types for handling
export { ApiError, NetworkError, ValidationError }

// Export utility functions
export const apiUtils = {
  /**
   * Check if error is retryable
   */
  isRetryableError: (error: unknown): boolean => {
    if (error instanceof NetworkError) return true
    if (error instanceof ApiError && error.status && error.status >= 500) return true
    return false
  },

  /**
   * Get user-friendly error message
   */
  getErrorMessage: (error: unknown): string => {
    if (error instanceof ValidationError) {
      const firstError = Object.values(error.validationErrors)[0]?.[0]
      return firstError || error.message
    }
    
    if (error instanceof NetworkError) {
      return 'Network connection issue. Please check your internet connection.'
    }
    
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return 'Your session has expired. Please log in again.'
      }
      if (error.status === 403) {
        return 'You do not have permission to perform this action.'
      }
      if (error.status === 404) {
        return 'The requested resource was not found.'
      }
      return error.message
    }
    
    if (error instanceof Error) {
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  },

  /**
   * Create abort controller for request cancellation
   */
  createAbortController: (timeoutMs = 30000) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeoutMs)
    return controller
  }
}

export default api