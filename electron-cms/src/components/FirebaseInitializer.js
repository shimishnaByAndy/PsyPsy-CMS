/**
 * Firebase Initializer Component
 * 
 * Initializes Firebase services and manages authentication state
 * Replaces ParseInitializer component
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import firebaseAuthService from '../services/firebaseAuthService';

// Loading component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid #899581',
      borderTop: '3px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }} />
    <p style={{ color: '#666', fontSize: '16px' }}>
      Initializing PsyPsy CMS...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const FirebaseInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeFirebase = async () => {
      try {
        console.log('🔧 Initializing Firebase services...');

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              console.log('✅ User authenticated:', firebaseUser.email);
              
              // Get user profile from Firestore
              try {
                const userProfile = await firebaseAuthService.getUserProfile(firebaseUser.uid);
                setUser({ ...firebaseUser, profile: userProfile });
              } catch (profileError) {
                console.warn('⚠️ Could not load user profile:', profileError.message);
                setUser(firebaseUser);
              }
            } else {
              console.log('👤 No authenticated user');
              setUser(null);
            }
          } catch (authError) {
            console.error('❌ Auth state change error:', authError);
            setError(authError.message);
          }
        });

        // Initialize offline persistence
        if ('serviceWorker' in navigator) {
          try {
            console.log('📱 Setting up offline support...');
            // Service worker setup would go here if needed
          } catch (swError) {
            console.warn('⚠️ Service worker registration failed:', swError);
          }
        }

        // Check for remember me state
        const rememberMe = localStorage.getItem('psypsy_remember_me') === 'true';
        if (rememberMe) {
          console.log('🔐 Remember me enabled');
        }

        if (mounted) {
          setIsInitialized(true);
          console.log('🚀 Firebase initialized successfully');
        }

        // Return cleanup function
        return unsubscribe;
      } catch (initError) {
        console.error('❌ Firebase initialization error:', initError);
        if (mounted) {
          setError(initError.message);
          setIsInitialized(true); // Still allow app to load
        }
      }
    };

    // Initialize Firebase
    let cleanup;
    initializeFirebase().then(unsubscribeFn => {
      cleanup = unsubscribeFn;
    });

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Show error if initialization failed
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#c62828', marginBottom: '16px' }}>
            Initialization Error
          </h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#899581',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Firebase is initialized, render children
  return children;
};

export default FirebaseInitializer;