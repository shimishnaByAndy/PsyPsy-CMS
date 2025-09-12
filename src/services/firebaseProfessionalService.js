/**
 * Firebase Professional Service
 * 
 * Replaces Parse-based professional service with Firebase/Firestore operations
 * Manages professional profiles as subcollections under user documents
 */

import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit, 
  startAfter, 
  getDocs, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import FirestoreService from './firestoreService';
import firebaseAuthService from './firebaseAuthService';

// Professional types mapping
export const PROFESSIONAL_TYPES = {
  1: 'Psychologist',
  2: 'Social Worker', 
  3: 'Psychoeducator',
  4: 'Marriage and Family Therapist',
  5: 'Licensed Professional Counselor',
  6: 'Clinical Social Worker'
};

// Gender mapping
export const GENDER_TYPES = {
  1: 'Woman',
  2: 'Man',
  3: 'Other', 
  4: 'Not disclosed'
};

// Meeting types mapping
export const MEETING_TYPES = {
  1: 'In-person only',
  2: 'Online only',
  3: 'Both in-person and online'
};

class FirebaseProfessionalService extends FirestoreService {
  constructor() {
    super('users');
    this.subscriptions = new Map();
  }

  /**
   * Get professionals with filtering, pagination, and search
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated results with professional data
   */
  async getProfessionals({
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    filters = {},
    cursor = null
  } = {}) {
    try {
      console.log('FirebaseProfessionalService.getProfessionals called:', { 
        page, limit, search, sortBy, sortDirection, filters 
      });

      // Base query for users with role 'professional'
      let professionalQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professional'),
        where('isDeleted', '==', false)
      );

      // Apply search filters
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        
        // Search in multiple fields - Firestore doesn't support OR queries across fields easily
        // We'll need to get all professionals first, then filter client-side for complex searches
        // For now, we'll search by email as it's most commonly indexed
        professionalQuery = query(
          collection(db, 'users'),
          where('role', '==', 'professional'),
          where('isDeleted', '==', false),
          where('email', '>=', searchLower),
          where('email', '<=', searchLower + '\uf8ff')
        );
      }

      // Apply sorting
      if (sortBy && ['createdAt', 'updatedAt', 'email', 'displayName'].includes(sortBy)) {
        professionalQuery = query(
          professionalQuery,
          orderBy(sortBy, sortDirection)
        );
      } else {
        // Default sorting
        professionalQuery = query(
          professionalQuery,
          orderBy('createdAt', 'desc')
        );
      }

      // Apply cursor pagination if provided
      if (cursor) {
        professionalQuery = query(professionalQuery, startAfter(cursor));
      }

      // Apply limit
      professionalQuery = query(professionalQuery, firestoreLimit(limit));

      // Execute query
      const querySnapshot = await getDocs(professionalQuery);
      
      const professionals = [];
      const profilePromises = [];

      // Get user documents and prepare to fetch their professional profiles
      querySnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        
        // Get professional profile from subcollection
        const profilePromise = this.getProfessionalProfile(userDoc.id)
          .then(profileData => ({
            id: userDoc.id,
            uid: userDoc.id,
            ...userData,
            professionalProfile: profileData,
            // Legacy compatibility fields
            objectId: userDoc.id,
            userType: 3, // Professional type from Parse legacy
            professionalPtr: profileData
          }))
          .catch(error => {
            console.warn(`Failed to fetch profile for professional ${userDoc.id}:`, error);
            return {
              id: userDoc.id,
              uid: userDoc.id,
              ...userData,
              professionalProfile: null,
              objectId: userDoc.id,
              userType: 3,
              professionalPtr: null
            };
          });

