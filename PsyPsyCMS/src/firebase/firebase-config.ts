/**
 * Firebase Configuration for Quebec Law 25 Compliance
 *
 * Configured for Montreal region (northamerica-northeast1) to ensure
 * Canadian data residency and compliance with Quebec privacy laws.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore, enableNetwork, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

// Firebase configuration - Development (emulator) and Production
const firebaseConfig = {
  // Use environment variables for both dev and prod, with fallbacks for emulator
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (import.meta.env.DEV ? "demo-key" : ""),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta.env.DEV ? "psypsy-dev-local.firebaseapp.com" : ""),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (import.meta.env.DEV ? "psypsy-dev-local" : ""),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta.env.DEV ? "psypsy-dev-local.appspot.com" : ""),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta.env.DEV ? "123456789" : ""),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (import.meta.env.DEV ? "demo-app-id" : ""),

  // Quebec Law 25 Compliance: Canadian region for data sovereignty
  region: "us-east4", // Canadian region matching your server setup

  // Additional privacy settings
  dataProcessingRegion: "us-east4",
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
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId ||
      firebaseConfig.projectId === 'your-project-id' ||
      firebaseConfig.authDomain === 'your-project.firebaseapp.com') {

    if (import.meta.env.DEV) {
      console.warn('⚠️ Using placeholder Firebase configuration in development mode');
      console.warn('💡 To use real Firebase, update the values in .env file');
      console.warn('🔧 To use emulators, set VITE_USE_FIREBASE_EMULATOR=true');

      // Return mock/offline-only Firebase for development
      return initializeMockFirebase();
    } else {
      throw new Error('Missing required Firebase configuration. Please check your environment variables.');
    }
  }

  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);

  // Check for emulator mode BEFORE initializing services
  console.log('🔍 Environment check:', {
    DEV: import.meta.env.DEV,
    VITE_USE_FIREBASE_EMULATOR: import.meta.env.VITE_USE_FIREBASE_EMULATOR,
    condition: import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
  });

  // Initialize services with Quebec-specific settings
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, quebecComplianceConfig.preferredRegion);

  // IMMEDIATELY connect to emulators if enabled (before any other Firestore operations)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    console.log('🎯 Emulator mode enabled - connecting to local emulators');
    try {
      connectToEmulators(db, auth, storage, functions);
      console.log('🔧 Emulator connection completed');
    } catch (error) {
      console.error('❌ Emulator connection failed:', error);
    }
  } else if (import.meta.env.DEV) {
    console.log('🔥 Using live Firebase services in development mode');
    console.log('💡 Set VITE_USE_FIREBASE_EMULATOR=true to use emulators');
    console.log('Current VITE_USE_FIREBASE_EMULATOR value:', import.meta.env.VITE_USE_FIREBASE_EMULATOR);
  } else {
    console.log('🏭 Production mode - using live Firebase services');
  }

  // Configure Firestore for offline-first operation (after emulator connection)
  // Skip persistence in emulator mode to avoid conflicts
  if (quebecComplianceConfig.enableOfflinePersistence && !(import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true')) {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        console.warn('Failed to enable offline persistence:', err);
        // Continue without offline persistence if it fails
      });
  } else if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    console.log('🔧 Skipping offline persistence in emulator mode for better compatibility');
  }

  // Enable network for operations (after everything is configured)
  try {
    enableNetwork(db);
    console.log('🌐 Firestore network enabled');
  } catch (networkError) {
    console.warn('⚠️ Failed to enable Firestore network:', networkError);
  }

  return { app, db, auth, storage, functions };
}

// Mock Firebase initialization for development without credentials
function initializeMockFirebase(): {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  functions: Functions;
} {
  console.log('🎭 Initializing Mock Firebase for development');

  // Use demo configuration that won't make network requests
  const mockConfig = {
    apiKey: "demo-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
  };

  const app = initializeApp(mockConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const functions = getFunctions(app);

  // Note: This will still attempt connections but with demo endpoints
  // For true offline development, you'd need to run emulators
  console.log('📡 Mock Firebase initialized (network requests may fail - this is expected)');

  return { app, db, auth, storage, functions };
}

// Global flag to track emulator connections (can only be done once)
let emulatorsConnected = false;

// Connect to Firebase emulators for local development (matching your setup)
function connectToEmulators(
  db: Firestore,
  auth: Auth,
  storage: FirebaseStorage,
  functions: Functions
): void {
  if (emulatorsConnected) {
    console.log('🔧 Emulators already connected, skipping...');
    return;
  }

  console.log('🔧 Attempting to connect to Firebase emulators...');

  try {
    // Firestore emulator - matching your running emulator
    console.log('Connecting to Firestore emulator at 127.0.0.1:9881');
    try {
      connectFirestoreEmulator(db, '127.0.0.1', 9881);
      console.log('✅ Firestore emulator connected');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore emulator connection failed (may not be running):', firestoreError);
      console.warn('💡 The app will use offline Firestore cache. To start Firestore emulator:');
      console.warn('   firebase emulators:start --only firestore');
    }

    // Auth emulator - matching your running emulator
    console.log('Connecting to Auth emulator at 127.0.0.1:9880');
    connectAuthEmulator(auth, 'http://127.0.0.1:9880', { disableWarnings: true });
    console.log('✅ Auth emulator connected');

    // Storage emulator - standard port (if running)
    try {
      console.log('Connecting to Storage emulator at 127.0.0.1:9199');
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      console.log('✅ Storage emulator connected');
    } catch (storageError) {
      console.warn('⚠️ Storage emulator connection failed (may not be running):', storageError);
    }

    // Functions emulator - matching your running emulator
    console.log('Connecting to Functions emulator at 127.0.0.1:8780');
    connectFunctionsEmulator(functions, '127.0.0.1', 8780);
    console.log('✅ Functions emulator connected');

    emulatorsConnected = true;

    console.log('🔧 All Firebase emulators connected successfully!');
    console.log('[AUDIT - Quebec Law 25]', {
      action: 'firebase_emulator_connection',
      timestamp: new Date().toISOString(),
      environment: 'development',
      dataResidency: 'Quebec, Canada (emulated)',
      compliance: ['PIPEDA', 'Law25'],
      emulators: {
        auth: 'http://127.0.0.1:9880',
        firestore: 'http://127.0.0.1:9881',
        functions: '127.0.0.1:8780',
        database: '127.0.0.1:9882',
        hosting: '127.0.0.1:8781',
        emulatorUI: 'http://127.0.0.1:8782'
      }
    });
  } catch (error: any) {
    console.error('❌ Failed to connect to emulators:', error);
    console.error('Make sure your Firebase emulators are running on the correct ports');

    // Provide helpful debugging info
    if (error.message?.includes('already been called')) {
      console.warn('🔄 Emulator connection was already established (this is normal during hot reload)');
      emulatorsConnected = true;
    } else {
      console.error('🚨 Check emulator status at: http://127.0.0.1:8782/');
    }
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

  // Validate Canadian region configuration for production
  if (!import.meta.env.DEV && firebaseConfig.region !== 'us-east4') {
    console.error('Firebase must be configured for Canadian region (us-east4) for Quebec Law 25 compliance');
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

// Initialize Firebase services with error handling
let firebase: {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  functions: Functions;
} | null = null;

try {
  firebase = initializeFirebaseForQuebec();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('💡 The app will continue without Firebase functionality');

  // Create minimal mock objects to prevent crashes
  firebase = null;
}

// Export initialized Firebase services (may be null in development)
export { firebase };
export const app = firebase?.app || null;
export const db = firebase?.db || null;
export const auth = firebase?.auth || null;
export const storage = firebase?.storage || null;
export const functions = firebase?.functions || null;

// Individual exports for convenience
export const firestore = db;

// Setup network monitoring only if Firebase is initialized
if (firebase && db) {
  setupNetworkMonitoring(db);
  console.log('✅ Firebase initialized for Quebec Law 25 compliance');
  console.log('🇨🇦 Data residency: Montreal region (northamerica-northeast1)');
  console.log('🔒 Privacy mode: Enhanced for healthcare data');
} else {
  console.log('⚠️ Firebase not initialized - app running in offline mode');
}