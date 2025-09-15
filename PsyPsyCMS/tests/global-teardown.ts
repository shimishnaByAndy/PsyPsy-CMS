// Global teardown for Playwright E2E tests
// Cleans up test environment, generates compliance reports, and ensures data privacy

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧹 Starting global test teardown...');

    // Connect to application for cleanup
    await page.goto('http://localhost:1420', { timeout: 10000 });

    // Generate Quebec Law 25 compliance test report
    await generateComplianceReport(page);

    // Clean up test data while preserving audit logs
    await cleanupTestData(page);

    // Verify data privacy compliance
    await verifyDataPrivacy(page);

    // Generate test metrics and performance report
    await generateTestMetrics(page);

    // Cleanup temporary files and sensitive data
    await cleanupTemporaryFiles();

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Continue with cleanup even if some steps fail
  } finally {
    await context.close();
    await browser.close();
  }
}

async function generateComplianceReport(page: any) {
  console.log('📋 Generating Quebec Law 25 compliance report...');

  const complianceData = await page.evaluate(async () => {
    if (window.__TAURI__) {
      try {
        // Collect compliance metrics from test run
        const auditLogs = await window.__TAURI__.invoke('get_test_audit_logs');
        const encryptionStatus = await window.__TAURI__.invoke('verify_encryption_compliance');
        const dataResidencyStatus = await window.__TAURI__.invoke('verify_data_residency');
        const consentStatus = await window.__TAURI__.invoke('verify_consent_compliance');
        const deidentificationStatus = await window.__TAURI__.invoke('verify_deidentification_compliance');

        return {
          timestamp: new Date().toISOString(),
          jurisdiction: 'Quebec',
          lawCompliance: 'Law 25',
          testEnvironment: 'E2E Testing',
          metrics: {
            auditLogsGenerated: auditLogs.length,
            encryptionCompliant: encryptionStatus.compliant,
            dataResidencyCompliant: dataResidencyStatus.compliant,
            consentManagementCompliant: consentStatus.compliant,
            deidentificationCompliant: deidentificationStatus.compliant,
            testsPassed: 0, // Will be filled by test runner
            testsTotal: 0   // Will be filled by test runner
          },
          details: {
            auditLogs: auditLogs.slice(-10), // Last 10 audit entries
            encryptionDetails: encryptionStatus,
            dataResidencyDetails: dataResidencyStatus,
            consentDetails: consentStatus,
            deidentificationDetails: deidentificationStatus
          }
        };
      } catch (error) {
        console.warn('Failed to collect compliance data:', error);
        return null;
      }
    }
    return null;
  });

  if (complianceData) {
    const reportPath = path.join('test-results', 'quebec-law25-compliance-report.json');
    await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(complianceData, null, 2));
    console.log(`✅ Compliance report generated: ${reportPath}`);
  }
}

async function cleanupTestData(page: any) {
  console.log('🗑️ Cleaning up test data...');

  await page.evaluate(async () => {
    if (window.__TAURI__) {
      try {
        // Archive audit logs before cleanup (Law 25 requirement)
        await window.__TAURI__.invoke('archive_audit_logs');

        // Clean up test clients (but preserve audit trail)
        await window.__TAURI__.invoke('cleanup_test_clients');

        // Clean up test appointments
        await window.__TAURI__.invoke('cleanup_test_appointments');

        // Clean up test medical notes (with secure deletion)
        await window.__TAURI__.invoke('secure_cleanup_test_medical_notes');

        // Clean up test users (except audit records)
        await window.__TAURI__.invoke('cleanup_test_users');

        // Clean up temporary social media posts
        await window.__TAURI__.invoke('cleanup_test_social_posts');

        // Clean up DLP analysis cache
        await window.__TAURI__.invoke('cleanup_dlp_cache');

        // Clean up Vertex AI conversation history
        await window.__TAURI__.invoke('cleanup_vertex_ai_history');

        console.log('✅ Test data cleaned up');
      } catch (error) {
        console.warn('⚠️ Cleanup failed:', error);
      }
    }
  });
}

