/**
 * Parse to Firebase Migration Utility
 * 
 * Utilities to migrate data from Parse Server to Firebase/Firestore
 * Handles user data, profiles, appointments, and relationships
 */

import Parse from 'parse';
import { 
  collection, 
  doc, 
  setDoc, 
  writeBatch, 
  Timestamp,
  getFirestore 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

import { db } from '../config/firebaseConfig';
import firebaseAuthService from '../services/firebaseAuthService';

/**
 * Migration configuration and mappings
 */
const MIGRATION_CONFIG = {
  batchSize: 50, // Process records in batches
  retryAttempts: 3,
  delayBetweenBatches: 1000, // 1 second delay between batches
  
  // Field mappings from Parse to Firebase
  userFieldMappings: {
    objectId: 'parseObjectId', // Keep original Parse ID for reference
    username: 'username',
    email: 'email',
    emailVerified: 'emailVerified',
    userType: 'userType', // Will be mapped to role
    roleNames: 'roleNames',
    isBlocked: 'isBlocked',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  
  // User type to role mapping
  userTypeToRole: {
    1: 'admin',
    2: 'client', 
    3: 'professional'
  },
  
  // Professional field mappings
  professionalFieldMappings: {
    objectId: 'parseObjectId',
    firstName: 'firstName',
    lastName: 'lastName',
    businessName: 'businessName',
    profType: 'profType',
    dob: 'dob',
    gender: 'gender',
    phoneNb: 'phoneNb',
    meetType: 'meetType',
    spokenLangArr: 'spokenLangArr',
    expertisesIndArr: 'expertisesIndArr',
    geoPt: 'geoPt',
    addressObj: 'addressObj',
    servicesOffered: 'servicesOffered',
    certifications: 'certifications',
    experience: 'experience',
    isVerified: 'isVerified',
    rating: 'rating',
    reviewCount: 'reviewCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  
  // Client field mappings  
  clientFieldMappings: {
    objectId: 'parseObjectId',
    firstName: 'firstName',
    lastName: 'lastName',
    dob: 'dob',
    gender: 'gender',
    phoneNb: 'phoneNb',
    emergencyContact: 'emergencyContact',
    medicalHistory: 'medicalHistory',
    preferences: 'preferences',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
};

/**
 * Migration utility class
 */
export class ParseToFirebaseMigration {
  constructor() {
    this.auth = getAuth();
    this.db = db;
    this.migrationLog = [];
    this.errors = [];
  }

  /**
   * Log migration progress
   */
  log(message, type = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };
    this.migrationLog.push(logEntry);
    console.log(`[Migration ${type.toUpperCase()}] ${message}`);
  }

  /**
   * Convert Parse Date to Firestore Timestamp
   */
  convertParseDate(parseDate) {
    if (!parseDate || !(parseDate instanceof Date)) {
      return null;
    }
    return Timestamp.fromDate(parseDate);
  }

  /**
   * Map Parse user data to Firebase format
   */
  mapUserData(parseUser) {
    const mapped = {};
    
    // Map basic fields
    Object.entries(MIGRATION_CONFIG.userFieldMappings).forEach(([parseField, firebaseField]) => {
      const value = parseUser.get(parseField);
      if (value !== undefined) {
        if (parseField === 'createdAt' || parseField === 'updatedAt') {
          mapped[firebaseField] = this.convertParseDate(value);
        } else {
          mapped[firebaseField] = value;
        }
      }
    });

    // Map userType to role
    const userType = parseUser.get('userType');
    mapped.role = MIGRATION_CONFIG.userTypeToRole[userType] || 'client';

    // Set additional Firebase-specific fields
    mapped.isDeleted = false;
    mapped.migrationSource = 'parse';
    mapped.migrationDate = Timestamp.now();
    
    // Create display name from username or email
    mapped.displayName = parseUser.get('username') || 
                        parseUser.get('email')?.split('@')[0] || 
                        'Unknown User';

    return mapped;
  }

  /**
   * Map Parse profile data to Firebase format
   */
  mapProfileData(parseProfile, type = 'client') {
    if (!parseProfile) return null;

    const fieldMappings = type === 'professional' ? 
      MIGRATION_CONFIG.professionalFieldMappings : 
      MIGRATION_CONFIG.clientFieldMappings;

    const mapped = {};

    Object.entries(fieldMappings).forEach(([parseField, firebaseField]) => {
      const value = parseProfile.get(parseField);
      if (value !== undefined) {
        if (parseField === 'createdAt' || parseField === 'updatedAt' || parseField === 'dob') {
          mapped[firebaseField] = this.convertParseDate(value);
        } else if (parseField === 'geoPt') {
          // Convert Parse GeoPoint to Firebase GeoPoint
          mapped[firebaseField] = value ? {
            latitude: value.latitude,
            longitude: value.longitude
          } : null;
        } else {
          mapped[firebaseField] = value;
        }
      }
    });

    // Add migration metadata
    mapped.migrationSource = 'parse';
    mapped.migrationDate = Timestamp.now();

    return mapped;
  }

  /**
   * Migrate users from Parse to Firebase
   */
  async migrateUsers(options = {}) {
    const { 
      batchSize = MIGRATION_CONFIG.batchSize,
      userType = null, // Migrate specific user type or all
      skipExisting = true
    } = options;

    this.log('Starting user migration from Parse to Firebase');

    try {
      // Query Parse users
      let userQuery = new Parse.Query(Parse.User);
      
      if (userType) {
        userQuery.equalTo('userType', userType);
      }

      // Include related profile data
      userQuery.include('clientPtr');
      userQuery.include('professionalPtr');

      const totalUsers = await userQuery.count();
      this.log(`Found ${totalUsers} users to migrate`);

      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      // Process in batches
      for (let skip = 0; skip < totalUsers; skip += batchSize) {
        userQuery.skip(skip);
        userQuery.limit(batchSize);
        
        const parseUsers = await userQuery.find();
        this.log(`Processing batch ${Math.floor(skip / batchSize) + 1}: ${parseUsers.length} users`);

        const batch = writeBatch(this.db);

        for (const parseUser of parseUsers) {
          try {
            const userId = parseUser.id;
            
            // Check if user already exists in Firebase
            if (skipExisting) {
              const existingUser = await firebaseAuthService.getUserProfile(userId);
              if (existingUser) {
                this.log(`Skipping existing user: ${parseUser.get('email')}`);
                skippedCount++;
                continue;
              }
            }

            // Map user data
            const userData = this.mapUserData(parseUser);
            
            // Create user document reference
            const userRef = doc(this.db, 'users', userId);
            batch.set(userRef, userData);

            // Handle profile data
            const userType = parseUser.get('userType');
            
            if (userType === 2) { // Client
              const clientPtr = parseUser.get('clientPtr');
              if (clientPtr) {
                const profileData = this.mapProfileData(clientPtr, 'client');
                const profileRef = doc(this.db, 'users', userId, 'clientProfile', 'profile');
                batch.set(profileRef, profileData);
              }
            } else if (userType === 3) { // Professional
              const professionalPtr = parseUser.get('professionalPtr');
              if (professionalPtr) {
                const profileData = this.mapProfileData(professionalPtr, 'professional');
                const profileRef = doc(this.db, 'users', userId, 'professionalProfile', 'profile');
                batch.set(profileRef, profileData);
              }
            }

            migratedCount++;

          } catch (userError) {
            this.log(`Error migrating user ${parseUser.get('email')}: ${userError.message}`, 'error');
            this.errors.push({
              type: 'user',
              id: parseUser.id,
              email: parseUser.get('email'),
              error: userError.message
            });
            errorCount++;
          }
        }

        // Commit batch
        try {
          await batch.commit();
          this.log(`Batch committed successfully: ${parseUsers.length} users`);
        } catch (batchError) {
          this.log(`Batch commit error: ${batchError.message}`, 'error');
          errorCount += parseUsers.length;
        }

        // Delay between batches
        if (skip + batchSize < totalUsers) {
          await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.delayBetweenBatches));
        }
      }

      this.log(`User migration completed: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`);
      
      return {
        total: totalUsers,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount
      };

    } catch (error) {
      this.log(`User migration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Migrate appointments from Parse to Firebase
   */
  async migrateAppointments(options = {}) {
    const { batchSize = MIGRATION_CONFIG.batchSize } = options;

    this.log('Starting appointment migration from Parse to Firebase');

    try {
      const appointmentQuery = new Parse.Query('Appointment');
      appointmentQuery.include('client');
      appointmentQuery.include('professional');

      const totalAppointments = await appointmentQuery.count();
      this.log(`Found ${totalAppointments} appointments to migrate`);

      let migratedCount = 0;
      let errorCount = 0;

      // Process in batches
      for (let skip = 0; skip < totalAppointments; skip += batchSize) {
        appointmentQuery.skip(skip);
        appointmentQuery.limit(batchSize);
        
        const parseAppointments = await appointmentQuery.find();
        const batch = writeBatch(this.db);

        for (const parseAppointment of parseAppointments) {
          try {
            const appointmentData = {
              // Basic appointment data
              parseObjectId: parseAppointment.id,
              
              // Client and professional references
              client: {
                uid: parseAppointment.get('client')?.id,
                email: parseAppointment.get('client')?.get('email')
              },
              professional: {
                uid: parseAppointment.get('professional')?.id,
                email: parseAppointment.get('professional')?.get('email')
              },
              
              // Scheduling information
              scheduling: {
                dateTime: this.convertParseDate(parseAppointment.get('appointmentDate')),
                duration: parseAppointment.get('duration') || 60,
                status: parseAppointment.get('status') || 'pending',
                type: parseAppointment.get('appointmentType') || 'consultation',
                notes: parseAppointment.get('notes') || ''
              },
              
              // Session information
              session: {
                completed: parseAppointment.get('isCompleted') || false,
                sessionNotes: parseAppointment.get('sessionNotes') || '',
                outcomes: parseAppointment.get('outcomes') || []
              },
              
              // Metadata
              createdAt: this.convertParseDate(parseAppointment.get('createdAt')),
              updatedAt: this.convertParseDate(parseAppointment.get('updatedAt')),
              migrationSource: 'parse',
              migrationDate: Timestamp.now()
            };

            const appointmentRef = doc(this.db, 'appointments', parseAppointment.id);
            batch.set(appointmentRef, appointmentData);
            migratedCount++;

          } catch (appointmentError) {
            this.log(`Error migrating appointment ${parseAppointment.id}: ${appointmentError.message}`, 'error');
            errorCount++;
          }
        }

        // Commit batch
        try {
          await batch.commit();
          this.log(`Appointment batch committed: ${parseAppointments.length} appointments`);
        } catch (batchError) {
          this.log(`Appointment batch error: ${batchError.message}`, 'error');
        }

        // Delay between batches
        if (skip + batchSize < totalAppointments) {
          await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.delayBetweenBatches));
        }
      }

      this.log(`Appointment migration completed: ${migratedCount} migrated, ${errorCount} errors`);
      
      return {
        total: totalAppointments,
        migrated: migratedCount,
        errors: errorCount
      };

    } catch (error) {
      this.log(`Appointment migration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Validate migration results
   */
  async validateMigration() {
    this.log('Starting migration validation');

    try {
      // Compare counts between Parse and Firebase
      const parseUserCount = await new Parse.Query(Parse.User).count();
      const parseAppointmentCount = await new Parse.Query('Appointment').count();

      // Get Firebase counts (this is simplified - in production you'd want more comprehensive validation)
      const firebaseUserSnapshot = await getDocs(collection(this.db, 'users'));
      const firebaseAppointmentSnapshot = await getDocs(collection(this.db, 'appointments'));

      const validation = {
        users: {
          parse: parseUserCount,
          firebase: firebaseUserSnapshot.size,
          match: parseUserCount === firebaseUserSnapshot.size
        },
        appointments: {
          parse: parseAppointmentCount,
          firebase: firebaseAppointmentSnapshot.size,
          match: parseAppointmentCount === firebaseAppointmentSnapshot.size
        }
      };

      this.log(`Validation results: ${JSON.stringify(validation, null, 2)}`);
      return validation;

    } catch (error) {
      this.log(`Validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Generate migration report
   */
  generateReport() {
    return {
      startTime: this.migrationLog[0]?.timestamp,
      endTime: this.migrationLog[this.migrationLog.length - 1]?.timestamp,
      log: this.migrationLog,
      errors: this.errors,
      summary: {
        totalLogEntries: this.migrationLog.length,
        totalErrors: this.errors.length,
        errorRate: this.errors.length / Math.max(this.migrationLog.length, 1) * 100
      }
    };
  }

  /**
   * Run complete migration process
   */
  async runFullMigration(options = {}) {
    this.log('Starting full Parse to Firebase migration');

    try {
      const results = {
        users: await this.migrateUsers(options.users),
        appointments: await this.migrateAppointments(options.appointments),
        validation: await this.validateMigration()
      };

      this.log('Full migration completed successfully');
      return results;

    } catch (error) {
      this.log(`Full migration failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

/**
 * Convenience function to start migration
 */
export const startMigration = async (options = {}) => {
  const migration = new ParseToFirebaseMigration();
  return await migration.runFullMigration(options);
};

/**
 * Export migration utility
 */
export default ParseToFirebaseMigration;