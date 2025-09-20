/**
 * Firebase API Service - Quebec Law 25 & PIPEDA Compliant
 *
 * Handles all API calls to Firebase emulator and production endpoints
 * with proper audit logging and error handling.
 */

import { httpsCallable, HttpsCallableResult } from 'firebase/functions'
import { functions } from '@/firebase/firebase-config'
import { environment, buildFunctionUrl, logEnvironmentAudit } from '@/config/environment'
import type {
  User,
  Professional,
  Client,
  Appointment,
  UserProfile,
  CreateAppointmentRequest
} from '@/types'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
  compliance: {
    dataResidency: 'Quebec, Canada'
    standards: ['PIPEDA', 'Law25']
    auditRequired: boolean
  }
}

// Firebase Function Names (matching your deployed endpoints)
export const FUNCTIONS = {
  // Authentication
  HELLO_WORLD: 'helloWorld',
  AUTHENTICATE_USER: 'authenticateUser',
  CREATE_USER_ACCOUNT: 'createUserAccount',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
  REFRESH_TOKEN: 'refreshToken',
  LOGOUT_USER: 'logoutUser',

  // User Profiles
  CREATE_USER_PROFILE: 'createUserProfile',
  GET_USER_PROFILE: 'getUserProfile',
  UPDATE_DEVICE_TOKEN: 'updateDeviceToken',
  UPDATE_PHONE_NUMBER: 'updatePhoneNumber',

  // Professionals
  GET_PROFESSIONALS: 'getProfessionals',
  CREATE_PROFESSIONAL: 'createProfessional',
  UPDATE_PROFESSIONAL: 'updateProfessional',
  DELETE_PROFESSIONAL: 'deleteProfessional',

  // Clients
  GET_CLIENTS: 'getClients',
  CREATE_CLIENT: 'createClient',
  UPDATE_CLIENT: 'updateClient',
  DELETE_CLIENT: 'deleteClient',
  SEARCH_CLIENTS: 'searchClients',

  // Appointments
  CREATE_APPOINTMENT: 'createAppointment',
  GET_APPOINTMENTS: 'getAppointments',
  UPDATE_APPOINTMENT: 'updateAppointment',
  DELETE_APPOINTMENT: 'deleteAppointment',
  GET_PROFESSIONAL_APPOINTMENTS: 'getProfessionalAppointments',
  GET_CLIENT_APPOINTMENTS: 'getClientAppointments',

  // Notifications
  SEND_PUSH_NOTIFICATION: 'sendPushNotification',
  SEND_SMS: 'sendSMS',
  SEND_COMBINED_NOTIFICATION: 'sendCombinedNotification',

  // Legacy
  GET_USERS: 'getUsers'
} as const

/**
 * Enhanced Firebase Functions wrapper with Quebec compliance
 */
class FirebaseApiService {
  private auditLog(action: string, data?: any, containsPII = false) {
    logEnvironmentAudit(action, {
      containsPII,
      environment: environment.name,
      data: containsPII ? '[REDACTED]' : data
    })
  }

