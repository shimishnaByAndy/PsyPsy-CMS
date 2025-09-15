/**
 * Firebase Client Service
 * 
 * Handles client-specific operations in Firestore
 * Replaces Parse Server client operations
 */

import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  collectionGroup,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import FirestoreService from './firestoreService';
import firebaseAuthService from './firebaseAuthService';

class FirebaseClientService extends FirestoreService {
  constructor() {
    // Note: We use 'users' collection since clients are stored as subcollections
    super('users');
  }

  /**
   * Get all clients with their profiles
   */
  async getAllClients(options = {}) {
    try {
      // Query users collection for clients
      let q = query(
        this.collection,
        where('role', '==', 'client'),
        orderBy('account.createdAt', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      const clients = [];

      for (const userDoc of snapshot.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        // Get client profile if exists
        try {
          const clientProfileDoc = await getDoc(
            doc(db, 'users', userDoc.id, 'clientProfile', 'profile')
          );
          
          if (clientProfileDoc.exists()) {
            userData.clientProfile = clientProfileDoc.data();
          }
        } catch (error) {
          console.warn(`No client profile found for user ${userDoc.id}`);
        }
        
        clients.push(userData);
      }

      return clients;
    } catch (error) {
      console.error('Get all clients error:', error);
      throw error;
    }
  }

  /**
   * Get client by ID with full profile
   */
  async getClientById(clientId) {
    try {
      // Get user document
      const userDoc = await getDoc(doc(db, 'users', clientId));
      
      if (!userDoc.exists()) {
        throw new Error('Client not found');
      }

      const userData = { id: userDoc.id, ...userDoc.data() };

      if (userData.role !== 'client') {
        throw new Error('User is not a client');
      }

      // Get client profile
      try {
        const clientProfileDoc = await getDoc(
          doc(db, 'users', clientId, 'clientProfile', 'profile')
        );
        
        if (clientProfileDoc.exists()) {
          userData.clientProfile = clientProfileDoc.data();
        }
      } catch (error) {
        console.warn(`No client profile found for client ${clientId}`);
      }

      return userData;
    } catch (error) {
      console.error('Get client by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new client (used during registration)
   */
  async createClient(clientData) {
    try {
      // This is handled by firebaseAuthService.register()
      // but we can provide additional client-specific logic here
      return await firebaseAuthService.register({
        ...clientData,
        role: 'client'
      });
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  }

  /**
   * Update client profile
   */
  async updateClientProfile(clientId, profileData) {
    try {
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      // Update main user profile
      if (profileData.profile) {
        await updateDoc(doc(db, 'users', clientId), {
          'profile': { ...profileData.profile },
          'account.updatedAt': serverTimestamp()
        });
      }

      // Update client-specific profile
      if (profileData.clientProfile) {
        await updateDoc(
          doc(db, 'users', clientId, 'clientProfile', 'profile'), 
          updateData.clientProfile
        );
      }

      return await this.getClientById(clientId);
    } catch (error) {
      console.error('Update client profile error:', error);
      throw error;
    }
  }

  /**
   * Update client medical information
   */
  async updateMedicalInfo(clientId, medicalData) {
    try {
      const updateData = {
        'medicalInfo': medicalData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(
        doc(db, 'users', clientId, 'clientProfile', 'profile'),
        updateData
      );

      return await this.getClientById(clientId);
    } catch (error) {
      console.error('Update medical info error:', error);
      throw error;
    }
  }

  /**
   * Update client preferences
   */
  async updateClientPreferences(clientId, preferences) {
    try {
      const updateData = {
        'preferences': { ...preferences },
        updatedAt: serverTimestamp()
      };

      await updateDoc(
        doc(db, 'users', clientId, 'clientProfile', 'profile'),
        updateData
      );

      return await this.getClientById(clientId);
    } catch (error) {
      console.error('Update client preferences error:', error);
      throw error;
    }
  }

  /**
   * Get clients by search criteria
   */
  async searchClients(searchParams) {
    try {
      const { 
        searchTerm, 
        status, 
        specializations,
        limit: limitCount = 50 
      } = searchParams;

      let q = query(
        this.collection,
        where('role', '==', 'client')
      );

      if (status) {
        q = query(q, where('account.status', '==', status));
      }

      q = query(q, orderBy('account.createdAt', 'desc'), limit(limitCount));

      const snapshot = await getDocs(q);
      let clients = [];

      for (const userDoc of snapshot.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() };
        
        // Get client profile
        try {
          const clientProfileDoc = await getDoc(
            doc(db, 'users', userDoc.id, 'clientProfile', 'profile')
          );
          
          if (clientProfileDoc.exists()) {
            userData.clientProfile = clientProfileDoc.data();
          }
        } catch (error) {
          // Skip clients without profiles
          continue;
        }
        
        clients.push(userData);
      }

      // Apply client-side filtering for complex searches
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        clients = clients.filter(client => {
          const fullName = `${client.profile.firstName} ${client.profile.lastName}`.toLowerCase();
          const email = client.email.toLowerCase();
          return fullName.includes(term) || email.includes(term);
        });
      }

      if (specializations && specializations.length > 0) {
        clients = clients.filter(client => {
          const clientSpecs = client.clientProfile?.preferences?.specializations || [];
          return specializations.some(spec => clientSpecs.includes(spec));
        });
      }

      return clients;
    } catch (error) {
      console.error('Search clients error:', error);
      throw error;
    }
  }

  /**
   * Get client appointments
   */
  async getClientAppointments(clientId, options = {}) {
    try {
      let q = query(
        collection(db, 'appointments'),
        where('client.uid', '==', clientId),
        orderBy('scheduling.scheduledFor', 'desc')
      );

      if (options.status) {
        q = query(q, where('scheduling.status', '==', options.status));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get client appointments error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to client changes
   */
  subscribeToClients(callback, options = {}) {
    try {
      let q = query(
        this.collection,
        where('role', '==', 'client'),
        orderBy('account.createdAt', 'desc')
      );

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      return onSnapshot(q, async (snapshot) => {
        const clients = [];
        
        for (const userDoc of snapshot.docs) {
          const userData = { id: userDoc.id, ...userDoc.data() };
          
          try {
            const clientProfileDoc = await getDoc(
              doc(db, 'users', userDoc.id, 'clientProfile', 'profile')
            );
            
            if (clientProfileDoc.exists()) {
              userData.clientProfile = clientProfileDoc.data();
            }
          } catch (error) {
            // Skip clients without profiles in real-time updates
          }
          
          clients.push(userData);
        }

        callback(clients, {
          metadata: snapshot.metadata,
          docChanges: snapshot.docChanges()
        });
      }, (error) => {
        console.error('Subscribe to clients error:', error);
        callback(null, { error });
      });
    } catch (error) {
      console.error('Subscribe to clients setup error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to specific client changes
   */
  subscribeToClient(clientId, callback) {
    try {
      const userRef = doc(db, 'users', clientId);
      const clientProfileRef = doc(db, 'users', clientId, 'clientProfile', 'profile');
      
      let userData = null;
      let clientProfile = null;
      
      // Subscribe to user document
      const unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          userData = { id: doc.id, ...doc.data() };
          if (clientProfile !== null) {
            callback({ ...userData, clientProfile });
          }
        }
      });

      // Subscribe to client profile
      const unsubscribeProfile = onSnapshot(clientProfileRef, (doc) => {
        clientProfile = doc.exists() ? doc.data() : {};
        if (userData !== null) {
          callback({ ...userData, clientProfile });
        }
      });

      // Return combined unsubscribe function
      return () => {
        unsubscribeUser();
        unsubscribeProfile();
      };
    } catch (error) {
      console.error('Subscribe to client error:', error);
      throw error;
    }
  }

  /**
   * Deactivate client account
   */
  async deactivateClient(clientId) {
    try {
      await updateDoc(doc(db, 'users', clientId), {
        'account.status': 'suspended',
        'account.updatedAt': serverTimestamp()
      });

      return await this.getClientById(clientId);
    } catch (error) {
      console.error('Deactivate client error:', error);
      throw error;
    }
  }

  /**
   * Reactivate client account
   */
  async reactivateClient(clientId) {
    try {
      await updateDoc(doc(db, 'users', clientId), {
        'account.status': 'active',
        'account.updatedAt': serverTimestamp()
      });

      return await this.getClientById(clientId);
    } catch (error) {
      console.error('Reactivate client error:', error);
      throw error;
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats() {
    try {
      const totalQuery = query(this.collection, where('role', '==', 'client'));
      const activeQuery = query(
        this.collection, 
        where('role', '==', 'client'),
        where('account.status', '==', 'active')
      );

      const [totalSnapshot, activeSnapshot] = await Promise.all([
        getDocs(totalQuery),
        getDocs(activeQuery)
      ]);

      return {
        total: totalSnapshot.size,
        active: activeSnapshot.size,
        inactive: totalSnapshot.size - activeSnapshot.size
      };
    } catch (error) {
      console.error('Get client stats error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FirebaseClientService();