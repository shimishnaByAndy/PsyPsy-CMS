// Vertex AI Integration E2E Testing Suite
// Tests Google Vertex AI integration with Quebec Law 25 compliance

import { test, expect } from '@playwright/test';

test.describe('Vertex AI Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'dr.smith@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'drpass123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Medical Note Analysis', () => {
    test('should analyze medical notes with AI assistance', async ({ page }) => {
      await page.goto('/medical-notes/new');

      // Fill medical note
      await page.fill('[data-testid="patient-id-input"]', 'client_123');
      await page.fill('[data-testid="note-content"]',
        'Patient présente des symptômes d\'anxiété généralisée. ' +
        'Difficultés de sommeil depuis 3 semaines. ' +
        'Antécédents familiaux de troubles anxieux.'
      );

      // Enable AI analysis
      await page.check('[data-testid="enable-ai-analysis"]');

      // Verify de-identification notice
      await expect(page.locator('[data-testid="deidentification-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="deidentification-notice"]')).toContainText('dé-identification');

      // Start AI analysis
      await page.click('[data-testid="analyze-with-ai"]');

      // Should show processing status
      await expect(page.locator('[data-testid="ai-processing"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-processing"]')).toContainText('Analyse en cours');

      // Wait for analysis completion
      await expect(page.locator('[data-testid="ai-analysis-complete"]')).toBeVisible({ timeout: 30000 });

      // Verify AI suggestions
      await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible();
      await expect(page.locator('[data-testid="suggested-diagnoses"]')).toBeVisible();
      await expect(page.locator('[data-testid="treatment-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="follow-up-suggestions"]')).toBeVisible();

      // Verify ICD-10-CA codes suggested
      await expect(page.locator('[data-testid="icd-codes"]')).toContainText('F41'); // Anxiety disorders
    });

    test('should ensure AI analysis maintains data privacy', async ({ page }) => {
      await page.goto('/medical-notes/ai-analysis');

      // Monitor network requests to Vertex AI
      const aiRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('vertex') || request.url().includes('aiplatform')) {
          aiRequests.push(request.url());
        }
      });

      // Start analysis with PHI data
      await page.fill('[data-testid="analysis-input"]',
        'Jean Tremblay, 514-555-1234, présente des symptômes de dépression.'
      );
      await page.click('[data-testid="start-analysis"]');

      // Wait for analysis
      await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 30000 });

      // Verify requests went to Montreal region
      expect(aiRequests.some(url => url.includes('northamerica-northeast1'))).toBe(true);

      // Verify no PHI was sent to AI (check audit logs)
      await page.goto('/admin/audit-log');
      await page.selectOption('[data-testid="audit-filter"]', 'ai_requests');

      const latestAIRequest = page.locator('[data-testid="audit-entry"]:first-child');
      await expect(latestAIRequest).not.toContainText('Jean Tremblay');
      await expect(latestAIRequest).not.toContainText('514-555-1234');
      await expect(latestAIRequest).toContainText('De-identified data sent to AI');
    });

    test('should handle AI service failures gracefully', async ({ page }) => {
      // Simulate AI service unavailability
      await page.route('**/vertex**', route => {
        route.abort('failed');
      });

      await page.goto('/medical-notes/new');
      await page.fill('[data-testid="note-content"]', 'Test medical note for AI analysis');
      await page.check('[data-testid="enable-ai-analysis"]');
      await page.click('[data-testid="analyze-with-ai"]');

      // Should show graceful error handling
      await expect(page.locator('[data-testid="ai-service-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="fallback-options"]')).toBeVisible();
      await expect(page.locator('[data-testid="manual-analysis-option"]')).toBeVisible();

      // Should still allow saving note without AI analysis
      await page.click('[data-testid="save-note-button"]');
      await expect(page.locator('[data-testid="note-saved"]')).toBeVisible();
    });
  });

  test.describe('Clinical Decision Support', () => {
    test('should provide evidence-based treatment recommendations', async ({ page }) => {
      await page.goto('/clinical-decision-support');

      // Input patient symptoms
      await page.fill('[data-testid="symptoms-input"]', 'anxiété, insomnie, fatigue');
      await page.selectOption('[data-testid="patient-age-range"]', '25-35');
      await page.selectOption('[data-testid="gender"]', 'female');

      // Request clinical recommendations
      await page.click('[data-testid="get-recommendations"]');

      // Should show processing with Quebec compliance
      await expect(page.locator('[data-testid="processing-notice"]')).toBeVisible();
      await expect(page.locator('[data-testid="montreal-processing"]')).toContainText('Traitement au Québec');

      // Wait for recommendations
      await expect(page.locator('[data-testid="recommendations"]')).toBeVisible({ timeout: 30000 });

      // Verify evidence-based recommendations
      await expect(page.locator('[data-testid="treatment-options"]')).toBeVisible();
      await expect(page.locator('[data-testid="evidence-level"]')).toBeVisible();
      await expect(page.locator('[data-testid="quebec-guidelines"]')).toBeVisible();

      // Should include Quebec-specific resources
      await expect(page.locator('[data-testid="quebec-resources"]')).toContainText('Ordre des psychologues du Québec');
    });

    test('should validate recommendations with current literature', async ({ page }) => {
      await page.goto('/clinical-decision-support/validation');

      // Start literature validation
      await page.click('[data-testid="validate-recommendations"]');

      // Should check against Quebec clinical guidelines
      await expect(page.locator('[data-testid="validation-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="quebec-guidelines-check"]')).toContainText('Vérification en cours');

      // Show validation results
      await expect(page.locator('[data-testid="validation-complete"]')).toBeVisible({ timeout: 45000 });
      await expect(page.locator('[data-testid="guideline-compliance"]')).toContainText('Conforme');
      await expect(page.locator('[data-testid="evidence-quality"]')).toBeVisible();
    });
  });

  test.describe('Automated Documentation', () => {
    test('should generate session summaries automatically', async ({ page }) => {
      await page.goto('/appointments/session-notes');

      // Start session documentation
      await page.click('[data-testid="new-session-button"]');
      await page.selectOption('[data-testid="client-select"]', 'client_123');

      // Record session details
      await page.fill('[data-testid="session-duration"]', '60');
      await page.fill('[data-testid="session-type"]', 'Thérapie cognitive-comportementale');
      await page.fill('[data-testid="session-notes"]',
        'Discussion sur les techniques de gestion de l\'anxiété. ' +
        'Patient a pratiqué la respiration profonde. ' +
        'Devoirs: journal d\'humeur quotidien.'
      );

      // Generate AI summary
      await page.click('[data-testid="generate-ai-summary"]');

      // Should show processing status
      await expect(page.locator('[data-testid="summary-generating"]')).toBeVisible();

      // Wait for summary
      await expect(page.locator('[data-testid="ai-summary"]')).toBeVisible({ timeout: 30000 });

      // Verify summary quality
      const summary = await page.locator('[data-testid="ai-summary"]').textContent();
      expect(summary).toContain('anxiété');
      expect(summary).toContain('respiration');
      expect(summary).toContain('journal');

      // Should maintain professional language
      await expect(page.locator('[data-testid="professional-language-indicator"]')).toBeVisible();
    });

    test('should generate treatment plans with AI assistance', async ({ page }) => {
      await page.goto('/treatment-plans/new');

      // Select client and input assessment data
      await page.selectOption('[data-testid="client-select"]', 'client_123');
      await page.fill('[data-testid="assessment-summary"]',
        'Trouble anxieux généralisé, impact sur le sommeil et le travail'
      );

      // Request AI-generated treatment plan
      await page.click('[data-testid="generate-treatment-plan"]');

      // Should show Quebec-specific processing
      await expect(page.locator('[data-testid="quebec-processing-notice"]')).toBeVisible();

      // Wait for treatment plan generation
      await expect(page.locator('[data-testid="treatment-plan-generated"]')).toBeVisible({ timeout: 45000 });

      // Verify comprehensive treatment plan
      await expect(page.locator('[data-testid="treatment-goals"]')).toBeVisible();
      await expect(page.locator('[data-testid="intervention-strategies"]')).toBeVisible();
      await expect(page.locator('[data-testid="session-frequency"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-indicators"]')).toBeVisible();

      // Should include Quebec healthcare context
      await expect(page.locator('[data-testid="ramq-considerations"]')).toBeVisible();
    });
  });

  test.describe('Multilingual AI Support', () => {
    test('should process French medical terminology correctly', async ({ page }) => {
      await page.goto('/ai-analysis/french-medical');

      // Input French medical text
      await page.fill('[data-testid="french-medical-input"]',
        'Patient présente des symptômes de trouble bipolaire avec épisodes maniaques. ' +
        'Antécédents de dépression majeure. Médication: lithium 600mg.'
      );

      // Enable French language processing
      await page.check('[data-testid="french-language-mode"]');
      await page.click('[data-testid="analyze-french-text"]');

      // Should process in Quebec French
      await expect(page.locator('[data-testid="french-processing"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-indicator"]')).toContainText('Français (Québec)');

      // Wait for analysis
      await expect(page.locator('[data-testid="french-analysis-complete"]')).toBeVisible({ timeout: 30000 });

      // Verify French terminology recognition
      await expect(page.locator('[data-testid="recognized-terms"]')).toContainText('trouble bipolaire');
      await expect(page.locator('[data-testid="recognized-terms"]')).toContainText('épisodes maniaques');
      await expect(page.locator('[data-testid="medication-analysis"]')).toContainText('lithium');

      // Should provide French recommendations
      await expect(page.locator('[data-testid="recommendations"]')).toContainText('recommandations');
    });

    test('should handle code-switching between French and English', async ({ page }) => {
      await page.goto('/ai-analysis/multilingual');

      // Input mixed language text (common in Quebec healthcare)
      await page.fill('[data-testid="multilingual-input"]',
        'Patient reports anxiety symptoms. Présente des signes de GAD. ' +
        'Treatment plan includes CBT et médication si nécessaire.'
      );

      await page.click('[data-testid="analyze-multilingual"]');

      // Should handle mixed languages
      await expect(page.locator('[data-testid="multilingual-processing"]')).toBeVisible();
      await expect(page.locator('[data-testid="language-detection"]')).toContainText('Français/Anglais');

      // Wait for analysis
      await expect(page.locator('[data-testid="multilingual-analysis-complete"]')).toBeVisible({ timeout: 30000 });

      // Should extract terms from both languages
      await expect(page.locator('[data-testid="english-terms"]')).toContainText('anxiety');
      await expect(page.locator('[data-testid="french-terms"]')).toContainText('médication');
    });
  });

  test.describe('AI Audit and Compliance', () => {
    test('should log all AI interactions for audit', async ({ page }) => {
      await page.goto('/medical-notes/ai-analysis');

      // Perform AI analysis
      await page.fill('[data-testid="analysis-input"]', 'Test medical note for audit trail');
      await page.click('[data-testid="start-analysis"]');
      await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 30000 });

      // Check audit logs
      await page.goto('/admin/ai-audit-log');

      // Verify AI interaction is logged
      await expect(page.locator('[data-testid="ai-audit-entries"]')).toBeVisible();

      const latestEntry = page.locator('[data-testid="ai-audit-entry"]:first-child');
      await expect(latestEntry.locator('[data-testid="timestamp"]')).toBeVisible();
      await expect(latestEntry.locator('[data-testid="user-id"]')).toBeVisible();
      await expect(latestEntry.locator('[data-testid="ai-service"]')).toContainText('Vertex AI');
      await expect(latestEntry.locator('[data-testid="data-classification"]')).toContainText('Medical');
      await expect(latestEntry.locator('[data-testid="deidentification-status"]')).toContainText('Applied');
      await expect(latestEntry.locator('[data-testid="region"]')).toContainText('northamerica-northeast1');
    });

    test('should track AI model usage and compliance', async ({ page }) => {
      await page.goto('/admin/ai-compliance-dashboard');

      // Verify AI usage metrics
      await expect(page.locator('[data-testid="ai-usage-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-ai-requests"]')).toBeVisible();
      await expect(page.locator('[data-testid="deidentification-rate"]')).toContainText('100%');
      await expect(page.locator('[data-testid="quebec-processing-rate"]')).toContainText('100%');

      // Verify model compliance
      await expect(page.locator('[data-testid="model-compliance"]')).toBeVisible();
      await expect(page.locator('[data-testid="vertex-ai-status"]')).toContainText('Compliant');
      await expect(page.locator('[data-testid="data-residency-status"]')).toContainText('Quebec');

      // Should show compliance metrics over time
      await expect(page.locator('[data-testid="compliance-trend"]')).toBeVisible();
    });

    test('should generate AI compliance reports', async ({ page }) => {
      await page.goto('/admin/ai-compliance-reports');

      // Generate AI usage report
      await page.click('[data-testid="generate-ai-report"]');
      await page.selectOption('[data-testid="report-period"]', 'monthly');
      await page.check('[data-testid="include-compliance-metrics"]');

      // Should generate comprehensive report
      await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-ready"]')).toBeVisible({ timeout: 15000 });

      // Verify report contents
      await expect(page.locator('[data-testid="report-preview"]')).toContainText('Vertex AI');
      await expect(page.locator('[data-testid="report-preview"]')).toContainText('northamerica-northeast1');
      await expect(page.locator('[data-testid="report-preview"]')).toContainText('dé-identification');

      // Should be exportable for regulatory compliance
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-ai-compliance-report"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/ai-compliance-report.*\.pdf$/);
    });
  });
});