  /**
   * Generic function caller with error handling and audit logging
   */
  private async callFunction<T = any>(
    functionName: string,
    data?: any,
    containsPII = false
  ): Promise<ApiResponse<T>> {
    this.auditLog(`api_call_${functionName}`, data, containsPII)

    try {
      const callable = httpsCallable<any, T>(functions, functionName)
      const result: HttpsCallableResult<T> = await callable(data)

      this.auditLog(`api_response_${functionName}`, 'success', containsPII)

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
        compliance: {
          dataResidency: environment.compliance.dataResidency,
          standards: environment.compliance.standards,
          auditRequired: containsPII
        }
      }
    } catch (error: any) {
      this.auditLog(`api_error_${functionName}`, error.message, false)

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        compliance: {
          dataResidency: environment.compliance.dataResidency,
          standards: environment.compliance.standards,
          auditRequired: containsPII
        }
      }
    }
  }

  /**
   * Test connection with helloWorld endpoint
   */
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    return this.callFunction(FUNCTIONS.HELLO_WORLD, undefined, false)
  }

  /**
   * Create user profile
   */
  async createUserProfile(userData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.callFunction(FUNCTIONS.CREATE_USER_PROFILE, userData, true)
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    return this.callFunction(FUNCTIONS.GET_USER_PROFILE, { userId }, true)
  }

  /**
   * Create appointment
   */
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<ApiResponse<Appointment>> {
    return this.callFunction(FUNCTIONS.CREATE_APPOINTMENT, appointmentData, true)
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(filters?: any): Promise<ApiResponse<User[]>> {
    return this.callFunction(FUNCTIONS.GET_USERS, filters, true)
  }

  /**
   * Get all professionals
   */
  async getProfessionals(filters?: any): Promise<ApiResponse<Professional[]>> {
    return this.callFunction(FUNCTIONS.GET_PROFESSIONALS, filters, true)
  }

  /**
   * Get appointments
   */
  async getAppointments(filters?: any): Promise<ApiResponse<Appointment[]>> {
    return this.callFunction(FUNCTIONS.GET_APPOINTMENTS, filters, true)
  }

  // ===== AUTHENTICATION METHODS =====

  /**
   * Authenticate user with email/password
   */
  async authenticateUser(email: string, password: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.AUTHENTICATE_USER, { email, password }, true)
  }

  /**
   * Create new user account
   */
  async createUserAccount(userData: any): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.CREATE_USER_ACCOUNT, userData, true)
  }

  /**
   * Reset user password
   */
  async resetPassword(email: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.RESET_PASSWORD, { email }, false)
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.VERIFY_EMAIL, { token }, false)
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.REFRESH_TOKEN, { refreshToken }, false)
  }

  /**
   * Logout user
   */
  async logoutUser(userId: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.LOGOUT_USER, { userId }, false)
  }

  // ===== USER PROFILE METHODS =====

  /**
   * Update device token for notifications
   */
  async updateDeviceToken(userId: string, token: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.UPDATE_DEVICE_TOKEN, { userId, token }, true)
  }

  /**
   * Update phone number
   */
  async updatePhoneNumber(userId: string, phoneNumber: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.UPDATE_PHONE_NUMBER, { userId, phoneNumber }, true)
  }

  // ===== PROFESSIONAL METHODS =====

  /**
   * Create new professional
   */
  async createProfessional(professionalData: Partial<Professional>): Promise<ApiResponse<Professional>> {
    return this.callFunction(FUNCTIONS.CREATE_PROFESSIONAL, professionalData, true)
  }

  /**
   * Update professional
   */
  async updateProfessional(professionalId: string, updates: Partial<Professional>): Promise<ApiResponse<Professional>> {
    return this.callFunction(FUNCTIONS.UPDATE_PROFESSIONAL, { professionalId, ...updates }, true)
  }

  /**
   * Delete professional
   */
  async deleteProfessional(professionalId: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.DELETE_PROFESSIONAL, { professionalId }, false)
  }

  // ===== CLIENT METHODS =====

  /**
   * Get all clients
   */
  async getClients(filters?: any): Promise<ApiResponse<Client[]>> {
    return this.callFunction(FUNCTIONS.GET_CLIENTS, filters, true)
  }

  /**
   * Create new client
   */
  async createClient(clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.callFunction(FUNCTIONS.CREATE_CLIENT, clientData, true)
  }

  /**
   * Update client
   */
  async updateClient(clientId: string, updates: Partial<Client>): Promise<ApiResponse<Client>> {
    return this.callFunction(FUNCTIONS.UPDATE_CLIENT, { clientId, ...updates }, true)
  }

  /**
   * Delete client
   */
  async deleteClient(clientId: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.DELETE_CLIENT, { clientId }, false)
  }

  /**
   * Search clients
   */
  async searchClients(query: string, filters?: any): Promise<ApiResponse<Client[]>> {
    return this.callFunction(FUNCTIONS.SEARCH_CLIENTS, { query, ...filters }, true)
  }

  // ===== APPOINTMENT METHODS =====

  /**
   * Update appointment
   */
  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return this.callFunction(FUNCTIONS.UPDATE_APPOINTMENT, { appointmentId, ...updates }, true)
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(appointmentId: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.DELETE_APPOINTMENT, { appointmentId }, false)
  }

  /**
   * Get professional's appointments
   */
  async getProfessionalAppointments(professionalId: string, filters?: any): Promise<ApiResponse<Appointment[]>> {
    return this.callFunction(FUNCTIONS.GET_PROFESSIONAL_APPOINTMENTS, { professionalId, ...filters }, true)
  }

  /**
   * Get client's appointments
   */
  async getClientAppointments(clientId: string, filters?: any): Promise<ApiResponse<Appointment[]>> {
    return this.callFunction(FUNCTIONS.GET_CLIENT_APPOINTMENTS, { clientId, ...filters }, true)
  }

  // ===== NOTIFICATION METHODS =====

  /**
   * Send push notification
   */
  async sendPushNotification(recipientId: string, message: string, data?: any): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.SEND_PUSH_NOTIFICATION, { recipientId, message, data }, false)
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber: string, message: string): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.SEND_SMS, { phoneNumber, message }, true)
  }

  /**
   * Send combined notification (push + SMS)
   */
  async sendCombinedNotification(recipientId: string, message: string, data?: any): Promise<ApiResponse<any>> {
    return this.callFunction(FUNCTIONS.SEND_COMBINED_NOTIFICATION, { recipientId, message, data }, true)
  }
}

