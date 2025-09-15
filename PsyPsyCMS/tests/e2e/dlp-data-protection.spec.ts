// Data Loss Prevention (DLP) E2E Testing Suite
// Tests automatic PHI detection and protection with Quebec-specific patterns

import { test, expect } from '@playwright/test';

test.describe('DLP Data Protection Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to access DLP features
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('PHI Detection and Classification', () => {
    test('should detect Quebec health card numbers (RAMQ)', async ({ page }) => {
      await page.goto('/data-protection/dlp-test');

      // Input text containing RAMQ number
      await page.fill('[data-testid="test-input"]',
        'Patient Jean Tremblay, numéro RAMQ: TREJ 1234 5678'
      );

      await page.click('[data-testid="scan-for-phi"]');

      // Should detect RAMQ pattern
      await expect(page.locator('[data-testid="phi-detected"]')).toBeVisible();
      await expect(page.locator('[data-testid="detected-patterns"]')).toContainText('RAMQ');
      await expect(page.locator('[data-testid="sensitivity-level"]')).toContainText('High');

      // Should suggest masking
      await expect(page.locator('[data-testid="masking-suggestion"]')).toBeVisible();
      await expect(page.locator('[data-testid="masked-preview"]')).toContainText('TREJ **** ****');
    });

    test('should detect Social Insurance Numbers (SIN)', async ({ page }) => {
      await page.goto('/data-protection/dlp-test');

      // Input text with SIN
      await page.fill('[data-testid="test-input"]',
        'NAS du patient: 123-456-789'
      );

      await page.click('[data-testid="scan-for-phi"]');

      // Should detect SIN pattern
      await expect(page.locator('[data-testid="phi-detected"]')).toBeVisible();
      await expect(page.locator('[data-testid="detected-patterns"]')).toContainText('SIN');
      await expect(page.locator('[data-testid="sensitivity-level"]')).toContainText('Critical');

      // Should automatically mask
      await expect(page.locator('[data-testid="auto-masked"]')).toContainText('***-***-789');
    });

    test('should detect medical record numbers and diagnostic codes', async ({ page }) => {
      await page.goto('/data-protection/dlp-test');

      // Input medical data
      await page.fill('[data-testid="test-input"]',
        'Dossier médical #MR-2024-001234. Diagnostic: F41.1 (ICD-10). ' +
        'Prescription: Sertraline 50mg. Résultat de laboratoire: Hémoglobine 12.5 g/dL.'
      );

      await page.click('[data-testid="scan-for-phi"]');

      // Should detect multiple PHI types
      await expect(page.locator('[data-testid="phi-detected"]')).toBeVisible();

      const detectedTypes = page.locator('[data-testid="detected-types"]');
      await expect(detectedTypes).toContainText('Medical Record Number');
      await expect(detectedTypes).toContainText('ICD Code');
      await expect(detectedTypes).toContainText('Medication');
      await expect(detectedTypes).toContainText('Lab Results');

      // Should classify by sensitivity
      await expect(page.locator('[data-testid="high-sensitivity"]')).toContainText('Medical Record');
      await expect(page.locator('[data-testid="medium-sensitivity"]')).toContainText('ICD Code');
    });

    test('should detect Quebec-specific identifiers', async ({ page }) => {
      await page.goto('/data-protection/dlp-test');

      // Input Quebec-specific data
      await page.fill('[data-testid="test-input"]',
        'Numéro d\'établissement CNESST: 123456. ' +
        'Code postal: H3A 1B2. ' +
        'Numéro de permis de conduire: T1234-567890-12.'
      );

      await page.click('[data-testid="scan-for-phi"]');

      // Should detect Quebec patterns
      await expect(page.locator('[data-testid="quebec-phi-detected"]')).toBeVisible();
      await expect(page.locator('[data-testid="detected-patterns"]')).toContainText('CNESST');
      await expect(page.locator('[data-testid="detected-patterns"]')).toContainText('Quebec Postal Code');
      await expect(page.locator('[data-testid="detected-patterns"]')).toContainText('Quebec Driver License');
    });
  });

  test.describe('Real-time DLP Protection', () => {
    test('should prevent PHI entry in client forms', async ({ page }) => {
      await page.goto('/clients/new');

      // Try to enter PHI in wrong fields
      await page.fill('[data-testid="first-name-input"]', '123-456-789'); // SIN in name field

      // Should trigger DLP warning
      await expect(page.locator('[data-testid="dlp-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="dlp-warning"]')).toContainText('Données sensibles détectées');
      await expect(page.locator('[data-testid="field-suggestion"]')).toContainText('Ce type de données appartient au champ');

      // Should prevent form submission
      await page.fill('[data-testid="last-name-input"]', 'Test');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.click('[data-testid="save-client-button"]');

      await expect(page.locator('[data-testid="dlp-block-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="dlp-block-message"]')).toContainText('Corrigez les données sensibles');
    });

    test('should automatically mask PHI in notes', async ({ page }) => {
      await page.goto('/medical-notes/new');

      // Enter note with PHI
      await page.fill('[data-testid="note-content"]',
        'Patient avec NAS 123-456-789 présente des symptômes d\'anxiété. ' +
        'RAMQ: TREJ 1234 5678. Téléphone: 514-555-1234.'
      );

      // Should automatically detect and mask
      await expect(page.locator('[data-testid="auto-masking-active"]')).toBeVisible();

      // Check masked content
      const maskedContent = await page.locator('[data-testid="masked-preview"]').textContent();
      expect(maskedContent).toContain('***-***-789');
      expect(maskedContent).toContain('TREJ **** ****');
      expect(maskedContent).toContain('514-***-****');

      // Should allow saving with masked data
      await page.click('[data-testid="save-note-button"]');
      await expect(page.locator('[data-testid="note-saved"]')).toBeVisible();
    });

    test('should protect PHI in search and export functions', async ({ page }) => {
      await page.goto('/clients');

      // Try to search using PHI
      await page.fill('[data-testid="search-input"]', '123-456-789');

      // Should block PHI search
      await expect(page.locator('[data-testid="search-blocked"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-warning"]')).toContainText('Recherche par données sensibles interdite');

      // Suggest alternative search methods
      await expect(page.locator('[data-testid="search-alternatives"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-alternatives"]')).toContainText('Utilisez le nom ou l\'identifiant client');
    });
  });

  test.describe('DLP Policy Management', () => {
    test('should configure Quebec-specific DLP policies', async ({ page }) => {
      await page.goto('/admin/dlp-policies');

      // Should show Quebec-specific policies
      await expect(page.locator('[data-testid="quebec-policies"]')).toBeVisible();

      // RAMQ policy
      const ramqPolicy = page.locator('[data-testid="policy-ramq"]');
      await expect(ramqPolicy.locator('[data-testid="policy-status"]')).toContainText('Active');
      await expect(ramqPolicy.locator('[data-testid="sensitivity"]')).toContainText('High');
      await expect(ramqPolicy.locator('[data-testid="action"]')).toContainText('Mask');

      // SIN policy
      const sinPolicy = page.locator('[data-testid="policy-sin"]');
      await expect(sinPolicy.locator('[data-testid="policy-status"]')).toContainText('Active');
      await expect(sinPolicy.locator('[data-testid="sensitivity"]')).toContainText('Critical');
      await expect(sinPolicy.locator('[data-testid="action"]')).toContainText('Block');

      // Quebec medical identifiers policy
      const medicalPolicy = page.locator('[data-testid="policy-quebec-medical"]');
      await expect(medicalPolicy.locator('[data-testid="policy-status"]')).toContainText('Active');
    });

    test('should customize DLP rules for healthcare context', async ({ page }) => {
      await page.goto('/admin/dlp-policies/customize');

      // Add custom medical pattern
      await page.click('[data-testid="add-custom-pattern"]');
      await page.fill('[data-testid="pattern-name"]', 'Quebec Hospital ID');
      await page.fill('[data-testid="pattern-regex"]', 'HOP-QC-\\d{6}');
      await page.selectOption('[data-testid="sensitivity-level"]', 'high');
      await page.selectOption('[data-testid="action-type"]', 'mask');

      await page.click('[data-testid="save-pattern"]');

      // Test custom pattern
      await page.fill('[data-testid="test-pattern-input"]', 'Patient ID: HOP-QC-123456');
      await page.click('[data-testid="test-pattern-button"]');

      await expect(page.locator('[data-testid="pattern-match"]')).toBeVisible();
      await expect(page.locator('[data-testid="masked-result"]')).toContainText('HOP-QC-******');
    });

    test('should handle DLP exceptions for authorized users', async ({ page }) => {
      await page.goto('/admin/dlp-exceptions');

      // Configure exception for medical professionals
      await page.click('[data-testid="add-exception"]');
      await page.selectOption('[data-testid="user-role"]', 'medical_professional');
      await page.selectOption('[data-testid="exception-type"]', 'view_masked_data');
      await page.fill('[data-testid="justification"]', 'Clinical necessity for treatment');

      await page.click('[data-testid="save-exception"]');

      // Test exception (logout and login as medical professional)
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      await page.fill('[data-testid="email-input"]', 'dr.smith@psypsy.com');
      await page.fill('[data-testid="password-input"]', 'drpass123');
      await page.click('[data-testid="login-button"]');

      // Should be able to view unmasked data with justification
      await page.goto('/clients');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      await expect(page.locator('[data-testid="view-sensitive-data-button"]')).toBeVisible();
      await page.click('[data-testid="view-sensitive-data-button"]');

      // Should require justification
      await expect(page.locator('[data-testid="access-justification-modal"]')).toBeVisible();
      await page.fill('[data-testid="access-reason"]', 'Review patient information for upcoming appointment');
      await page.click('[data-testid="confirm-access"]');

      // Should log the access
      await expect(page.locator('[data-testid="access-logged"]')).toBeVisible();
    });
  });

  test.describe('DLP Reporting and Analytics', () => {
    test('should generate DLP violation reports', async ({ page }) => {
      await page.goto('/admin/dlp-reports');

      // Generate violation report
      await page.click('[data-testid="generate-violation-report"]');
      await page.selectOption('[data-testid="report-period"]', 'last_30_days');

      await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 15000 });

      // Verify report content
      await expect(page.locator('[data-testid="violation-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="phi-types-detected"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-violations"]')).toBeVisible();
      await expect(page.locator('[data-testid="trend-analysis"]')).toBeVisible();

      // Should show Quebec-specific metrics
      await expect(page.locator('[data-testid="ramq-detections"]')).toBeVisible();
      await expect(page.locator('[data-testid="sin-detections"]')).toBeVisible();
    });

    test('should track DLP effectiveness metrics', async ({ page }) => {
      await page.goto('/admin/dlp-analytics');

      // Verify DLP effectiveness dashboard
      await expect(page.locator('[data-testid="detection-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="false-positive-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-compliance-score"]')).toBeVisible();

      // Check pattern performance
      await expect(page.locator('[data-testid="pattern-performance"]')).toBeVisible();
      await expect(page.locator('[data-testid="ramq-accuracy"]')).toContainText('%');
      await expect(page.locator('[data-testid="sin-accuracy"]')).toContainText('%');

      // Should show improvement suggestions
      await expect(page.locator('[data-testid="improvement-suggestions"]')).toBeVisible();
    });

    test('should export DLP audit logs for compliance', async ({ page }) => {
      await page.goto('/admin/dlp-audit');

      // Filter DLP audit logs
      await page.selectOption('[data-testid="audit-filter"]', 'dlp_activities');
      await page.fill('[data-testid="date-from"]', '2024-01-01');
      await page.fill('[data-testid="date-to"]', '2024-12-31');

      // Should show DLP audit entries
      await expect(page.locator('[data-testid="dlp-audit-entries"]')).toBeVisible();

      const auditEntry = page.locator('[data-testid="dlp-audit-entry"]:first-child');
      await expect(auditEntry.locator('[data-testid="detection-type"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="sensitivity-level"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="action-taken"]')).toBeVisible();
      await expect(auditEntry.locator('[data-testid="user-response"]')).toBeVisible();

      // Export audit logs
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-dlp-audit"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/dlp-audit-log.*\.(csv|json)$/);
    });
  });

  test.describe('DLP Integration with Other Services', () => {
    test('should integrate DLP with Vertex AI data processing', async ({ page }) => {
      await page.goto('/ai-analysis/dlp-integration');

      // Input text with PHI for AI analysis
      await page.fill('[data-testid="ai-input"]',
        'Patient Jean Tremblay (NAS: 123-456-789) présente des symptômes de trouble anxieux. ' +
        'RAMQ: TREJ 1234 5678. Recommandation: thérapie cognitive-comportementale.'
      );

      await page.click('[data-testid="analyze-with-ai"]');

      // Should show DLP processing before AI
      await expect(page.locator('[data-testid="dlp-preprocessing"]')).toBeVisible();
      await expect(page.locator('[data-testid="phi-removal-status"]')).toContainText('En cours');

      // Should show de-identified version sent to AI
      await expect(page.locator('[data-testid="ai-input-preview"]')).toBeVisible();
      const aiInput = await page.locator('[data-testid="ai-input-preview"]').textContent();
      expect(aiInput).not.toContain('123-456-789');
      expect(aiInput).not.toContain('TREJ 1234 5678');
      expect(aiInput).toContain('[PATIENT_NAME]');
      expect(aiInput).toContain('[HEALTH_ID]');

      // AI analysis should complete with de-identified data
      await expect(page.locator('[data-testid="ai-analysis-complete"]')).toBeVisible({ timeout: 30000 });
    });

    test('should apply DLP to social media content', async ({ page }) => {
      await page.goto('/social-media/compose');

      // Try to post content with PHI
      await page.fill('[data-testid="post-content"]',
        'Excellent session with patient Sarah Johnson (RAMQ: JOHJ 5678 9012). ' +
        'Great progress on anxiety management techniques!'
      );

      // Should block posting with PHI
      await page.click('[data-testid="schedule-post"]');
      await expect(page.locator('[data-testid="dlp-block-post"]')).toBeVisible();
      await expect(page.locator('[data-testid="phi-detected-warning"]')).toContainText('Informations personnelles détectées');

      // Should suggest sanitized version
      await expect(page.locator('[data-testid="suggested-content"]')).toBeVisible();
      const suggestion = await page.locator('[data-testid="suggested-content"]').textContent();
      expect(suggestion).not.toContain('Sarah Johnson');
      expect(suggestion).not.toContain('JOHJ 5678 9012');
      expect(suggestion).toContain('patient');
      expect(suggestion).toContain('anxiety management');
    });

    test('should protect PHI in audit log exports', async ({ page }) => {
      await page.goto('/admin/audit-log');

      // Export audit logs
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-audit-log"]');
      const download = await downloadPromise;

      // DLP should be applied to exported audit logs
      await expect(page.locator('[data-testid="export-dlp-applied"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-sanitization-notice"]')).toContainText('Données sensibles masquées');

      // Verify file is sanitized (in real implementation, would check file content)
      expect(download.suggestedFilename()).toMatch(/audit-log-sanitized.*\.csv$/);
    });
  });
});