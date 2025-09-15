/**
 * Firebase Authentication Service
 * 
 * Replaces Parse Server authentication with Firebase Auth
 * Provides user management, authentication, and session handling
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';

// User roles constants
export const USER_ROLES = {
  CLIENT: 'client',
  PROFESSIONAL: 'professional', 
  ADMIN: 'admin'
};

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = new Set();
    
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyListeners(user);
    });
  }

  /**
   * Register a new user with email and password
   */
  async register(userData) {
    try {
      const { email, password, role = USER_ROLES.CLIENT, ...profileData } = userData;
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update auth profile
      await updateProfile(user, {
        displayName: `${profileData.firstName} ${profileData.lastName}`,
      });
      
      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        role,
        profile: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone || null,
          avatar: null,
          language: profileData.language || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        account: {
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          emailVerified: user.emailVerified,
          phoneVerified: false
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          theme: 'light',
          language: profileData.language || 'en'
        }
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      
      // Create role-specific profile if needed
      if (role === USER_ROLES.CLIENT) {
        await this.createClientProfile(user.uid, profileData);
      } else if (role === USER_ROLES.PROFESSIONAL) {
        await this.createProfessionalProfile(user.uid, profileData);
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      return {
        user: user,
        profile: userDoc,
        message: 'User registered successfully. Please verify your email.'
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in user with email and password
   */
  async login(email, password, rememberMe = false) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        'account.lastLogin': serverTimestamp()
      });
      
      // Get user profile
      const userProfile = await this.getUserProfile(user.uid);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('psypsy_remember_me', 'true');
      } else {
        localStorage.removeItem('psypsy_remember_me');
      }
      
      return {
        user,
        profile: userProfile
      };
      
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('psypsy_remember_me');
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user profile from Firestore
   */
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid || this.currentUser?.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid || this.currentUser?.uid);
      
      const updateData = {
        ...updates,
        'account.updatedAt': serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      
      return await this.getUserProfile(uid);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user email
   */
  async updateUserEmail(newEmail) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      await updateEmail(user, newEmail);
      
      // Update in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        email: newEmail,
        'account.updatedAt': serverTimestamp(),
        'account.emailVerified': false
      });
      
      // Send verification email
      await sendEmailVerification(user);
      
      return { message: 'Email updated. Please verify your new email.' };
    } catch (error) {
      console.error('Update email error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      await updatePassword(user, newPassword);
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update password error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create client profile subcollection
   */
  async createClientProfile(uid, profileData) {
    const clientProfile = {
      personalInfo: {
        dateOfBirth: profileData.dateOfBirth || null,
        gender: profileData.gender || null,
        address: profileData.address || {}
      },
      medicalInfo: {
        conditions: profileData.conditions || [],
        medications: profileData.medications || [],
        allergies: profileData.allergies || [],
        emergencyContact: profileData.emergencyContact || {}
      },
      preferences: {
        communicationStyle: profileData.communicationStyle || 'text',
        sessionFormat: profileData.sessionFormat || 'individual',
        specializations: profileData.specializations || []
      },
      status: {
        isActive: true,
        registrationComplete: false,
        documentsUploaded: false
      }
    };
    
    await setDoc(doc(db, 'users', uid, 'clientProfile', 'profile'), clientProfile);
  }

  /**
   * Create professional profile subcollection
   */
  async createProfessionalProfile(uid, profileData) {
    const professionalProfile = {
      credentials: {
        license: profileData.license || {},
        education: profileData.education || [],
        certifications: profileData.certifications || []
      },
      practice: {
        specializations: profileData.specializations || [],
        approaches: profileData.approaches || [],
        languages: profileData.languages || ['en'],
        experience: profileData.experience || {}
      },
      availability: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        workingHours: profileData.workingHours || {},
        bookingSettings: {
          advanceBooking: 24,
          cancellationPolicy: 24,
          sessionDuration: 50
        }
      },
      verification: {
        status: 'pending',
        documents: [],
        verifiedBy: null,
        verifiedAt: null
      }
    };
    
    await setDoc(doc(db, 'users', uid, 'professionalProfile', 'profile'), professionalProfile);
  }

  /**
   * Delete user account
   */
  async deleteAccount(uid) {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== uid) {
        throw new Error('Cannot delete account: user not authenticated');
      }
      
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', uid));
      
      // Delete Firebase Auth user
      await deleteUser(user);
      
      return { message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete account error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Add auth state listener
   */
  addAuthStateListener(callback) {
    this.authListeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.authListeners.delete(callback);
    };
  }

  /**
   * Notify all auth state listeners
   */
  notifyListeners(user) {
    this.authListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  /**
   * Handle Firebase auth errors
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'User not found. Please check your email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'Email address is already registered.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/requires-recent-login': 'Please log in again to complete this action.'
    };
    
    return new Error(errorMessages[error.code] || error.message);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role) {
    if (!this.currentUser) return false;
    
    try {
      const profile = await this.getUserProfile();
      return profile.role === role;
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new FirebaseAuthService();