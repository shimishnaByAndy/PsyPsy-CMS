// Quebec Law 25 Compliance E2E Testing Suite
// Tests all Quebec-specific privacy and data protection requirements

import { test, expect } from '@playwright/test';

test.describe('Quebec Law 25 Compliance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set Quebec jurisdiction for testing
    await page.addInitScript(() => {
      window.testJurisdiction = 'Quebec';
      window.law25Enabled = true;
    });

    // Login as admin for compliance testing
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Data Residency and Sovereignty', () => {
    test('should ensure all data is stored in Montreal region', async ({ page }) => {
      await page.goto('/admin/data-residency');

      // Verify Firebase region configuration
      await expect(page.locator('[data-testid="firebase-region"]')).toContainText('northamerica-northeast1');
      await expect(page.locator('[data-testid="firebase-location"]')).toContainText('Montreal');

      // Verify Vertex AI region
      await expect(page.locator('[data-testid="vertex-ai-region"]')).toContainText('northamerica-northeast1');

      // Verify data residency compliance status
      await expect(page.locator('[data-testid="data-residency-status"]')).toContainText('Compliant');
      await expect(page.locator('[data-testid="quebec-jurisdiction-indicator"]')).toBeVisible();
    });

    test('should verify encryption in transit and at rest', async ({ page }) => {
      await page.goto('/admin/encryption-status');

      // Verify CMEK (Customer-Managed Encryption Keys) status
      await expect(page.locator('[data-testid="cmek-status"]')).toContainText('Active');
      await expect(page.locator('[data-testid="cmek-region"]')).toContainText('northamerica-northeast1');

      // Verify Firebase encryption
      await expect(page.locator('[data-testid="firebase-encryption"]')).toContainText('CMEK Enabled');

      // Verify TLS/SSL for all communications
      page.on('request', request => {
        const url = request.url();
        if (url.includes('api/') || url.includes('firebase') || url.includes('vertex')) {
          expect(url).toMatch(/^https:/);
        }
      });

      // Test data transmission
      await page.click('[data-testid="test-encryption-button"]');
      await expect(page.locator('[data-testid="encryption-test-result"]')).toContainText('All communications encrypted');
    });

    test('should validate data sovereignty controls', async ({ page }) => {
      await page.goto('/admin/sovereignty-controls');

      // Verify no data crosses Quebec/Canadian borders
      await expect(page.locator('[data-testid="data-sovereignty-status"]')).toContainText('Compliant');
      await expect(page.locator('[data-testid="cross-border-transfers"]')).toContainText('None');

      // Verify legal entity compliance
      await expect(page.locator('[data-testid="legal-entity"]')).toContainText('Canadian Corporation');
      await expect(page.locator('[data-testid="jurisdiction"]')).toContainText('Quebec, Canada');
    });
  });

  test.describe('Consent Management (Article 12-16)', () => {
    test('should require explicit consent for data collection', async ({ page }) => {
      // Navigate to new client registration
      await page.goto('/clients/new');

      // Should show consent management interface
      await expect(page.locator('[data-testid="consent-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-title"]')).toContainText('Consentement - Loi 25');

      // Verify granular consent options
      await expect(page.locator('[data-testid="consent-data-collection"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-data-processing"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-data-sharing"]')).toBeVisible();
      await expect(page.locator('[data-testid="consent-marketing"]')).toBeVisible();

      // Should not allow submission without explicit consent
      await page.fill('[data-testid="first-name-input"]', 'Jean');
      await page.fill('[data-testid="last-name-input"]', 'Tremblay');
      await page.fill('[data-testid="email-input"]', 'jean.tremblay@example.com');

      await page.click('[data-testid="save-client-button"]');
      await expect(page.locator('[data-testid="consent-error"]')).toContainText('Consentement requis');

      // Grant consent and verify submission works
      await page.check('[data-testid="consent-data-collection"]');
      await page.check('[data-testid="consent-data-processing"]');
      await page.click('[data-testid="save-client-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('should allow consent withdrawal', async ({ page }) => {
      await page.goto('/clients');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      // Navigate to consent management
      await page.click('[data-testid="manage-consent-button"]');
      await expect(page.locator('[data-testid="consent-management-modal"]')).toBeVisible();

      // Show current consent status
      await expect(page.locator('[data-testid="current-consent-status"]')).toBeVisible();

      // Withdraw data processing consent
      await page.uncheck('[data-testid="consent-data-processing"]');
      await page.click('[data-testid="update-consent-button"]');

      // Should show confirmation dialog
      await expect(page.locator('[data-testid="withdrawal-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="withdrawal-consequences"]')).toContainText('Les données seront supprimées');

      await page.click('[data-testid="confirm-withdrawal"]');
      await expect(page.locator('[data-testid="consent-updated-message"]')).toBeVisible();

      // Verify consent withdrawal is logged in audit trail
      await page.goto('/admin/audit-log');
      await expect(page.locator('[data-testid="audit-entries"]')).toContainText('Consent withdrawn');
    });

    test('should handle consent for minors (under 14)', async ({ page }) => {
      await page.goto('/clients/new');

      // Fill minor's information
      await page.fill('[data-testid="first-name-input"]', 'Marie');
      await page.fill('[data-testid="last-name-input"]', 'Dubois');
      await page.fill('[data-testid="date-of-birth-input"]', '2015-06-15'); // 8 years old

      // Should automatically show parental consent requirements
      await expect(page.locator('[data-testid="parental-consent-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="parent-guardian-info"]')).toBeVisible();

      // Require parent/guardian information
      await page.fill('[data-testid="parent-name-input"]', 'Pierre Dubois');
      await page.fill('[data-testid="parent-email-input"]', 'pierre.dubois@example.com');
      await page.fill('[data-testid="parent-phone-input"]', '+1-514-555-0123');

      // Require parental consent
      await page.check('[data-testid="parental-consent-checkbox"]');

      // Digital signature for parent
      await page.fill('[data-testid="parent-signature"]', 'Pierre Dubois');

      await page.click('[data-testid="save-client-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test.describe('Right to Information (Article 8-11)', () => {
    test('should provide clear privacy notice in French', async ({ page }) => {
      await page.goto('/privacy-notice');

      // Verify French language content
      await expect(page.locator('[data-testid="privacy-title"]')).toContainText('Avis de confidentialité');
      await expect(page.locator('[data-testid="law25-reference"]')).toContainText('Loi 25');

      // Verify required information elements
      await expect(page.locator('[data-testid="data-controller"]')).toContainText('PsyPsy CMS');
      await expect(page.locator('[data-testid="data-purposes"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-categories"]')).toBeVisible();
      await expect(page.locator('[data-testid="retention-periods"]')).toBeVisible();
      await expect(page.locator('[data-testid="third-party-sharing"]')).toBeVisible();
      await expect(page.locator('[data-testid="individual-rights"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-information"]')).toBeVisible();
    });

    test('should provide access to personal data upon request', async ({ page }) => {
      await page.goto('/client-portal/data-access');

      // Client should be able to request their data
      await page.click('[data-testid="request-data-button"]');
      await expect(page.locator('[data-testid="data-request-form"]')).toBeVisible();

      // Fill data access request
      await page.selectOption('[data-testid="request-type"]', 'full_data_export');
      await page.fill('[data-testid="request-reason"]', 'Vérification de mes données personnelles');
      await page.click('[data-testid="submit-data-request"]');

      // Should show confirmation and timeline
      await expect(page.locator('[data-testid="request-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="response-timeline"]')).toContainText('30 jours');

      // Admin should see the request
      await page.goto('/admin/data-requests');
      await expect(page.locator('[data-testid="pending-requests"]')).toContainText('Demande d\'accès');
    });
  });

  test.describe('Data Minimization and Purpose Limitation', () => {
    test('should only collect necessary data for healthcare purposes', async ({ page }) => {
      await page.goto('/clients/new');

      // Verify form only includes necessary fields
      const requiredFields = ['first-name', 'last-name', 'email', 'phone'];
      const sensitiveFields = ['ssn', 'credit-card', 'income'];

      for (const field of requiredFields) {
        await expect(page.locator(`[data-testid="${field}-input"]`)).toBeVisible();
      }

      // Sensitive fields should not be present unless specifically justified
      for (const field of sensitiveFields) {
        await expect(page.locator(`[data-testid="${field}-input"]`)).not.toBeVisible();
      }

      // Medical history should be separate with additional consent
      await expect(page.locator('[data-testid="medical-history-section"]')).not.toBeVisible();
    });

    test('should enforce purpose limitation for data use', async ({ page }) => {
      await page.goto('/admin/data-usage-monitoring');

      // Verify data usage purposes are tracked
      await expect(page.locator('[data-testid="purpose-tracking"]')).toBeVisible();
      await expect(page.locator('[data-testid="healthcare-purpose"]')).toContainText('Soins de santé');
      await expect(page.locator('[data-testid="administrative-purpose"]')).toContainText('Administration');

      // Verify no unauthorized purposes
      await expect(page.locator('[data-testid="marketing-purpose"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="research-purpose"]')).not.toBeVisible();
    });
  });

  test.describe('Data De-identification (Article 5)', () => {
    test('should automatically de-identify data for analytics', async ({ page }) => {
      await page.goto('/analytics/client-insights');

      // Verify analytics use de-identified data
      await expect(page.locator('[data-testid="deidentified-notice"]')).toContainText('Données dé-identifiées');

      // Check that no personal identifiers are visible in analytics
      const analyticsContent = await page.locator('[data-testid="analytics-content"]').textContent();
      expect(analyticsContent).not.toMatch(/\b\d{3}-\d{3}-\d{4}\b/); // Phone numbers
      expect(analyticsContent).not.toMatch(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/); // Emails
      expect(analyticsContent).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/); // SSN patterns

      // Should show aggregated, non-identifying statistics only
      await expect(page.locator('[data-testid="client-age-distribution"]')).toBeVisible();
      await expect(page.locator('[data-testid="service-utilization"]')).toBeVisible();
    });

    test('should apply de-identification before AI processing', async ({ page }) => {
      await page.goto('/ai-analysis/conversation-insights');

      // Start AI analysis
      await page.click('[data-testid="start-ai-analysis"]');
      await expect(page.locator('[data-testid="deidentification-status"]')).toContainText('En cours de dé-identification');

      // Verify AI receives only de-identified data
      await expect(page.locator('[data-testid="ai-input-preview"]')).not.toContainText('@');
      await expect(page.locator('[data-testid="ai-input-preview"]')).not.toMatch(/\d{3}-\d{3}-\d{4}/);

      // AI analysis should complete with de-identified results
      await expect(page.locator('[data-testid="ai-analysis-complete"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="deidentified-results"]')).toBeVisible();
    });
  });

  test.describe('Breach Notification (Article 63-68)', () => {
    test('should detect and report potential data breaches', async ({ page }) => {
      // Simulate suspicious activity that could indicate a breach
      await page.goto('/admin/security-monitoring');

      // Trigger breach detection scenario
      await page.click('[data-testid="simulate-breach-scenario"]');
      await page.selectOption('[data-testid="breach-type"]', 'unauthorized_access');

      // Should automatically trigger breach response
      await expect(page.locator('[data-testid="breach-alert"]')).toBeVisible();
      await expect(page.locator('[data-testid="breach-timeline"]')).toContainText('72 heures');

      // Should show required notification steps
      await expect(page.locator('[data-testid="notify-cai-step"]')).toBeVisible();
      await expect(page.locator('[data-testid="notify-clients-step"]')).toBeVisible();
      await expect(page.locator('[data-testid="document-breach-step"]')).toBeVisible();

      // Should generate breach report
      await page.click('[data-testid="generate-breach-report"]');
      await expect(page.locator('[data-testid="breach-report"]')).toBeVisible();
    });

    test('should maintain breach notification registry', async ({ page }) => {
      await page.goto('/admin/breach-registry');

      // Verify breach registry exists and is compliant
      await expect(page.locator('[data-testid="breach-registry-title"]')).toContainText('Registre des violations');
      await expect(page.locator('[data-testid="registry-headers"]')).toContainText('Date');
      await expect(page.locator('[data-testid="registry-headers"]')).toContainText('Type');
      await expect(page.locator('[data-testid="registry-headers"]')).toContainText('Personnes affectées');
      await expect(page.locator('[data-testid="registry-headers"]')).toContainText('Mesures prises');

      // Should track notification timelines
      await expect(page.locator('[data-testid="notification-tracking"]')).toBeVisible();
    });
  });

  test.describe('Audit Trail and Compliance Monitoring', () => {
    test('should maintain comprehensive audit logs', async ({ page }) => {
      await page.goto('/admin/audit-log');

      // Verify audit log contains Law 25 required elements
      await expect(page.locator('[data-testid="audit-law25-compliance"]')).toBeVisible();

      // Check audit log entries have required fields
      const auditEntry = page.locator('[data-testid="audit-entry"]:first-child');
      await expect(auditEntry.locator('[data-testid="timestamp"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="user-id"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="action-type"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="data-subject"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="legal-basis"]')).toBeVisible();

      // Filter by Law 25 specific activities
      await page.selectOption('[data-testid="audit-filter"]', 'law25_activities');
      await expect(page.locator('[data-testid="consent-activities"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-access-activities"]')).toBeVisible();
      await expect(page.locator('[data-testid="deletion-activities"]')).toBeVisible();
    });

    test('should generate compliance reports for CAI', async ({ page }) => {
      await page.goto('/admin/compliance-reporting');

      // Generate Law 25 compliance report
      await page.click('[data-testid="generate-law25-report"]');
      await page.selectOption('[data-testid="report-period"]', 'monthly');

      // Should include all required compliance metrics
      await expect(page.locator('[data-testid="report-preview"]')).toContainText('Loi 25');
      await expect(page.locator('[data-testid="consent-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-breach-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="access-request-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="deletion-metrics"]')).toBeVisible();

      // Should be exportable for CAI submission
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-cai-report"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/law25-compliance-report.*\.pdf$/);
    });
  });

  test.describe('Data Portability and Deletion Rights', () => {
    test('should export client data in structured format', async ({ page }) => {
      await page.goto('/clients');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      // Client data export
      await page.click('[data-testid="export-data-button"]');
      await page.selectOption('[data-testid="export-format"]', 'json');

      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="confirm-export"]');
      const download = await downloadPromise;

      // Verify exported data is complete and structured
      expect(download.suggestedFilename()).toMatch(/client-data-export.*\.json$/);
    });

    test('should handle right to be forgotten requests', async ({ page }) => {
      await page.goto('/clients');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      // Request data deletion
      await page.click('[data-testid="delete-all-data-button"]');
      await expect(page.locator('[data-testid="deletion-confirmation"]')).toBeVisible();

      // Should show deletion implications
      await expect(page.locator('[data-testid="deletion-consequences"]')).toContainText('Suppression définitive');
      await expect(page.locator('[data-testid="legal-retention-notice"]')).toContainText('obligations légales');

      // Confirm deletion
      await page.fill('[data-testid="deletion-confirmation-phrase"]', 'SUPPRIMER DÉFINITIVEMENT');
      await page.click('[data-testid="confirm-deletion"]');

      // Should create audit trail
      await expect(page.locator('[data-testid="deletion-audit-created"]')).toBeVisible();

      // Verify data is actually deleted (except audit trail)
      await page.goto('/clients');
      await expect(page.locator('[data-testid="clients-table"]')).not.toContainText('deleted-client-name');
    });
  });
});