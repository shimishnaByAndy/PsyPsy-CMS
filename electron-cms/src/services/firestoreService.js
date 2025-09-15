/**
 * Firestore Base Service
 * 
 * Base class for all Firestore data operations
 * Provides common CRUD operations and real-time subscriptions
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

import { db } from '../config/firebaseConfig';

export class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collection = collection(db, collectionName);
  }

  /**
   * Create a new document
   */
  async create(data, customId = null) {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (customId) {
        const docRef = doc(this.collection, customId);
        await setDoc(docRef, docData);
        return { id: customId, ...docData };
      } else {
        const docRef = await addDoc(this.collection, docData);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      console.error(`Create ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getById(id) {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document not found: ${id}`);
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error(`Get ${this.collectionName} by ID error:`, error);
      throw error;
    }
  }

  /**
   * Get all documents with optional filtering and pagination
   */
  async getAll(options = {}) {
    try {
      let q = this.collection;
      
      // Apply filters
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        q = query(q, orderBy(field, direction));
      }
      
      // Apply pagination
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Get all ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Update document by ID
   */
  async update(id, data) {
    try {
      const docRef = doc(this.collection, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      return await this.getById(id);
    } catch (error) {
      console.error(`Update ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Delete document by ID
   */
  async delete(id) {
    try {
      const docRef = doc(this.collection, id);
      await deleteDoc(docRef);
      return { id, deleted: true };
    } catch (error) {
      console.error(`Delete ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Real-time subscription to documents
   */
  subscribe(callback, options = {}) {
    try {
      let q = this.collection;
      
      // Apply filters
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        q = query(q, orderBy(field, direction));
      }
      
      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      return onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        callback(documents, {
          metadata: snapshot.metadata,
          docChanges: snapshot.docChanges()
        });
      }, (error) => {
        console.error(`Subscribe to ${this.collectionName} error:`, error);
        callback(null, { error });
      });
    } catch (error) {
      console.error(`Subscribe ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Real-time subscription to a single document
   */
  subscribeToDoc(id, callback) {
    try {
      const docRef = doc(this.collection, id);
      
      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Subscribe to ${this.collectionName} document error:`, error);
        callback(null, { error });
      });
    } catch (error) {
      console.error(`Subscribe to ${this.collectionName} document error:`, error);
      throw error;
    }
  }

  /**
   * Batch operations
   */
  async batchOperation(operations) {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(({ type, id, data }) => {
        const docRef = doc(this.collection, id);
        
        switch (type) {
          case 'create':
            batch.set(docRef, {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            throw new Error(`Unknown batch operation type: ${type}`);
        }
      });
      
      await batch.commit();
      return { success: true, operationsCount: operations.length };
    } catch (error) {
      console.error(`Batch operation ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Transaction operation
   */
  async transaction(transactionFn) {
    try {
      return await runTransaction(db, transactionFn);
    } catch (error) {
      console.error(`Transaction ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Count documents matching criteria
   */
  async count(whereConditions = []) {
    try {
      let q = this.collection;
      
      whereConditions.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error(`Count ${this.collectionName} error:`, error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(id) {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Check exists ${this.collectionName} error:`, error);
      throw error;
    }
  }
}

export default FirestoreService;