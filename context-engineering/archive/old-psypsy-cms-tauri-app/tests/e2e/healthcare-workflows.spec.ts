// Healthcare-specific E2E tests for Tauri desktop application
import { test, expect } from '@playwright/test';

test.describe('Healthcare Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Client Onboarding Workflow', () => {
    test('should complete full client onboarding process', async ({ page }) => {
      // Navigate to client management
      await page.click('[data-testid="clients-nav-link"]');
      await expect(page).toHaveURL('/clients');

      // Start new client creation
      await page.click('[data-testid="new-client-button"]');
      await expect(page.locator('[data-testid="client-form"]')).toBeVisible();

      // Fill basic information
      await page.fill('[data-testid="first-name-input"]', 'Sarah');
      await page.fill('[data-testid="last-name-input"]', 'Johnson');
      await page.fill('[data-testid="email-input"]', 'sarah.johnson@example.com');
      await page.fill('[data-testid="phone-input"]', '+1-555-0123');
      await page.fill('[data-testid="date-of-birth-input"]', '1985-03-15');

      // Fill emergency contact
      await page.click('[data-testid="emergency-contact-section"]');
      await page.fill('[data-testid="emergency-name-input"]', 'Michael Johnson');
      await page.fill('[data-testid="emergency-phone-input"]', '+1-555-0124');
      await page.selectOption('[data-testid="emergency-relationship"]', 'spouse');

      // Fill insurance information
      await page.click('[data-testid="insurance-section"]');
      await page.fill('[data-testid="insurance-provider-input"]', 'Blue Cross Blue Shield');
      await page.fill('[data-testid="policy-number-input"]', 'BCBS123456789');
      await page.fill('[data-testid="group-number-input"]', 'GRP001');

      // Submit form
      await page.click('[data-testid="save-client-button"]');

      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Client created successfully');

      // Verify client appears in list
      await expect(page.locator('[data-testid="clients-table"]')).toContainText('Sarah Johnson');
      await expect(page.locator('[data-testid="clients-table"]')).toContainText('sarah.johnson@example.com');
    });

    test('should validate required fields during onboarding', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="new-client-button"]');

      // Try to submit without filling required fields
      await page.click('[data-testid="save-client-button"]');

      // Should show validation errors
      await expect(page.locator('[data-testid="field-error-first-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="field-error-last-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="field-error-email"]')).toBeVisible();

      // Form should not be submitted
      await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
    });

    test('should validate email format during onboarding', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="new-client-button"]');

      await page.fill('[data-testid="first-name-input"]', 'Test');
      await page.fill('[data-testid="last-name-input"]', 'User');
      await page.fill('[data-testid="email-input"]', 'invalid-email-format');

      await page.click('[data-testid="save-client-button"]');

      await expect(page.locator('[data-testid="field-error-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="field-error-email"]')).toContainText('Invalid email format');
    });
  });

  test.describe('Appointment Scheduling Workflow', () => {
    test('should schedule new appointment successfully', async ({ page }) => {
      await page.click('[data-testid="appointments-nav-link"]');
      await expect(page).toHaveURL('/appointments');

      // Start new appointment
      await page.click('[data-testid="new-appointment-button"]');
      await expect(page.locator('[data-testid="appointment-form"]')).toBeVisible();

      // Select client
      await page.click('[data-testid="client-select"]');
      await page.click('[data-testid="client-option"]:first-child');

      // Select professional
      await page.click('[data-testid="professional-select"]');
      await page.click('[data-testid="professional-option"]:first-child');

      // Select appointment type
      await page.selectOption('[data-testid="appointment-type-select"]', 'consultation');

      // Select date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('[data-testid="appointment-date-input"]', tomorrowString);

      // Select time
      await page.selectOption('[data-testid="appointment-time-select"]', '10:00');

      // Add notes
      await page.fill('[data-testid="appointment-notes"]', 'Initial consultation for anxiety treatment');

      // Schedule appointment
      await page.click('[data-testid="schedule-appointment-button"]');

      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Appointment scheduled successfully');

      // Verify appointment appears in calendar
      await expect(page.locator('[data-testid="appointment-item"]')).toContainText('Initial consultation');
    });

    test('should detect and prevent appointment conflicts', async ({ page }) => {
      await page.click('[data-testid="appointments-nav-link"]');
      await page.click('[data-testid="new-appointment-button"]');

      // Try to schedule at a conflicting time (same professional, overlapping time)
      await page.click('[data-testid="client-select"]');
      await page.click('[data-testid="client-option"]:first-child');
      await page.click('[data-testid="professional-select"]');
      await page.click('[data-testid="professional-option"]:first-child');

      // Set conflicting date/time (assume there's already an appointment at 10:00)
      const today = new Date().toISOString().split('T')[0];
      await page.fill('[data-testid="appointment-date-input"]', today);
      await page.selectOption('[data-testid="appointment-time-select"]', '10:00');

      // Should show conflict warning
      await expect(page.locator('[data-testid="conflict-warning"]')).toBeVisible();
      await expect(page.locator('[data-testid="conflict-warning"]')).toContainText('Time slot unavailable');

      // Schedule button should be disabled
      await expect(page.locator('[data-testid="schedule-appointment-button"]')).toBeDisabled();
    });

    test('should show available time slots based on professional schedule', async ({ page }) => {
      await page.click('[data-testid="appointments-nav-link"]');
      await page.click('[data-testid="new-appointment-button"]');

      // Select professional first
      await page.click('[data-testid="professional-select"]');
      await page.click('[data-testid="professional-option"]:first-child');

      // Select date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      await page.fill('[data-testid="appointment-date-input"]', tomorrowString);

      // Should show only available time slots (9 AM - 5 PM for most professionals)
      const timeOptions = page.locator('[data-testid="appointment-time-select"] option');
      await expect(timeOptions).toContainText(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
      
      // Should not show early morning or late evening slots
      await expect(timeOptions).not.toContainText(['08:00', '18:00', '19:00']);
    });
  });

  test.describe('Professional Management Workflow', () => {
    test('should add new professional with credentials', async ({ page }) => {
      await page.click('[data-testid="professionals-nav-link"]');
      await expect(page).toHaveURL('/professionals');

      await page.click('[data-testid="new-professional-button"]');

      // Fill professional information
      await page.fill('[data-testid="first-name-input"]', 'Dr. Emily');
      await page.fill('[data-testid="last-name-input"]', 'Chen');
      await page.fill('[data-testid="email-input"]', 'dr.emily.chen@psypsy.com');
      await page.fill('[data-testid="phone-input"]', '+1-555-0200');

      // Fill credentials
      await page.selectOption('[data-testid="specialization-select"]', 'clinical-psychology');
      await page.fill('[data-testid="license-number-input"]', 'PSY54321');
      await page.selectOption('[data-testid="license-state-select"]', 'CA');
      await page.fill('[data-testid="license-expiry-input"]', '2026-12-31');

      // Set rates
      await page.fill('[data-testid="consultation-rate-input"]', '150');
      await page.fill('[data-testid="therapy-rate-input']', '120');

      // Set working hours
      await page.check('[data-testid="monday-available"]');
      await page.fill('[data-testid="monday-start"]', '09:00');
      await page.fill('[data-testid="monday-end"]', '17:00');
      
      await page.check('[data-testid="tuesday-available"]');
      await page.fill('[data-testid="tuesday-start"]', '09:00');
      await page.fill('[data-testid="tuesday-end"]', '17:00');

      // Save professional
      await page.click('[data-testid="save-professional-button"]');

      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="professionals-table"]')).toContainText('Dr. Emily Chen');
    });

    test('should validate professional license requirements', async ({ page }) => {
      await page.click('[data-testid="professionals-nav-link"]');
      await page.click('[data-testid="new-professional-button"]');

      // Fill basic info but miss license requirements
      await page.fill('[data-testid="first-name-input"]', 'Dr. Test');
      await page.fill('[data-testid="last-name-input"]', 'Professional');
      await page.fill('[data-testid="email-input"]', 'test@psypsy.com');

      // Try to save without license info
      await page.click('[data-testid="save-professional-button"]');

      // Should show validation errors for required license fields
      await expect(page.locator('[data-testid="field-error-license-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="field-error-license-state"]')).toBeVisible();
      await expect(page.locator('[data-testid="field-error-specialization"]')).toBeVisible();
    });
  });

  test.describe('Dashboard Analytics Workflow', () => {
    test('should display key healthcare metrics', async ({ page }) => {
      await page.goto('/dashboard');

      // Verify key metrics are displayed
      await expect(page.locator('[data-testid="total-clients-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-appointments-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-professionals-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="monthly-revenue-metric"]')).toBeVisible();

      // Verify charts are loaded
      await expect(page.locator('[data-testid="appointments-trend-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-satisfaction-chart"]')).toBeVisible();

      // Check that metrics have actual values (not just placeholders)
      const totalClients = page.locator('[data-testid="total-clients-value"]');
      await expect(totalClients).not.toHaveText('0');
      await expect(totalClients).not.toHaveText('--');
    });

    test('should filter dashboard data by date range', async ({ page }) => {
      await page.goto('/dashboard');

      // Change date range to last 30 days
      await page.click('[data-testid="date-range-selector"]');
      await page.click('[data-testid="last-30-days-option"]');

      // Wait for data to reload
      await page.waitForLoadState('networkidle');

      // Verify data updates
      await expect(page.locator('[data-testid="date-range-display"]')).toContainText('Last 30 Days');
      
      // Charts should update (check for loading states)
      await expect(page.locator('[data-testid="chart-loading"]')).not.toBeVisible({ timeout: 5000 });
    });

    test('should navigate to detailed reports from dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Click on appointments metric to see detailed report
      await page.click('[data-testid="total-appointments-metric"]');
      await expect(page).toHaveURL('/reports/appointments');

      // Go back to dashboard
      await page.goBack();

      // Click on revenue chart to see financial report
      await page.click('[data-testid="revenue-chart"]');
      await expect(page).toHaveURL('/reports/financial');
    });
  });

  test.describe('Search and Filter Workflow', () => {
    test('should search clients by name and email', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');

      // Search by first name
      await page.fill('[data-testid="client-search-input"]', 'John');
      await page.press('[data-testid="client-search-input"]', 'Enter');

      // Should filter results
      const clientRows = page.locator('[data-testid="client-row"]');
      await expect(clientRows).toContainText('John');
      
      // Clear search
      await page.fill('[data-testid="client-search-input"]', '');
      await page.press('[data-testid="client-search-input"]', 'Enter');
      
      // Should show all clients again
      await expect(clientRows.count()).toBeGreaterThan(1);
    });

    test('should filter appointments by status and date', async ({ page }) => {
      await page.click('[data-testid="appointments-nav-link"]');

      // Filter by status
      await page.selectOption('[data-testid="status-filter"]', 'scheduled');
      
      // Should show only scheduled appointments
      const appointmentRows = page.locator('[data-testid="appointment-row"]');
      const statusCells = page.locator('[data-testid="appointment-status"]');
      await expect(statusCells).toContainText('Scheduled');

      // Filter by date range
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekString = nextWeek.toISOString().split('T')[0];

      await page.fill('[data-testid="date-from-filter"]', today);
      await page.fill('[data-testid="date-to-filter"]', nextWeekString);
      await page.click('[data-testid="apply-filters-button"]');

      // Should show only appointments in the specified range
      await expect(page.locator('[data-testid="no-future-appointments"]')).not.toBeVisible();
    });
  });

  test.describe('Data Export and Reporting', () => {
    test('should export client data to CSV', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');

      // Start download process
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-clients-button"]');
      await page.click('[data-testid="export-csv-option"]');

      const download = await downloadPromise;

      // Verify file downloaded
      expect(download.suggestedFilename()).toMatch(/clients.*\.csv$/);
      
      // Save and verify file content
      const path = await download.path();
      expect(path).toBeTruthy();
    });

    test('should generate appointment report', async ({ page }) => {
      await page.click('[data-testid="appointments-nav-link"]');
      await page.click('[data-testid="generate-report-button"]');

      // Configure report parameters
      await page.selectOption('[data-testid="report-type"]', 'monthly');
      await page.selectOption('[data-testid="report-format"]', 'pdf');
      
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      await page.fill('[data-testid="report-start-date"]', firstDayOfMonth.toISOString().split('T')[0]);
      await page.fill('[data-testid="report-end-date"]', lastDayOfMonth.toISOString().split('T')[0]);

      // Generate report
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="generate-report-submit"]');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/appointments_report.*\.pdf$/);
    });
  });

  test.describe('Mobile Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Login should work on mobile
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Dashboard should be responsive
      await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
      
      // Navigation should use mobile menu
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();

      // Forms should be mobile-friendly
      await page.click('[data-testid="mobile-nav-clients"]');
      await page.click('[data-testid="new-client-button"]');
      
      // Form inputs should be properly sized for mobile
      const nameInput = page.locator('[data-testid="first-name-input"]');
      const inputBox = await nameInput.boundingBox();
      expect(inputBox?.width).toBeGreaterThan(200); // Should be adequately wide
    });
  });

  test.describe('Offline Capabilities', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
      // Go online first and load data
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="dashboard-loaded"]')).toBeVisible();

      // Go offline
      await context.setOffline(true);

      // Navigate to clients - should show cached data
      await page.click('[data-testid="clients-nav-link"]');
      
      // Should show offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Should still show previously loaded data
      await expect(page.locator('[data-testid="clients-table"]')).toBeVisible();
      
      // Should show appropriate messages for actions requiring network
      await page.click('[data-testid="new-client-button"]');
      await expect(page.locator('[data-testid="offline-warning"]')).toContainText('This action requires internet connection');

      // Go back online
      await context.setOffline(false);
      
      // Should sync data and remove offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible({ timeout: 10000 });
    });
  });
});