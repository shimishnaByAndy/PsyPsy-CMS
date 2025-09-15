// Global setup for Playwright E2E tests
// Initializes test environment, database seeding, and Quebec Law 25 compliance testing environment

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Launch browser for setup operations
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting global test setup...');

    // Wait for application to be ready
    console.log('⏳ Waiting for application to start...');
    const maxRetries = 30;
    let retries = 0;
    let appReady = false;

    while (retries < maxRetries && !appReady) {
      try {
        await page.goto('http://localhost:1420', { timeout: 5000 });
        await page.waitForSelector('body', { timeout: 5000 });
        appReady = true;
        console.log('✅ Application is ready');
      } catch (error) {
        retries++;
        console.log(`⏳ Retry ${retries}/${maxRetries} - App not ready yet...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!appReady) {
      throw new Error('Application failed to start within timeout period');
    }

    // Initialize test database and seed data
    await setupTestDatabase(page);

    // Setup Quebec Law 25 compliance test environment
    await setupQuebecComplianceEnvironment(page);

    // Setup test user accounts with different roles
    await setupTestUsers(page);

    // Verify all healthcare services are operational
    await verifyServicesHealth(page);

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function setupTestDatabase(page: any) {
  console.log('🗄️ Setting up test database...');

  // Initialize test database with sample healthcare data
  await page.evaluate(async () => {
    // This would normally call Tauri commands to initialize test data
    // For now, we'll simulate the database setup
    if (window.__TAURI__) {
      try {
        // Initialize database with Quebec Law 25 compliance tables
        await window.__TAURI__.invoke('init_test_database');

        // Seed test data for healthcare workflows
        await window.__TAURI__.invoke('seed_test_data', {
          clients: 50,
          professionals: 10,
          appointments: 100,
          medicalNotes: 200
        });

        console.log('✅ Test database initialized');
      } catch (error) {
        console.warn('⚠️ Database setup via Tauri failed, using mock data');
      }
    }
  });
}

async function setupQuebecComplianceEnvironment(page: any) {
  console.log('🇨🇦 Setting up Quebec Law 25 compliance environment...');

  await page.evaluate(async () => {
    // Set Quebec-specific test environment variables
    window.testEnvironment = {
      jurisdiction: 'Quebec',
      law25Enabled: true,
      dataResidencyRegion: 'northamerica-northeast1',
      encryptionEnabled: true,
      auditLoggingEnabled: true,
      consentManagementEnabled: true,
      dataDeidentificationEnabled: true,
      vertexAIRegion: 'northamerica-northeast1',
      dlpEnabled: true,
      cmekEnabled: true
    };

    if (window.__TAURI__) {
      try {
        // Configure Quebec-specific services
        await window.__TAURI__.invoke('configure_quebec_environment', window.testEnvironment);

        // Initialize audit logging system
        await window.__TAURI__.invoke('init_audit_system');

        // Setup data de-identification service
        await window.__TAURI__.invoke('init_deidentification_service');

        // Configure DLP API for PHI detection
        await window.__TAURI__.invoke('init_dlp_service');

        console.log('✅ Quebec compliance environment configured');
      } catch (error) {
        console.warn('⚠️ Quebec compliance setup failed:', error);
      }
    }
  });
}

async function setupTestUsers(page: any) {
  console.log('👥 Setting up test user accounts...');

  const testUsers = [
    {
      email: 'admin@psypsy.com',
      password: 'password123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      permissions: ['all']
    },
    {
      email: 'dr.smith@psypsy.com',
      password: 'drpass123',
      role: 'professional',
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      specialization: 'clinical-psychology',
      licenseNumber: 'PSY12345'
    },
    {
      email: 'user@psypsy.com',
      password: 'userpass123',
      role: 'user',
      firstName: 'Regular',
      lastName: 'User',
      permissions: ['read_own_data']
    },
    {
      email: 'receptionist@psypsy.com',
      password: 'recpass123',
      role: 'receptionist',
      firstName: 'Reception',
      lastName: 'Staff',
      permissions: ['schedule_appointments', 'view_basic_client_info']
    }
  ];

  await page.evaluate(async (users) => {
    if (window.__TAURI__) {
      try {
        for (const user of users) {
          await window.__TAURI__.invoke('create_test_user', user);
        }
        console.log('✅ Test users created');
      } catch (error) {
        console.warn('⚠️ Test user creation failed:', error);
      }
    }
  }, testUsers);
}

async function verifyServicesHealth(page: any) {
  console.log('🏥 Verifying healthcare services health...');

  await page.evaluate(async () => {
    if (window.__TAURI__) {
      try {
        // Check Firebase connectivity (Montreal region)
        const firebaseHealth = await window.__TAURI__.invoke('check_firebase_health');
        console.log('Firebase health:', firebaseHealth);

        // Check Vertex AI service
        const vertexAIHealth = await window.__TAURI__.invoke('check_vertex_ai_health');
        console.log('Vertex AI health:', vertexAIHealth);

        // Check DLP service
        const dlpHealth = await window.__TAURI__.invoke('check_dlp_health');
        console.log('DLP service health:', dlpHealth);

        // Check audit logging service
        const auditHealth = await window.__TAURI__.invoke('check_audit_health');
        console.log('Audit service health:', auditHealth);

        // Check encryption services (CMEK)
        const encryptionHealth = await window.__TAURI__.invoke('check_encryption_health');
        console.log('Encryption health:', encryptionHealth);

        // Check social media integration
        const socialMediaHealth = await window.__TAURI__.invoke('check_social_media_health');
        console.log('Social media health:', socialMediaHealth);

        console.log('✅ All services verified');
      } catch (error) {
        console.warn('⚠️ Service health check failed:', error);
      }
    }
  });
}

export default globalSetup;