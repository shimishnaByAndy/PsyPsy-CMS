/**
 * Firebase Firestore Real-time Updates Service
 *
 * Handles real-time data synchronization with WebSocket configuration support
 * Updated to support dynamic WebSocket port configuration (9150 for new emulator setup)
 */

import React from 'react'
import {
  onSnapshot,
  doc,
  collection,
  query,
  DocumentReference,
  CollectionReference,
  Query,
  FirestoreError,
  Unsubscribe
} from 'firebase/firestore'
import { db } from '@/firebase/firebase-config'

export interface RealtimeConnectionConfig {
  websocketPort?: string
  enableLogging?: boolean
  retryAttempts?: number
  retryDelay?: number
}

export interface RealtimeListenerOptions {
  onError?: (error: FirestoreError) => void
  includeMetadataChanges?: boolean
  enableAuditLogging?: boolean
}

/**
 * Enhanced real-time listener with WebSocket port awareness
 */
export class FirebaseRealtimeService {
  private config: Required<RealtimeConnectionConfig>
  private activeListeners: Map<string, Unsubscribe> = new Map()

  constructor(config: RealtimeConnectionConfig = {}) {
    this.config = {
      websocketPort: config.websocketPort || import.meta.env.VITE_FIREBASE_WEBSOCKET_PORT || '9150',
      enableLogging: config.enableLogging ?? true,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000
    }

    if (this.config.enableLogging) {
      console.log('🔌 Firebase Realtime Service initialized:', {
        websocketPort: this.config.websocketPort,
        environment: import.meta.env.DEV ? 'development' : 'production',
        usingEmulator: import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
      })
    }
  }

  /**
   * Subscribe to document changes with audit logging
   */
  subscribeToDocument<T = any>(
    docRef: DocumentReference,
    onNext: (data: T | null) => void,
    options: RealtimeListenerOptions = {}
  ): Unsubscribe {
    const listenerId = `doc_${docRef.path}_${Date.now()}`

    if (this.config.enableLogging) {
      console.log('📡 Setting up real-time document listener:', {
        docPath: docRef.path,
        listenerId,
        websocketPort: this.config.websocketPort
      })
    }

    const unsubscribe = onSnapshot(
      docRef,
      {
        includeMetadataChanges: options.includeMetadataChanges ?? false
      },
      (snapshot) => {
        try {
          const data = snapshot.exists() ? snapshot.data() as T : null

          if (options.enableAuditLogging) {
            console.log('[AUDIT - Quebec Law 25]', {
              action: 'realtime_document_access',
              timestamp: new Date().toISOString(),
              docPath: docRef.path,
              dataExists: snapshot.exists(),
              fromCache: snapshot.metadata.fromCache,
              websocketConnection: `ws://127.0.0.1:${this.config.websocketPort}`
            })
          }

          onNext(data)
        } catch (error) {
          console.error('❌ Error processing real-time document update:', error)
          if (options.onError) {
            options.onError(error as FirestoreError)
          }
        }
      },
      (error) => {
        console.error('❌ Real-time document listener error:', error)
        if (options.onError) {
          options.onError(error)
        }
      }
    )

    this.activeListeners.set(listenerId, unsubscribe)
    return () => {
      unsubscribe()
      this.activeListeners.delete(listenerId)

      if (this.config.enableLogging) {
        console.log('🔌 Real-time document listener unsubscribed:', listenerId)
      }
    }
  }

