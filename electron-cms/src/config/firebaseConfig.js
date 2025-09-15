/**
 * Firebase configuration for PsyPsy CMS
 * 
 * This file initializes Firebase services including:
 * - Firebase Auth for user authentication
 * - Firestore for real-time database operations
 * - Firebase Storage for file uploads
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence 
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration object
const firebaseConfig = {
  // Development configuration with emulators
  dev: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "psypsy-cms-dev.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "psypsy-cms-dev",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "psypsy-cms-dev.appspot.com",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:demo-app-id",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-DEMO123"
  },
  
  // Production configuration
  prod: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  }
};

// Get configuration based on environment
const config = process.env.NODE_ENV === 'production' 
  ? firebaseConfig.prod 
  : firebaseConfig.dev;

// Validate required configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !config[field]);

if (missingFields.length > 0) {
  console.error('Missing required Firebase configuration fields:', missingFields);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(config);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production and if supported)
export let analytics = null;
if (process.env.NODE_ENV === 'production') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Emulator setup for development
if (process.env.NODE_ENV === 'development') {
  const useEmulators = process.env.REACT_APP_USE_FIREBASE_EMULATORS !== 'false';
  
  if (useEmulators) {
    try {
      // Connect to Auth Emulator
      if (!auth._delegate._isInitialized) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      }
      
      // Connect to Firestore Emulator
      if (!db._delegate._databaseId.projectId.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      
      // Connect to Storage Emulator
      if (!storage._delegate._host.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      
      console.log('🔧 Firebase Emulators connected');
    } catch (error) {
      console.warn('Firebase emulators connection failed:', error.message);
    }
  }
}

// Enable offline persistence for Firestore
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

// Export configuration for debugging
export const firebaseConfigDebug = {
  projectId: config.projectId,
  authDomain: config.authDomain,
  environment: process.env.NODE_ENV,
  emulators: process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS !== 'false'
};

console.log('Firebase initialized:', firebaseConfigDebug);

export default app;