        profilePromises.push(profilePromise);
      });

      // Wait for all profile fetches to complete
      const professionalResults = await Promise.all(profilePromises);

      // Apply client-side filtering for complex searches and filters
      let filteredResults = professionalResults;

      // Search filtering (client-side for complex searches)
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        filteredResults = filteredResults.filter(prof => {
          const profile = prof.professionalProfile;
          return (
            prof.email?.toLowerCase().includes(searchLower) ||
            prof.displayName?.toLowerCase().includes(searchLower) ||
            profile?.firstName?.toLowerCase().includes(searchLower) ||
            profile?.lastName?.toLowerCase().includes(searchLower) ||
            profile?.businessName?.toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply additional filters
      if (filters.profType && filters.profType !== 'all') {
        const profTypeNum = parseInt(filters.profType);
        filteredResults = filteredResults.filter(prof => 
          prof.professionalProfile?.profType === profTypeNum
        );
      }

      if (filters.gender && filters.gender !== 'all') {
        const genderNum = parseInt(filters.gender);
        filteredResults = filteredResults.filter(prof => 
          prof.professionalProfile?.gender === genderNum
        );
      }

      if (filters.meetType && filters.meetType !== 'all') {
        const meetTypeNum = parseInt(filters.meetType);
        filteredResults = filteredResults.filter(prof => 
          prof.professionalProfile?.meetType === meetTypeNum
        );
      }

      // Get total count (for pagination info)
      // Note: In a production environment, you might want to cache this or use a counter document
      const totalQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professional'),
        where('isDeleted', '==', false)
      );
      const totalSnapshot = await getDocs(totalQuery);
      const totalCount = totalSnapshot.size;

      // Calculate pagination info
      const startIndex = page * limit;
      const paginatedResults = filteredResults.slice(startIndex, startIndex + limit);
      
      return {
        results: paginatedResults,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: (page + 1) * limit < totalCount,
        hasPrevPage: page > 0,
        cursor: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
      };

    } catch (error) {
      console.error('Error fetching professionals:', error);
      throw new Error(`Failed to fetch professionals: ${error.message}`);
    }
  }

  /**
   * Get a professional profile from subcollection
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Professional profile data
   */
  async getProfessionalProfile(userId) {
    try {
      const profileDoc = await getDoc(doc(db, 'users', userId, 'professionalProfile', 'profile'));
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        return {
          ...profileData,
          // Add computed fields
          profTypeName: PROFESSIONAL_TYPES[profileData.profType] || 'Unknown',
          genderName: GENDER_TYPES[profileData.gender] || 'Unknown', 
          meetTypeName: MEETING_TYPES[profileData.meetType] || 'Unknown',
          age: profileData.dob ? this.calculateAge(profileData.dob.toDate()) : null,
          formattedPhone: this.formatPhoneNumber(profileData.phoneNb)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching professional profile for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get a single professional by ID
   * @param {string} professionalId - Professional user ID
   * @returns {Promise<Object>} Professional object with full details
   */
  async getProfessionalById(professionalId) {
    try {
      console.log('FirebaseProfessionalService.getProfessionalById called:', professionalId);

      // Check authentication
      const currentUser = firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Get user document
      const userDoc = await getDoc(doc(db, 'users', professionalId));
      
      if (!userDoc.exists()) {
        throw new Error(`Professional with ID ${professionalId} not found`);
      }

      const userData = userDoc.data();
      
      if (userData.role !== 'professional') {
        throw new Error(`User ${professionalId} is not a professional`);
      }

      // Get professional profile
      const profileData = await this.getProfessionalProfile(professionalId);

      return {
        id: userDoc.id,
        uid: userDoc.id,
        objectId: userDoc.id, // Legacy compatibility
        ...userData,
        professionalProfile: profileData,
        // Legacy compatibility fields
        userType: 3,
        professionalPtr: profileData,
        roleNames: ['professional']
      };

    } catch (error) {
      console.error(`Error fetching professional ${professionalId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update professional profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Professional profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfessionalProfile(userId, profileData) {
    try {
      console.log('Updating professional profile for user:', userId);

      // Check authentication
      const currentUser = firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Prepare profile data with timestamps
      const profileUpdate = {
        ...profileData,
        updatedAt: Timestamp.now(),
        updatedBy: currentUser.uid
      };

      // If creating new profile, add createdAt
      const profileRef = doc(db, 'users', userId, 'professionalProfile', 'profile');
      const existingProfile = await getDoc(profileRef);
      
      if (!existingProfile.exists()) {
        profileUpdate.createdAt = Timestamp.now();
        profileUpdate.createdBy = currentUser.uid;
      }

      // Update profile
      await updateDoc(profileRef, profileUpdate);

      // Update user document with basic info if provided
      const userUpdates = {};
      if (profileData.firstName || profileData.lastName) {
        userUpdates.displayName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
      }
      
      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updatedAt = Timestamp.now();
        await updateDoc(doc(db, 'users', userId), userUpdates);
      }

      // Return updated profile
      return await this.getProfessionalProfile(userId);

    } catch (error) {
      console.error('Error updating professional profile:', error);
      throw error;
    }
  }

  /**
   * Get professional statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Statistics object
   */
  async getProfessionalStats(filters = {}) {
    try {
      console.log('Fetching professional statistics with filters:', filters);

      // Base query for professionals
      let statsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professional'),
        where('isDeleted', '==', false)
      );

      const snapshot = await getDocs(statsQuery);
      
      const stats = {
        total: 0,
        newThisWeek: 0,
        newThisMonth: 0,
        newThisYear: 0,
        profTypeCounts: {},
        genderCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
        meetTypeCounts: { 1: 0, 2: 0, 3: 0 },
        verifiedCount: 0,
        averageRating: 0
      };

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      let totalRating = 0;
      let ratedProfessionals = 0;

      // Process each professional
      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        const createdAt = userData.createdAt?.toDate();

        stats.total++;

        // Time-based counts
        if (createdAt) {
          if (createdAt >= weekAgo) stats.newThisWeek++;
          if (createdAt >= monthAgo) stats.newThisMonth++;
          if (createdAt >= yearAgo) stats.newThisYear++;
        }

        // Get professional profile for detailed stats
        try {
          const profileData = await this.getProfessionalProfile(userDoc.id);
          if (profileData) {
            // Professional type counts
            const profType = profileData.profType;
            if (profType) {
              stats.profTypeCounts[profType] = (stats.profTypeCounts[profType] || 0) + 1;
            }

            // Gender counts
            const gender = profileData.gender;
            if (gender && stats.genderCounts[gender] !== undefined) {
              stats.genderCounts[gender]++;
            }

            // Meeting type counts
            const meetType = profileData.meetType;
            if (meetType && stats.meetTypeCounts[meetType] !== undefined) {
              stats.meetTypeCounts[meetType]++;
            }

            // Verification count
            if (profileData.isVerified) {
              stats.verifiedCount++;
            }

            // Rating calculation
            if (profileData.rating && profileData.rating > 0) {
              totalRating += profileData.rating;
              ratedProfessionals++;
            }
          }
        } catch (profileError) {
          console.warn(`Failed to fetch profile for professional stats ${userDoc.id}:`, profileError);
        }
      }

      // Calculate average rating
      if (ratedProfessionals > 0) {
        stats.averageRating = Math.round((totalRating / ratedProfessionals) * 100) / 100;
      }

      return stats;

    } catch (error) {
      console.error('Error fetching professional statistics:', error);
      throw error;
    }
  }

  /**
   * Search professionals with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Array of matching professionals
   */
  async searchProfessionals(searchParams = {}) {
    try {
      const {
        searchTerm,
        profTypes = [],
        genders = [],
        meetTypes = [],
        languages = [],
        expertises = [],
        location,
        radius,
        isVerified,
        minRating,
        limit = 20
      } = searchParams;

      console.log('Searching professionals with params:', searchParams);

      // Get all professionals first (in production, consider using Algolia or similar for complex search)
      const { results } = await this.getProfessionals({ limit: 500 }); // Get larger set for filtering

      let filteredResults = results;

      // Apply filters
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredResults = filteredResults.filter(prof => {
          const profile = prof.professionalProfile;
          return (
            prof.email?.toLowerCase().includes(term) ||
            prof.displayName?.toLowerCase().includes(term) ||
            profile?.firstName?.toLowerCase().includes(term) ||
            profile?.lastName?.toLowerCase().includes(term) ||
            profile?.businessName?.toLowerCase().includes(term)
          );
        });
      }

      if (profTypes.length > 0) {
        filteredResults = filteredResults.filter(prof =>
          profTypes.includes(prof.professionalProfile?.profType)
        );
      }

      if (genders.length > 0) {
        filteredResults = filteredResults.filter(prof =>
          genders.includes(prof.professionalProfile?.gender)
        );
      }

      if (meetTypes.length > 0) {
        filteredResults = filteredResults.filter(prof =>
          meetTypes.includes(prof.professionalProfile?.meetType)
        );
      }

      if (languages.length > 0) {
        filteredResults = filteredResults.filter(prof => {
          const spokenLangs = prof.professionalProfile?.spokenLangArr || [];
          return languages.some(lang => spokenLangs.includes(lang));
        });
      }

      if (expertises.length > 0) {
        filteredResults = filteredResults.filter(prof => {
          const profExpertises = prof.professionalProfile?.expertisesIndArr || [];
          return expertises.some(exp => profExpertises.includes(exp));
        });
      }

      if (isVerified === true) {
        filteredResults = filteredResults.filter(prof =>
          prof.professionalProfile?.isVerified === true
        );
      }

      if (minRating && minRating > 0) {
        filteredResults = filteredResults.filter(prof =>
          (prof.professionalProfile?.rating || 0) >= minRating
        );
      }

      // Location-based filtering would require geospatial queries
      // This is a simplified version - in production, use Firestore's geospatial capabilities
      if (location && radius) {
        // TODO: Implement geospatial filtering
        console.warn('Location-based filtering not yet implemented');
      }

      // Limit results
      return filteredResults.slice(0, limit);

    } catch (error) {
      console.error('Error searching professionals:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time professional updates
   * @param {Function} callback - Callback function for updates
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribeToUserProfessionals(callback, options = {}) {
    const { 
      limit = 50,
      filters = {},
      orderBy: orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    console.log('Setting up professionals subscription with options:', options);

    try {
      // Create query
      let professionalsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professional'),
        where('isDeleted', '==', false),
        orderBy(orderByField, orderDirection),
        firestoreLimit(limit)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        professionalsQuery,
        async (snapshot) => {
          try {
            console.log('Professionals subscription update:', snapshot.size, 'professionals');

            const professionals = [];
            const profilePromises = [];

            snapshot.forEach((doc) => {
              const userData = doc.data();
              
              const profilePromise = this.getProfessionalProfile(doc.id)
                .then(profileData => ({
                  id: doc.id,
                  uid: doc.id,
                  ...userData,
                  professionalProfile: profileData,
                  objectId: doc.id,
                  userType: 3,
                  professionalPtr: profileData
                }))
                .catch(error => {
                  console.warn(`Failed to fetch profile in subscription for ${doc.id}:`, error);
                  return {
                    id: doc.id,
                    uid: doc.id,
                    ...userData,
                    professionalProfile: null,
                    objectId: doc.id,
                    userType: 3,
                    professionalPtr: null
                  };
                });

              profilePromises.push(profilePromise);
            });

            const professionalResults = await Promise.all(profilePromises);
            
            callback(professionalResults, { 
              fromCache: snapshot.metadata.fromCache,
              hasPendingWrites: snapshot.metadata.hasPendingWrites 
            });

          } catch (error) {
            console.error('Error processing professionals subscription update:', error);
            callback([], { error });
          }
        },
        (error) => {
          console.error('Professionals subscription error:', error);
          callback([], { error });
        }
      );

      return unsubscribe;

    } catch (error) {
      console.error('Error setting up professionals subscription:', error);
      throw error;
    }
  }

  /**
   * Helper function to format phone numbers
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for North American numbers
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.substring(1);
      return `(${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    
    return phoneNumber;
  }

  /**
   * Helper function to calculate age from date of birth
   * @param {Date} dob - Date of birth
   * @returns {number} Age in years
   */
  calculateAge(dob) {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Cleanup method to unsubscribe from all active subscriptions
   */
  cleanup() {
    console.log('Cleaning up professional subscriptions:', this.subscriptions.size);
    this.subscriptions.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.subscriptions.clear();
  }
}

// Create singleton instance
const firebaseProfessionalService = new FirebaseProfessionalService();

// Export service
export default firebaseProfessionalService;