  /**
   * Subscribe to collection changes with audit logging
   */
  subscribeToCollection<T = any>(
    queryRef: CollectionReference | Query,
    onNext: (data: T[]) => void,
    options: RealtimeListenerOptions = {}
  ): Unsubscribe {
    const listenerId = `collection_${Date.now()}`

    if (this.config.enableLogging) {
      console.log('📡 Setting up real-time collection listener:', {
        collectionPath: 'path' in queryRef ? queryRef.path : 'query',
        listenerId,
        websocketPort: this.config.websocketPort
      })
    }

    const unsubscribe = onSnapshot(
      queryRef,
      {
        includeMetadataChanges: options.includeMetadataChanges ?? false
      },
      (snapshot) => {
        try {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[]

          if (options.enableAuditLogging) {
            console.log('[AUDIT - Quebec Law 25]', {
              action: 'realtime_collection_access',
              timestamp: new Date().toISOString(),
              collectionPath: 'path' in queryRef ? queryRef.path : 'query',
              documentCount: data.length,
              fromCache: snapshot.metadata.fromCache,
              websocketConnection: `ws://127.0.0.1:${this.config.websocketPort}`
            })
          }

          onNext(data)
        } catch (error) {
          console.error('❌ Error processing real-time collection update:', error)
          if (options.onError) {
            options.onError(error as FirestoreError)
          }
        }
      },
      (error) => {
        console.error('❌ Real-time collection listener error:', error)
        if (options.onError) {
          options.onError(error)
        }
      }
    )

    this.activeListeners.set(listenerId, unsubscribe)
    return () => {
      unsubscribe()
      this.activeListeners.delete(listenerId)

      if (this.config.enableLogging) {
        console.log('🔌 Real-time collection listener unsubscribed:', listenerId)
      }
    }
  }

  /**
   * Update WebSocket port configuration
   */
  updateWebSocketPort(newPort: string): void {
    const oldPort = this.config.websocketPort
    this.config.websocketPort = newPort

    console.log('🔄 WebSocket port updated:', {
      oldPort,
      newPort,
      activeListeners: this.activeListeners.size
    })

    // Log audit event for port change
    console.log('[AUDIT - Quebec Law 25]', {
      action: 'websocket_port_updated',
      timestamp: new Date().toISOString(),
      oldPort,
      newPort,
      activeListeners: this.activeListeners.size,
      environment: import.meta.env.DEV ? 'development' : 'production'
    })
  }

  /**
   * Get current WebSocket configuration
   */
  getWebSocketConfig(): { port: string; endpoint: string; activeListeners: number } {
    return {
      port: this.config.websocketPort,
      endpoint: `ws://127.0.0.1:${this.config.websocketPort}`,
      activeListeners: this.activeListeners.size
    }
  }

  /**
   * Cleanup all active listeners
   */
  cleanup(): void {
    this.activeListeners.forEach((unsubscribe, listenerId) => {
      unsubscribe()
      if (this.config.enableLogging) {
        console.log('🧹 Cleaned up listener:', listenerId)
      }
    })

    this.activeListeners.clear()

    console.log('[AUDIT - Quebec Law 25]', {
      action: 'realtime_service_cleanup',
      timestamp: new Date().toISOString(),
      cleanedListeners: this.activeListeners.size
    })
  }
}

// Export singleton instance
export const realtimeService = new FirebaseRealtimeService()

// Export convenience functions for backward compatibility
export const subscribeToDocument = realtimeService.subscribeToDocument.bind(realtimeService)
export const subscribeToCollection = realtimeService.subscribeToCollection.bind(realtimeService)

// React hook for real-time document data
export function useRealtimeDocument<T = any>(
  docRef: DocumentReference | null,
  options: RealtimeListenerOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<FirestoreError | null>(null)

  React.useEffect(() => {
    if (!docRef) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = realtimeService.subscribeToDocument<T>(
      docRef,
      (newData) => {
        setData(newData)
        setLoading(false)
      },
      {
        ...options,
        onError: (err) => {
          setError(err)
          setLoading(false)
          if (options.onError) {
            options.onError(err)
          }
        }
      }
    )

    return unsubscribe
  }, [docRef])

  return { data, loading, error }
}

// React hook for real-time collection data
export function useRealtimeCollection<T = any>(
  queryRef: CollectionReference | Query | null,
  options: RealtimeListenerOptions = {}
) {
  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<FirestoreError | null>(null)

  React.useEffect(() => {
    if (!queryRef) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = realtimeService.subscribeToCollection<T>(
      queryRef,
      (newData) => {
        setData(newData)
        setLoading(false)
      },
      {
        ...options,
        onError: (err) => {
          setError(err)
          setLoading(false)
          if (options.onError) {
            options.onError(err)
          }
        }
      }
    )

    return unsubscribe
  }, [queryRef])

  return { data, loading, error }
}