// Export singleton instance
export const firebaseApi = new FirebaseApiService()

/**
 * Authentication service for emulator and production
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth'
import { auth } from '@/firebase/firebase-config'

export interface AuthResponse {
  success: boolean
  user?: FirebaseUser
  error?: string
  compliance: {
    dataResidency: 'Quebec, Canada'
    standards: ['PIPEDA', 'Law25']
    auditRequired: boolean
  }
}

class AuthService {
  private auditAuthAction(action: string, userId?: string, error?: string) {
    console.log('[AUDIT - Quebec Law 25]', {
      action: `auth_${action}`,
      userId: userId ? `[REDACTED]` : undefined,
      error,
      timestamp: new Date().toISOString(),
      dataResidency: 'Quebec, Canada',
      compliance: ['PIPEDA', 'Law25']
    })
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    this.auditAuthAction('sign_in_attempt')

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      this.auditAuthAction('sign_in_success', result.user.uid)

      return {
        success: true,
        user: result.user,
        compliance: {
          dataResidency: environment.compliance.dataResidency,
          standards: environment.compliance.standards,
          auditRequired: true
        }
      }
    } catch (error) {
      const authError = error as AuthError
      this.auditAuthAction('sign_in_failed', undefined, authError.message)

      return {
        success: false,
        error: authError.message,
        compliance: {
          dataResidency: environment.compliance.dataResidency,
          standards: environment.compliance.standards,
          auditRequired: true
        }
      }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResponse> {
    this.auditAuthAction('sign_out_attempt')

    try {
      await signOut(auth)
      this.auditAuthAction('sign_out_success')

      return {
        success: true,
        compliance: {
          dataResidency: environment.compliance.dataResidency,
          standards: environment.compliance.standards,
          auditRequired: true
        }
      }
    } catch (error) {
      const authError = error as AuthError
      this.auditAuthAction('sign_out_failed', undefined, authError.message)

      return {
        success: false,
        error: authError.message,
        compliance: {
          dataResidency: environment.compliance.dataResidency,
          standards: environment.compliance.standards,
          auditRequired: true
        }
      }
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, (user) => {
      this.auditAuthAction('auth_state_change', user?.uid)
      callback(user)
    })
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }
}

// Export singleton instance
export const authService = new AuthService()

/**
 * Test accounts for development (matching your setup)
 */
export const TEST_ACCOUNTS = {
  ADMIN: {
    email: 'admin@psypsy.test',
    password: 'testpassword123',
    role: 'admin'
  },
  PROFESSIONAL_1: {
    email: 'prof1@psypsy.test',
    password: 'testpassword123',
    role: 'professional',
    name: 'Dr. Sarah Wilson'
  },
  PROFESSIONAL_2: {
    email: 'prof2@psypsy.test',
    password: 'testpassword123',
    role: 'professional',
    name: 'Dr. Michael Chen'
  },
  CLIENT_1: {
    email: 'client1@psypsy.test',
    password: 'testpassword123',
    role: 'client',
    name: 'John Doe'
  },
  CLIENT_2: {
    email: 'client2@psypsy.test',
    password: 'testpassword123',
    role: 'client',
    name: 'Jane Smith'
  }
} as const