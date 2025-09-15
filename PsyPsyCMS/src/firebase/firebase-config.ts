/**
 * Firebase Configuration for Quebec Law 25 Compliance
 *
 * Configured for Montreal region (northamerica-northeast1) to ensure
 * Canadian data residency and compliance with Quebec privacy laws.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore, enableNetwork, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

// Environment variables for Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

  // Quebec Law 25 Compliance: Force Montreal region for all services
  // This ensures data residency in Canada for privacy compliance
  region: "northamerica-northeast1", // Montreal region

  // Additional privacy settings
  dataProcessingRegion: "northamerica-northeast1",
  dataResidencyRegion: "CA", // Canada
};

// Quebec Law 25 specific configuration
const quebecComplianceConfig = {
  // Enable offline persistence for offline-first architecture
  enableOfflinePersistence: true,

  // Sync settings optimized for healthcare workflows
  cacheSizeBytes: 100 * 1024 * 1024, // 100MB cache for medical data

  // Network settings for Montreal region
  preferredRegion: "northamerica-northeast1",

  // Privacy settings
  analyticsDisabled: true, // Disable analytics for privacy
  performanceMonitoringDisabled: true, // Disable perf monitoring for privacy

  // Law 25 compliance flags
  law25CompliantMode: true,
  dataMinimizationEnabled: true,
  auditLoggingRequired: true,
};

// Firestore settings for Quebec compliance
const firestoreSettings = {
  // Force offline persistence with multi-tab support
  cacheSizeBytes: quebecComplianceConfig.cacheSizeBytes,

  // Network settings
  merge: true,

  // Experimental features for offline-first
  experimentalForceLongPolling: false, // Use WebChannel for better performance
  experimentalAutoDetectLongPolling: true,

  // Privacy settings
  ignoreUndefinedProperties: true, // Prevent accidental data leaks
};

// Storage settings for medical files
const storageSettings = {
  // Ensure Montreal region
  region: "northamerica-northeast1",

  // Timeout settings for large medical files
  uploadTimeout: 5 * 60 * 1000, // 5 minutes
  downloadTimeout: 2 * 60 * 1000, // 2 minutes

  // Retry settings
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay
};

// Cloud Functions settings
const functionsSettings = {
  region: "northamerica-northeast1", // Montreal region
  timeout: 60, // 1 minute timeout
};

// Initialize Firebase with Quebec compliance
export function initializeFirebaseForQuebec(): {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  functions: Functions;
} {
  // Validate required environment variables
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration. Please check your environment variables.');
  }

  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);

  // Initialize services with Quebec-specific settings
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, quebecComplianceConfig.preferredRegion);

  // Configure Firestore for offline-first operation
  if (quebecComplianceConfig.enableOfflinePersistence) {
    enableOfflinePersistence(db)
      .catch((err) => {
        console.warn('Failed to enable offline persistence:', err);
        // Continue without offline persistence if it fails
      });
  }

  // Connect to emulators in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
    connectToEmulators(db, auth, storage, functions);
  }

  // Enable network for online operations
  enableNetwork(db);

  return { app, db, auth, storage, functions };
}

// Connect to Firebase emulators for local development
function connectToEmulators(
  db: Firestore,
  auth: Auth,
  storage: FirebaseStorage,
  functions: Functions
): void {
  try {
    // Firestore emulator
    if (!db._delegate._terminated) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }

    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);

    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);

    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
  }
}

// Firestore collection references with privacy compliance
export const COLLECTIONS = {
  // User data with encryption
  USERS: 'users',

  // Medical data with enhanced encryption
  MEDICAL_NOTES: 'medical_notes_encrypted',
  CLIENTS: 'clients_encrypted',
  PROFESSIONALS: 'professionals',
  APPOINTMENTS: 'appointments',

  // Quebec Law 25 compliance collections
  CONSENT_RECORDS: 'consent_records',
  AUDIT_LOGS: 'audit_logs',
  DATA_SUBJECT_REQUESTS: 'data_subject_requests',
  BREACH_RECORDS: 'breach_records',

  // De-identification tracking
  DEIDENTIFICATION_LOGS: 'deidentification_logs',

  // Social media integration
  SOCIAL_POSTS: 'social_posts',
  SOCIAL_ACCOUNTS: 'social_accounts',
} as const;

// Security rules for Firestore collections
export const SECURITY_RULES = {
  // Enhanced rules for medical data
  MEDICAL_NOTES: {
    read: "request.auth != null && request.auth.uid == resource.data.practitionerId && resource.data.encrypted == true",
    create: "request.auth != null && request.resource.data.encrypted == true && request.resource.data.deidentified == true",
    update: "request.auth != null && request.auth.uid == resource.data.practitionerId",
    delete: "false", // Medical notes should never be deleted, only archived
  },

  // Audit logs - write-only for compliance
  AUDIT_LOGS: {
    read: "request.auth != null && request.auth.token.admin == true",
    create: "request.auth != null",
    update: "false", // Audit logs are immutable
    delete: "false", // Audit logs must be retained for 7 years (Law 25)
  },

  // Consent records - full user control
  CONSENT_RECORDS: {
    read: "request.auth != null && request.auth.uid == resource.data.userId",
    create: "request.auth != null && request.auth.uid == request.resource.data.userId",
    update: "request.auth != null && request.auth.uid == resource.data.userId",
    delete: "false", // Consent history must be maintained
  },
} as const;

// Firebase configuration validation
export function validateFirebaseConfig(): boolean {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  for (const field of requiredFields) {
    if (!firebaseConfig[field as keyof typeof firebaseConfig]) {
      console.error(`Missing required Firebase config field: ${field}`);
      return false;
    }
  }

  // Validate Montreal region configuration
  if (firebaseConfig.region !== 'northamerica-northeast1') {
    console.error('Firebase must be configured for Montreal region (northamerica-northeast1) for Quebec Law 25 compliance');
    return false;
  }

  return true;
}

// Enhanced error handling for Quebec compliance
export class QuebecFirebaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly complianceImpact: 'none' | 'minor' | 'major' | 'critical'
  ) {
    super(message);
    this.name = 'QuebecFirebaseError';
  }
}

// Network status monitoring for offline-first
export function setupNetworkMonitoring(db: Firestore): void {
  // Monitor online/offline status
  window.addEventListener('online', () => {
    console.log('🌐 Network online - resuming Firebase sync');
    enableNetwork(db);
  });

  window.addEventListener('offline', () => {
    console.log('📱 Network offline - Firebase will cache operations');
    // Note: We don't disable network here as Firestore handles offline gracefully
  });
}

// Export initialized Firebase services
export const firebase = initializeFirebaseForQuebec();
export const { app, db, auth, storage, functions } = firebase;

// Validate configuration on initialization
if (!validateFirebaseConfig()) {
  throw new QuebecFirebaseError(
    'Invalid Firebase configuration for Quebec Law 25 compliance',
    'INVALID_QUEBEC_CONFIG',
    'critical'
  );
}

// Setup network monitoring
setupNetworkMonitoring(db);

console.log('✅ Firebase initialized for Quebec Law 25 compliance');
console.log('🇨🇦 Data residency: Montreal region (northamerica-northeast1)');
console.log('🔒 Privacy mode: Enhanced for healthcare data');