#!/usr/bin/env node

/**
 * PsyPsy CMS - Firebase Emulator Seed Data Loader
 *
 * This script loads comprehensive test data into Firebase emulators for PsyPsy CMS development.
 * It includes Quebec healthcare professionals, clients, appointments, and compliance data.
 *
 * Usage: node scripts/load-seed-data.js
 *
 * Prerequisites:
 * - Firebase emulators must be running
 * - npm install firebase-admin
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:9881';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9880';

admin.initializeApp({
  projectId: 'psypsy-dev-local',
  databaseURL: 'http://localhost:9882'
});

const db = admin.firestore();
const auth = admin.auth();

async function loadSeedData() {
  console.log('🌱 Starting PsyPsy CMS seed data loading...');

  try {
    // Load Firestore seed data
    const seedDataPath = path.join(__dirname, '../seed-data/firestore-seed.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

    console.log('📊 Loading Firestore collections...');

    // Load users first
    console.log('👤 Loading users...');
    for (const [id, user] of Object.entries(seedData.users)) {
      await db.collection('users').doc(id).set(user);
      console.log(`   ✅ Created user: ${user.email} (${user.role})`);
    }

    // Load professionals
    console.log('👩‍⚕️ Loading professionals...');
    for (const [id, professional] of Object.entries(seedData.professionals)) {
      await db.collection('professionals').doc(id).set(professional);
      console.log(`   ✅ Created professional: ${professional.personalInfo.firstName} ${professional.personalInfo.lastName}`);
    }

    // Load clients
    console.log('👥 Loading clients...');
    for (const [id, client] of Object.entries(seedData.clients)) {
      await db.collection('clients').doc(id).set(client);
      console.log(`   ✅ Created client: ${client.personalInfo.firstName} ${client.personalInfo.lastName}`);
    }

    // Load appointments
    console.log('📅 Loading appointments...');
    for (const [id, appointment] of Object.entries(seedData.appointments)) {
      await db.collection('appointments').doc(id).set(appointment);
      console.log(`   ✅ Created appointment: ${appointment.id || id} (${appointment.status})`);
    }

    // Load notifications
    if (seedData.notifications) {
      console.log('📬 Loading notifications...');
      for (const [id, notification] of Object.entries(seedData.notifications)) {
        await db.collection('notifications').doc(id).set(notification);
        console.log(`   ✅ Created notification: ${notification.type || id}`);
      }
    }

    // Load system configuration
    if (seedData.system) {
      console.log('⚙️ Loading system configuration...');
      for (const [id, systemConfig] of Object.entries(seedData.system)) {
        try {
          await db.collection('system').doc(id).set(systemConfig);
          console.log(`   ✅ Created system config: ${id}`);
        } catch (error) {
          console.error(`   ❌ Failed to create system config ${id}:`, error.message);
          console.error('   Data:', JSON.stringify(systemConfig, null, 2));
        }
      }
    }

    // Load audit logs (PIPEDA/Law 25 compliance)
    if (seedData.audit_logs) {
      console.log('📋 Loading audit logs...');
      for (const [id, auditLog] of Object.entries(seedData.audit_logs)) {
        await db.collection('audit_logs').doc(id).set(auditLog);
        console.log(`   ✅ Created audit log: ${auditLog.action} (${auditLog.userId})`);
      }
    }

    // Load consent records (Quebec Law 25 compliance)
    if (seedData.consent_records) {
      console.log('📝 Loading consent records...');
      for (const [id, consent] of Object.entries(seedData.consent_records)) {
        await db.collection('consent_records').doc(id).set(consent);
        console.log(`   ✅ Created consent record: ${consent.consentType} (${consent.clientId})`);
      }
    }

    // Load data residency logs (Quebec Law 25 compliance)
    if (seedData.data_residency_logs) {
      console.log('🇨🇦 Loading data residency logs...');
      for (const [id, residencyLog] of Object.entries(seedData.data_residency_logs)) {
        await db.collection('data_residency_logs').doc(id).set(residencyLog);
        console.log(`   ✅ Created data residency log: ${residencyLog.verificationType} (${residencyLog.region})`);
      }
    }

    console.log('✅ Firestore seed data loaded successfully!');

    // Create additional test scenarios
    // await createAdditionalTestScenarios();

    console.log('🎉 PsyPsy CMS seed data loading completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • ${Object.keys(seedData.users).length} users`);
    console.log(`   • ${Object.keys(seedData.professionals).length} healthcare professionals`);
    console.log(`   • ${Object.keys(seedData.clients).length} clients`);
    console.log(`   • ${Object.keys(seedData.appointments).length} appointments`);
    if (seedData.notifications) console.log(`   • ${Object.keys(seedData.notifications).length} notifications`);
    if (seedData.system) console.log(`   • ${Object.keys(seedData.system).length} system configurations`);
    if (seedData.audit_logs) console.log(`   • ${Object.keys(seedData.audit_logs).length} audit logs (PIPEDA/Law 25)`);
    if (seedData.consent_records) console.log(`   • ${Object.keys(seedData.consent_records).length} consent records (Quebec Law 25)`);
    if (seedData.data_residency_logs) console.log(`   • ${Object.keys(seedData.data_residency_logs).length} data residency logs (Quebec Law 25)`);
    console.log('');
    console.log('🔗 Access your data:');
    console.log('   • Firestore UI: http://127.0.0.1:8782/firestore');
    console.log('   • Auth UI: http://127.0.0.1:8782/auth');
    console.log('   • Database UI: http://127.0.0.1:8782/database');

  } catch (error) {
    console.error('❌ Error loading seed data:', error);
    process.exit(1);
  }
}

async function createAdditionalTestScenarios() {
  console.log('🧪 Creating additional test scenarios...');

  // Create a waitlist scenario
  await db.collection('waitlists').doc('waitlist-001').set({
    id: 'waitlist-001',
    professionalId: 'prof-002-dr-marc-dubois',
    requestedDate: '2025-01-25',
    requestedTime: '14:00',
    clients: [
      {
        clientId: 'client-001-jean-martin',
        addedAt: '2025-01-18T10:00:00Z',
        priority: 'normal',
        preferredTimes: ['14:00', '15:00', '16:00']
      }
    ],
    status: 'active'
  });

  // Create a cancellation scenario
  await db.collection('appointments').doc('appt-004-cancelled').set({
    id: 'appt-004-cancelled',
    clientId: 'client-002-sophie-lavoie',
    professionalId: 'prof-003-dr-marie-tremblay',
    dateTime: '2025-01-19T15:00:00Z',
    endDateTime: '2025-01-19T15:50:00Z',
    duration: 50,
    timeZone: 'America/Montreal',
    status: 'cancelled',
    appointmentType: 'in-person',
    sessionType: 'individual',
    reason: 'Client cancellation - illness',
    cancellationReason: 'Client reported flu symptoms',
    cancelledAt: '2025-01-19T08:30:00Z',
    cancelledBy: 'client',
    refundAmount: 140.00,
    compliance: {
      consentVerified: true,
      dataProcessingConsent: true,
      auditTrail: [
        {
          action: 'created',
          timestamp: '2025-01-12T14:30:00Z',
          userId: 'prof-003-dr-marie-tremblay'
        },
        {
          action: 'cancelled',
          timestamp: '2025-01-19T08:30:00Z',
          userId: 'client-002-sophie-lavoie',
          reason: 'illness'
        }
      ]
    },
    createdAt: '2025-01-12T14:30:00Z',
    updatedAt: '2025-01-19T08:30:00Z'
  });

  // Create professional credentials expiring soon
  await db.collection('professional_credentials').doc('cred-001-expiring').set({
    id: 'cred-001-expiring',
    professionalId: 'prof-003-dr-marie-tremblay',
    credentialType: 'Gottman Method Couples Therapy Level 3',
    issuer: 'The Gottman Institute',
    issueDate: '2022-08-15T00:00:00Z',
    expiryDate: '2025-08-15T00:00:00Z',
    status: 'active',
    renewalRequired: true,
    daysUntilExpiry: 207,
    remindersSent: [
      {
        type: 'early_warning',
        sentAt: '2025-01-15T09:00:00Z',
        daysBeforeExpiry: 212
      }
    ],
    complianceFlags: {
      criticalForPractice: true,
      autoRenewalEnabled: false
    }
  });

  // Create a security incident for testing breach notification
  await db.collection('security_incidents').doc('incident-001').set({
    id: 'incident-001',
    timestamp: '2025-01-19T22:30:00Z',
    incidentType: 'unauthorized_access_attempt',
    severity: 'medium',
    description: 'Multiple failed login attempts detected for professional account',
    affectedResources: ['prof-002-dr-marc-dubois'],
    dataTypes: ['authentication_logs'],
    containmentStatus: 'contained',
    notificationStatus: 'pending',
    investigationNotes: 'IP address traced to known VPN service. Account temporarily locked as precaution.',
    complianceRequirements: {
      law25NotificationRequired: false,
      pipedaNotificationRequired: false,
      clientNotificationRequired: false
    },
    response: {
      immediateActions: ['account_locked', 'ip_blocked'],
      followUpRequired: true,
      estimatedResolution: '2025-01-21T00:00:00Z'
    }
  });

  console.log('   ✅ Created waitlist scenario');
  console.log('   ✅ Created appointment cancellation scenario');
  console.log('   ✅ Created expiring credential scenario');
  console.log('   ✅ Created security incident scenario');
}

// Run the seed data loading
if (import.meta.url === `file://${process.argv[1]}`) {
  loadSeedData()
    .then(() => {
      console.log('🏁 Seed data loading process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error during seed data loading:', error);
      process.exit(1);
    });
}

export { loadSeedData };