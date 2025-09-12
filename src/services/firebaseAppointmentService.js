/**
 * Firebase Appointment Service
 * 
 * Handles appointment operations in Firestore
 * Replaces Parse Server appointment operations
 */

import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  runTransaction
} from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import FirestoreService from './firestoreService';

// Appointment status constants
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no-show'
};

export const SESSION_TYPES = {
  INITIAL: 'initial',
  FOLLOWUP: 'followup',
  EMERGENCY: 'emergency'
};

export const SESSION_FORMATS = {
  VIDEO: 'video',
  PHONE: 'phone',
  IN_PERSON: 'in-person'
};

class FirebaseAppointmentService extends FirestoreService {
  constructor() {
    super('appointments');
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData) {
    try {
      const {
        clientId,
        professionalId,
        scheduledFor,
        duration = 50,
        sessionType = SESSION_TYPES.INITIAL,
        sessionFormat = SESSION_FORMATS.VIDEO,
        specialization,
        notes = {}
      } = appointmentData;

      // Get client and professional info
      const [clientDoc, professionalDoc] = await Promise.all([
        getDoc(doc(db, 'users', clientId)),
        getDoc(doc(db, 'users', professionalId))
      ]);

      if (!clientDoc.exists() || !professionalDoc.exists()) {
        throw new Error('Client or Professional not found');
      }

      const clientData = clientDoc.data();
      const professionalData = professionalDoc.data();

      // Validate roles
      if (clientData.role !== 'client' || professionalData.role !== 'professional') {
        throw new Error('Invalid user roles for appointment');
      }

      const appointmentDoc = {
        client: {
          uid: clientId,
          name: `${clientData.profile.firstName} ${clientData.profile.lastName}`,
          email: clientData.email
        },
        professional: {
          uid: professionalId,
          name: `${professionalData.profile.firstName} ${professionalData.profile.lastName}`,
          license: professionalData.professionalProfile?.credentials?.license?.number || null
        },
        session: {
          type: sessionType,
          format: sessionFormat,
          duration,
          specialization
        },
        scheduling: {
          requestedAt: serverTimestamp(),
          scheduledFor: Timestamp.fromDate(new Date(scheduledFor)),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          status: APPOINTMENT_STATUS.PENDING,
          confirmationDeadline: Timestamp.fromDate(
            new Date(new Date(scheduledFor).getTime() - 24 * 60 * 60 * 1000)
          )
        },
        payment: {
          amount: 150.00,
          currency: 'CAD',
          method: 'card',
          status: 'pending',
          transactionId: null
        },
        communication: {
          meetingUrl: null,
          notes: {
            client: notes.client || '',
            professional: notes.professional || '',
            admin: notes.admin || ''
          }
        },
        history: [{
          action: 'created',
          timestamp: serverTimestamp(),
          by: clientId,
          reason: 'Initial appointment request'
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(this.collection, appointmentDoc);
      return {
        id: docRef.id,
        ...appointmentDoc
      };
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, status, updatedBy, reason = null) {
    try {
      const appointmentRef = doc(this.collection, appointmentId);
      
      return await runTransaction(db, async (transaction) => {
        const appointmentDoc = await transaction.get(appointmentRef);
        
        if (!appointmentDoc.exists()) {
          throw new Error('Appointment not found');
        }

        const currentData = appointmentDoc.data();
        const newHistory = [
          ...currentData.history,
          {
            action: status,
            timestamp: serverTimestamp(),
            by: updatedBy,
            reason: reason || `Status changed to ${status}`
          }
        ];

        const updateData = {
          'scheduling.status': status,
          history: newHistory,
          updatedAt: serverTimestamp()
        };

        // Add specific updates based on status
        if (status === APPOINTMENT_STATUS.CONFIRMED) {
          updateData['scheduling.confirmedAt'] = serverTimestamp();
        } else if (status === APPOINTMENT_STATUS.COMPLETED) {
          updateData['scheduling.completedAt'] = serverTimestamp();
        }

        transaction.update(appointmentRef, updateData);
        
        return {
          id: appointmentId,
          ...currentData,
          ...updateData
        };
      });
    } catch (error) {
      console.error('Update appointment status error:', error);
      throw error;
    }
  }

  /**
   * Get appointments for a user (client or professional)
   */
  async getUserAppointments(userId, userRole, options = {}) {
    try {
      const field = userRole === 'professional' ? 'professional.uid' : 'client.uid';
      
      let q = query(
        this.collection,
        where(field, '==', userId),
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
      console.error('Get user appointments error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming appointments for a professional
   */
  async getUpcomingAppointments(professionalId, daysAhead = 7) {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const q = query(
        this.collection,
        where('professional.uid', '==', professionalId),
        where('scheduling.scheduledFor', '>=', Timestamp.fromDate(startDate)),
        where('scheduling.scheduledFor', '<=', Timestamp.fromDate(endDate)),
        where('scheduling.status', 'in', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED]),
        orderBy('scheduling.scheduledFor', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      throw error;
    }
  }

  /**
   * Search appointments by criteria
   */
  async searchAppointments(searchParams) {
    try {
      const {
        status,
        professionalId,
        clientId,
        startDate,
        endDate,
        sessionType,
        limit: limitCount = 50
      } = searchParams;

      let q = this.collection;

      if (professionalId) {
        q = query(q, where('professional.uid', '==', professionalId));
      }

      if (clientId) {
        q = query(q, where('client.uid', '==', clientId));
      }

      if (status) {
        q = query(q, where('scheduling.status', '==', status));
      }

      if (startDate && endDate) {
        q = query(
          q,
          where('scheduling.scheduledFor', '>=', Timestamp.fromDate(new Date(startDate))),
          where('scheduling.scheduledFor', '<=', Timestamp.fromDate(new Date(endDate)))
        );
      }

      q = query(q, orderBy('scheduling.scheduledFor', 'desc'), limit(limitCount));

      const snapshot = await getDocs(q);
      let appointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply client-side filtering for complex searches
      if (sessionType) {
        appointments = appointments.filter(apt => apt.session.type === sessionType);
      }

      return appointments;
    } catch (error) {
      console.error('Search appointments error:', error);
      throw error;
    }
  }

  /**
   * Update appointment details
   */
  async updateAppointment(appointmentId, updateData, updatedBy) {
    try {
      const appointmentRef = doc(this.collection, appointmentId);
      
      const historyEntry = {
        action: 'updated',
        timestamp: serverTimestamp(),
        by: updatedBy,
        reason: 'Appointment details updated'
      };

      return await runTransaction(db, async (transaction) => {
        const appointmentDoc = await transaction.get(appointmentRef);
        
        if (!appointmentDoc.exists()) {
          throw new Error('Appointment not found');
        }

        const currentData = appointmentDoc.data();
        const newHistory = [...currentData.history, historyEntry];

        const finalUpdateData = {
          ...updateData,
          history: newHistory,
          updatedAt: serverTimestamp()
        };

        transaction.update(appointmentRef, finalUpdateData);
        
        return {
          id: appointmentId,
          ...currentData,
          ...finalUpdateData
        };
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, cancelledBy, reason) {
    try {
      return await this.updateAppointmentStatus(
        appointmentId, 
        APPOINTMENT_STATUS.CANCELLED, 
        cancelledBy, 
        reason
      );
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  }

  /**
   * Complete appointment and create session record
   */
  async completeAppointment(appointmentId, sessionData) {
    try {
      return await runTransaction(db, async (transaction) => {
        const appointmentRef = doc(this.collection, appointmentId);
        const appointmentDoc = await transaction.get(appointmentRef);
        
        if (!appointmentDoc.exists()) {
          throw new Error('Appointment not found');
        }

        const appointmentData = appointmentDoc.data();
        
        // Update appointment status
        const historyEntry = {
          action: 'completed',
          timestamp: serverTimestamp(),
          by: sessionData.completedBy || appointmentData.professional.uid,
          reason: 'Session completed'
        };

        const appointmentUpdate = {
          'scheduling.status': APPOINTMENT_STATUS.COMPLETED,
          'scheduling.completedAt': serverTimestamp(),
          history: [...appointmentData.history, historyEntry],
          updatedAt: serverTimestamp()
        };

        transaction.update(appointmentRef, appointmentUpdate);

        // Create session record
        const sessionDoc = {
          appointmentId,
          client: appointmentData.client,
          professional: appointmentData.professional,
          session: {
            startTime: sessionData.startTime || appointmentData.scheduling.scheduledFor,
            endTime: sessionData.endTime || serverTimestamp(),
            actualDuration: sessionData.actualDuration || appointmentData.session.duration,
            type: appointmentData.session.format,
            notes: {
              professional: sessionData.professionalNotes || '',
              client: sessionData.clientNotes || ''
            }
          },
          outcome: {
            completed: true,
            rating: sessionData.rating || null,
            followupScheduled: sessionData.followupScheduled || false,
            nextRecommendedSession: sessionData.nextRecommendedSession || null
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const sessionRef = doc(collection(db, 'sessions'));
        transaction.set(sessionRef, sessionDoc);

        return {
          appointment: {
            id: appointmentId,
            ...appointmentData,
            ...appointmentUpdate
          },
          session: {
            id: sessionRef.id,
            ...sessionDoc
          }
        };
      });
    } catch (error) {
      console.error('Complete appointment error:', error);
      throw error;
    }
  }

  /**
   * Real-time subscription to user appointments
   */
  subscribeToUserAppointments(userId, userRole, callback, options = {}) {
    try {
      const field = userRole === 'professional' ? 'professional.uid' : 'client.uid';
      
      let q = query(
        this.collection,
        where(field, '==', userId),
        orderBy('scheduling.scheduledFor', 'desc')
      );

      if (options.status) {
        q = query(q, where('scheduling.status', '==', options.status));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      return onSnapshot(q, (snapshot) => {
        const appointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        callback(appointments, {
          metadata: snapshot.metadata,
          docChanges: snapshot.docChanges()
        });
      }, (error) => {
        console.error('Subscribe to user appointments error:', error);
        callback(null, { error });
      });
    } catch (error) {
      console.error('Subscribe to user appointments setup error:', error);
      throw error;
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(filters = {}) {
    try {
      const { professionalId, clientId, startDate, endDate } = filters;
      
      let q = this.collection;
      
      if (professionalId) {
        q = query(q, where('professional.uid', '==', professionalId));
      }
      
      if (clientId) {
        q = query(q, where('client.uid', '==', clientId));
      }

      if (startDate && endDate) {
        q = query(
          q,
          where('scheduling.scheduledFor', '>=', Timestamp.fromDate(new Date(startDate))),
          where('scheduling.scheduledFor', '<=', Timestamp.fromDate(new Date(endDate)))
        );
      }

      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => doc.data());

      const stats = {
        total: appointments.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0
      };

      appointments.forEach(appointment => {
        const status = appointment.scheduling.status;
        if (stats.hasOwnProperty(status.replace('-', ''))) {
          stats[status.replace('-', '')]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Get appointment stats error:', error);
      throw error;
    }
  }

  /**
   * Delete appointment (admin only)
   */
  async deleteAppointment(appointmentId) {
    try {
      await deleteDoc(doc(this.collection, appointmentId));
      return { id: appointmentId, deleted: true };
    } catch (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FirebaseAppointmentService();