async function verifyDataPrivacy(page: any) {
  console.log('🔒 Verifying data privacy compliance...');

  const privacyVerification = await page.evaluate(async () => {
    if (window.__TAURI__) {
      try {
        // Verify no PHI data remains in application memory
        const memoryCheck = await window.__TAURI__.invoke('verify_memory_privacy');

        // Verify no sensitive data in browser storage
        const localStoragePrivacy = Object.keys(localStorage).every(key => {
          const value = localStorage.getItem(key);
          return !value?.includes('ssn') && !value?.includes('sin') &&
                 !value?.includes('medical') && !value?.includes('diagnosis');
        });

        const sessionStoragePrivacy = Object.keys(sessionStorage).every(key => {
          const value = sessionStorage.getItem(key);
          return !value?.includes('ssn') && !value?.includes('sin') &&
                 !value?.includes('medical') && !value?.includes('diagnosis');
        });

        // Verify network requests don't contain sensitive data
        const networkPrivacy = await window.__TAURI__.invoke('verify_network_privacy');

        return {
          memoryPrivacy: memoryCheck.compliant,
          localStoragePrivacy,
          sessionStoragePrivacy,
          networkPrivacy: networkPrivacy.compliant,
          overallCompliant: memoryCheck.compliant && localStoragePrivacy &&
                           sessionStoragePrivacy && networkPrivacy.compliant
        };
      } catch (error) {
        console.warn('Privacy verification failed:', error);
        return { overallCompliant: false, error: error.message };
      }
    }
    return { overallCompliant: true, browserOnly: true };
  });

  console.log('Privacy verification result:', privacyVerification);

  if (!privacyVerification.overallCompliant) {
    console.error('❌ Data privacy verification failed');
    throw new Error('Data privacy compliance verification failed');
  } else {
    console.log('✅ Data privacy compliance verified');
  }
}

async function generateTestMetrics(page: any) {
  console.log('📊 Generating test metrics...');

  const metrics = await page.evaluate(() => {
    // Collect performance metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as any).transferSize || 0
    }));

    // Memory usage if available
    const memory = (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    } : null;

    return {
      timestamp: new Date().toISOString(),
      performance: {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        resourceCount: resources.length,
        totalResourceSize: resources.reduce((sum, r) => sum + r.size, 0),
        memory
      },
      resources: resources.filter(r => r.size > 100000), // Only large resources
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  });

  const metricsPath = path.join('test-results', 'test-metrics.json');
  await fs.promises.mkdir(path.dirname(metricsPath), { recursive: true });
  await fs.promises.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(`✅ Test metrics generated: ${metricsPath}`);
}

async function cleanupTemporaryFiles() {
  console.log('🧽 Cleaning up temporary files...');

  try {
    // Clean up any temporary screenshot files older than 1 hour
    const tempDir = path.join('test-results', 'temp');
    if (fs.existsSync(tempDir)) {
      const files = await fs.promises.readdir(tempDir);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.promises.stat(filePath);
        if (now - stats.mtime.getTime() > oneHour) {
          await fs.promises.unlink(filePath);
          console.log(`Cleaned up temporary file: ${file}`);
        }
      }
    }

    // Clean up any sensitive log files
    const logFiles = ['sensitive.log', 'debug.log', 'phi.log'];
    for (const logFile of logFiles) {
      const logPath = path.join('test-results', logFile);
      if (fs.existsSync(logPath)) {
        await fs.promises.unlink(logPath);
        console.log(`Cleaned up sensitive log: ${logFile}`);
      }
    }

    console.log('✅ Temporary files cleaned up');
  } catch (error) {
    console.warn('⚠️ Temporary file cleanup failed:', error);
  }
}

export default globalTeardown;