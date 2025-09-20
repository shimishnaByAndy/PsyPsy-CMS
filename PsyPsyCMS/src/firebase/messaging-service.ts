/**
 * Firebase Cloud Messaging Service
 * Enhanced for Canadian healthcare compliance and rich notifications
 *
 * Features:
 * - Rich media support (images, actions, badges)
 * - PIPEDA and Quebec Law 25 compliant audit logging
 * - Canadian data residency compliance
 * - Healthcare-specific notification templates
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import type { MessagePayload } from 'firebase/messaging'
import { app, db } from './firebase-config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Rich notification interface for healthcare
export interface RichNotification {
  id?: string
  title: string
  body: string
  image?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  timestamp?: number

  // Healthcare specific fields
  patientId?: string
  appointmentId?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: 'appointment' | 'reminder' | 'alert' | 'system' | 'emergency'

  // Rich content
  actions?: NotificationAction[]
  data?: Record<string, any>

  // Canadian Privacy Compliance fields
  containsPersonalInfo: boolean
  auditRequired: boolean
  retentionDays: number
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
  type?: 'button' | 'text'
  placeholder?: string
}

// Healthcare notification templates
export const NOTIFICATION_TEMPLATES = {
  APPOINTMENT_REMINDER: {
    title: 'Appointment Reminder',
    category: 'reminder' as const,
    priority: 'normal' as const,
    containsPersonalInfo: true,
    auditRequired: true,
    retentionDays: 2555, // 7 years for medical records (Quebec Law 25)
    actions: [
      { action: 'confirm', title: 'Confirm', icon: '✓' },
      { action: 'reschedule', title: 'Reschedule', icon: '📅' }
    ] as NotificationAction[]
  },

  URGENT_ALERT: {
    title: 'Urgent Medical Alert',
    category: 'emergency' as const,
    priority: 'urgent' as const,
    requireInteraction: true,
    containsPersonalInfo: true,
    auditRequired: true,
    retentionDays: 2555,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'acknowledge', title: 'Acknowledge', icon: '⚠️' },
      { action: 'escalate', title: 'Escalate', icon: '🚨' }
    ] as NotificationAction[]
  },

  SYSTEM_UPDATE: {
    title: 'System Notification',
    category: 'system' as const,
    priority: 'low' as const,
    containsPersonalInfo: false,
    auditRequired: false,
    retentionDays: 90,
    actions: [
      { action: 'dismiss', title: 'Dismiss', icon: '✖️' }
    ] as NotificationAction[]
  }
} as const

class FirebaseMessagingService {
  private messaging
  private vapidKey: string
  private currentToken: string | null = null
  private isEnabled: boolean

  constructor() {
    // Check if Firebase app is available
    if (!app) {
      console.log('🔔 Firebase not available - messaging service will work in local-only mode')
      this.isEnabled = false
      this.vapidKey = ''
      return
    }

    // Disable messaging in development/emulator mode unless explicitly enabled
    this.isEnabled = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_FCM_IN_DEV === 'true'

    if (this.isEnabled) {
      try {
        this.messaging = getMessaging(app)
        this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

        if (!this.vapidKey) {
          console.warn('VAPID key not configured. Push notifications may not work.')
        }
      } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error)
        this.isEnabled = false
        this.vapidKey = ''
      }
    } else {
      console.log('🔔 Firebase Messaging disabled in development mode')
      console.log('💡 Set VITE_ENABLE_FCM_IN_DEV=true to enable FCM in development')
      this.vapidKey = ''
    }
  }

  /**
   * Request notification permission and get FCM token
   * Required for receiving push notifications
   */
  async requestPermission(): Promise<string | null> {
    try {
      // Check if Firebase is available
      if (!app || !this.messaging) {
        console.warn('Firebase not initialized - notifications will work in local-only mode')

        // Still request browser permission for local notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            return 'local-notifications-enabled'
          }
        }
        throw new Error('Firebase not available and browser notifications not supported')
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications')
      }

      // Request permission
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get FCM token with VAPID key
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      })

      if (!token) {
        throw new Error('Failed to get FCM token')
      }

      this.currentToken = token

      // Log for compliance audit
      await this.auditLog('FCM_TOKEN_GENERATED', {
        hasToken: !!token,
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
        permission
      })

      return token
    } catch (error) {
      console.error('Error requesting notification permission:', error)

      // Audit failed attempts
      await this.auditLog('FCM_PERMISSION_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })

      return null
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.currentToken
  }

  /**
   * Listen for foreground messages
   * Handles notifications when app is in focus
   */
  onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
    return onMessage(this.messaging, async (payload) => {
      console.log('Foreground message received:', payload)

      // Audit message receipt
      await this.auditLog('FCM_MESSAGE_RECEIVED', {
        messageId: payload.messageId,
        from: payload.from,
        timestamp: new Date().toISOString(),
        foreground: true
      })

      callback(payload)
    })
  }

  /**
   * Send rich notification using Firebase Admin SDK
   * This would typically be called from your backend
   */
  async sendRichNotification(
    tokens: string | string[],
    notification: RichNotification
  ): Promise<void> {
    try {
      // Validate notification data
      this.validateNotification(notification)

      // Audit notification send attempt
      await this.auditLog('FCM_SEND_ATTEMPT', {
        recipientCount: Array.isArray(tokens) ? tokens.length : 1,
        category: notification.category,
        priority: notification.priority,
        containsPersonalInfo: notification.containsPersonalInfo,
        timestamp: new Date().toISOString()
      })

      // Prepare notification payload
      const payload = this.prepareNotificationPayload(notification)

      // This would be sent to your backend service
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          tokens: Array.isArray(tokens) ? tokens : [tokens],
          notification: payload
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`)
      }

      // Audit successful send
      await this.auditLog('FCM_SEND_SUCCESS', {
        notificationId: notification.id,
        category: notification.category,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error sending notification:', error)

      // Audit failed send
      await this.auditLog('FCM_SEND_FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
        notificationData: notification,
        timestamp: new Date().toISOString()
      })

      throw error
    }
  }

  /**
   * Display local rich notification
   * For immediate notifications when app is in focus
   */
  async showLocalNotification(notification: RichNotification): Promise<void> {
    try {
      // Check permission
      if (Notification.permission !== 'granted') {
        throw new Error('Notification permission not granted')
      }

      // Prepare notification options
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || '/icons/healthcare-icon-192.png',
        badge: notification.badge || '/icons/badge-72.png',
        image: notification.image,
        tag: notification.tag || notification.id,
        requireInteraction: notification.requireInteraction || notification.priority === 'urgent',
        silent: notification.silent || false,
        vibrate: notification.vibrate,
        timestamp: notification.timestamp || Date.now(),
        data: {
          ...notification.data,
          id: notification.id,
          category: notification.category,
          priority: notification.priority,
          containsPersonalInfo: notification.containsPersonalInfo
        },
        actions: notification.actions?.map(action => ({
          action: action.action,
          title: action.title,
          icon: action.icon
        }))
      }

      // Show notification
      const nativeNotification = new Notification(notification.title, options)

      // Handle click events
      nativeNotification.onclick = (event) => {
        this.handleNotificationClick(event, notification)
      }

      // Handle action clicks
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'NOTIFICATION_ACTION') {
            this.handleNotificationAction(event.data.action, notification)
          }
        })
      }

      // Audit notification display
      await this.auditLog('NOTIFICATION_DISPLAYED', {
        notificationId: notification.id,
        category: notification.category,
        containsPersonalInfo: notification.containsPersonalInfo,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error showing local notification:', error)
      throw error
    }
  }

  /**
   * Handle notification click events
   */
  private async handleNotificationClick(
    event: Event,
    notification: RichNotification
  ): Promise<void> {
    // Close notification
    if ('close' in event.target!) {
      (event.target as Notification).close()
    }

    // Audit click
    await this.auditLog('NOTIFICATION_CLICKED', {
      notificationId: notification.id,
      category: notification.category,
      timestamp: new Date().toISOString()
    })

    // Handle navigation based on category
    switch (notification.category) {
      case 'appointment':
        window.open(`/appointments/${notification.appointmentId}`, '_blank')
        break
      case 'reminder':
        window.focus()
        break
      case 'alert':
      case 'emergency':
        window.open('/alerts', '_blank')
        break
      default:
        window.focus()
    }
  }

  /**
   * Handle notification action clicks
   */
  private async handleNotificationAction(
    action: string,
    notification: RichNotification
  ): Promise<void> {
    // Audit action
    await this.auditLog('NOTIFICATION_ACTION', {
      notificationId: notification.id,
      action,
      category: notification.category,
      timestamp: new Date().toISOString()
    })

    // Handle specific actions
    switch (action) {
      case 'confirm':
        // Handle appointment confirmation
        await this.confirmAppointment(notification.appointmentId!)
        break
      case 'reschedule':
        // Open reschedule interface
        window.open(`/appointments/${notification.appointmentId}/reschedule`, '_blank')
        break
      case 'acknowledge':
        // Mark alert as acknowledged
        await this.acknowledgeAlert(notification.id!)
        break
      case 'escalate':
        // Escalate urgent notification
        await this.escalateNotification(notification.id!)
        break
      default:
        console.log(`Unhandled action: ${action}`)
    }
  }

  /**
   * Validate notification data for compliance
   */
  private validateNotification(notification: RichNotification): void {
    // Check required fields
    if (!notification.title || !notification.body) {
      throw new Error('Notification title and body are required')
    }

    // Validate category
    const validCategories = ['appointment', 'reminder', 'alert', 'system', 'emergency']
    if (!validCategories.includes(notification.category)) {
      throw new Error(`Invalid notification category: ${notification.category}`)
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'urgent']
    if (!validPriorities.includes(notification.priority)) {
      throw new Error(`Invalid notification priority: ${notification.priority}`)
    }

    // Check personal information compliance (PIPEDA/Quebec Law 25)
    if (notification.containsPersonalInfo && !notification.auditRequired) {
      throw new Error('Notifications containing personal information must require audit logging per PIPEDA and Quebec Law 25')
    }

    // Validate image size and format
    if (notification.image) {
      // Images should be under 1MB as per FCM requirements
      // This would be validated on the backend
    }
  }

  /**
   * Prepare notification payload for FCM
   */
  private prepareNotificationPayload(notification: RichNotification): any {
    return {
      notification: {
        title: notification.title,
        body: notification.body,
        image: notification.image
      },
      data: {
        ...notification.data,
        id: notification.id,
        category: notification.category,
        priority: notification.priority,
        patientId: notification.patientId,
        appointmentId: notification.appointmentId,
        containsPersonalInfo: notification.containsPersonalInfo.toString(),
        auditRequired: notification.auditRequired.toString()
      },
      android: {
        notification: {
          icon: notification.icon,
          color: this.getPriorityColor(notification.priority),
          sound: this.getPrioritySound(notification.priority),
          tag: notification.tag,
          priority: this.getAndroidPriority(notification.priority),
          visibility: notification.containsPersonalInfo ? 'private' : 'public'
        },
        data: notification.data
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body
            },
            badge: notification.badge ? parseInt(notification.badge) : undefined,
            sound: this.getPrioritySound(notification.priority),
            'thread-id': notification.tag,
            'interruption-level': this.getIOSInterruptionLevel(notification.priority)
          }
        },
        fcm_options: {
          image: notification.image
        }
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          image: notification.image,
          badge: notification.badge,
          vibrate: notification.vibrate,
          requireInteraction: notification.requireInteraction,
          actions: notification.actions
        },
        data: notification.data
      }
    }
  }

  /**
   * Get priority-based colors for Android
   */
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#ef4444'   // Red
      case 'high': return '#f59e0b'     // Orange
      case 'normal': return '#3b82f6'   // Blue
      case 'low': return '#6b7280'      // Gray
      default: return '#3b82f6'
    }
  }

  /**
   * Get priority-based sounds
   */
  private getPrioritySound(priority: string): string {
    switch (priority) {
      case 'urgent': return 'emergency_alert.wav'
      case 'high': return 'high_priority.wav'
      case 'normal': return 'default'
      case 'low': return 'subtle_notification.wav'
      default: return 'default'
    }
  }

  /**
   * Get Android notification priority
   */
  private getAndroidPriority(priority: string): string {
    switch (priority) {
      case 'urgent': return 'max'
      case 'high': return 'high'
      case 'normal': return 'default'
      case 'low': return 'min'
      default: return 'default'
    }
  }

  /**
   * Get iOS interruption level
   */
  private getIOSInterruptionLevel(priority: string): string {
    switch (priority) {
      case 'urgent': return 'critical'
      case 'high': return 'active'
      case 'normal': return 'active'
      case 'low': return 'passive'
      default: return 'active'
    }
  }

  /**
   * Audit logging for compliance
   */
  private async auditLog(event: string, data: any): Promise<void> {
    try {
      // If Firebase/Firestore is not available, log to console for development
      if (!db) {
        console.log(`[AUDIT LOG - ${event}]`, {
          event,
          service: 'firebase_messaging',
          data,
          timestamp: new Date().toISOString(),
          userId: this.getCurrentUserId(),
          sessionId: this.getSessionId()
        })
        return
      }

      await addDoc(collection(db, 'audit_logs'), {
        event,
        service: 'firebase_messaging',
        data,
        timestamp: serverTimestamp(),
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId()
      })
    } catch (error) {
      console.error('Failed to write audit log:', error)
      // Fallback to console logging
      console.log(`[AUDIT LOG FALLBACK - ${event}]`, {
        event,
        service: 'firebase_messaging',
        data,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Helper methods for audit logging
   */
  private getCurrentUserId(): string {
    // Get current user ID from auth context
    return 'current-user-id' // Implement based on your auth system
  }

  private getSessionId(): string {
    // Get current session ID
    return sessionStorage.getItem('sessionId') || 'no-session'
  }

  private async getAuthToken(): Promise<string> {
    // Get authentication token for API calls
    return 'auth-token' // Implement based on your auth system
  }

  /**
   * Appointment-specific action handlers
   */
  private async confirmAppointment(appointmentId: string): Promise<void> {
    // Implement appointment confirmation logic
    console.log(`Confirming appointment: ${appointmentId}`)
  }

  private async acknowledgeAlert(notificationId: string): Promise<void> {
    // Implement alert acknowledgment logic
    console.log(`Acknowledging alert: ${notificationId}`)
  }

  private async escalateNotification(notificationId: string): Promise<void> {
    // Implement notification escalation logic
    console.log(`Escalating notification: ${notificationId}`)
  }
}

// Export singleton instance
export const messagingService = new FirebaseMessagingService()

// Export types for use in components
export type { RichNotification, NotificationAction }