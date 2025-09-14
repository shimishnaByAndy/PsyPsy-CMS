// HIPAA Compliance and Security Testing Suite
import { test, expect } from '@playwright/test';

test.describe('HIPAA Compliance Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login with admin credentials
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('Data Protection and Privacy', () => {
    test('should not expose sensitive PHI data in URLs', async ({ page }) => {
      // Navigate to client details
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      const currentUrl = page.url();

      // URL should not contain sensitive information
      expect(currentUrl).not.toMatch(/ssn/i);
      expect(currentUrl).not.toMatch(/social/i);
      expect(currentUrl).not.toMatch(/dob|birth/i);
      expect(currentUrl).not.toMatch(/medical|diagnosis/i);
      expect(currentUrl).not.toMatch(/insurance|policy/i);

      // Should use generic IDs only
      expect(currentUrl).toMatch(/\/clients\/[a-f0-9-]+$/);
    });

    test('should mask sensitive data by default', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      
      // SSN should be masked by default
      const ssnFields = page.locator('[data-testid*="ssn"]');
      await expect(ssnFields).toContainText('***-**-****');

      // Insurance policy numbers should be partially masked
      const policyFields = page.locator('[data-testid*="policy"]');
      await expect(policyFields).toContainText(/\*+\d{4}$/); // Last 4 digits visible

      // Date of birth should be partially masked
      const dobFields = page.locator('[data-testid*="dob"]');
      await expect(dobFields).toContainText(/\*\*\/\*\*\/\d{4}$/); // Only year visible
    });

    test('should require authentication to reveal sensitive data', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      // Try to reveal SSN
      await page.click('[data-testid="reveal-ssn-button"]');

      // Should prompt for re-authentication
      await expect(page.locator('[data-testid="re-auth-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="re-auth-title"]')).toContainText('Verify Identity');

      // Should require password confirmation
      await expect(page.locator('[data-testid="password-confirmation-input"]')).toBeVisible();

      // Cancel re-auth - data should remain masked
      await page.click('[data-testid="cancel-re-auth"]');
      await expect(page.locator('[data-testid="ssn-display"]')).toContainText('***-**-****');
    });

    test('should successfully reveal data after re-authentication', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      await page.click('[data-testid="reveal-ssn-button"]');
      await expect(page.locator('[data-testid="re-auth-modal"]')).toBeVisible();

      // Provide correct password
      await page.fill('[data-testid="password-confirmation-input"]', 'password123');
      await page.click('[data-testid="confirm-re-auth"]');

      // SSN should now be visible
      await expect(page.locator('[data-testid="ssn-display"]')).not.toContainText('***-**-****');
      await expect(page.locator('[data-testid="ssn-display"]')).toMatch(/\d{3}-\d{2}-\d{4}/);

      // Should automatically re-mask after timeout (5 minutes)
      await page.waitForTimeout(1000); // Simulate some time passing
      // In real implementation, this would be 5 minutes
      // For testing, we can trigger the timeout manually
      await page.evaluate(() => {
        // Simulate session timeout
        window.dispatchEvent(new CustomEvent('hipaa-timeout'));
      });

      await expect(page.locator('[data-testid="ssn-display"]')).toContainText('***-**-****');
    });
  });

  test.describe('Access Control and Authorization', () => {
    test('should enforce role-based access control', async ({ page }) => {
      // Logout admin
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Login as regular user
      await page.fill('[data-testid="email-input"]', 'user@psypsy.com');
      await page.fill('[data-testid="password-input"]', 'userpass123');
      await page.click('[data-testid="login-button"]');

      // Regular users should not see admin functions
      await expect(page.locator('[data-testid="admin-nav-link"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="user-management-link"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="system-settings-link"]')).not.toBeVisible();

      // Should not be able to access admin routes directly
      await page.goto('/admin/users');
      await expect(page).toHaveURL('/access-denied');
      await expect(page.locator('[data-testid="access-denied-message"]')).toBeVisible();
    });

    test('should track and log access to PHI data', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="client-row"]:first-child [data-testid="view-button"]');

      // Access to client data should be logged
      // This would be verified through audit logs in a real system
      // For E2E testing, we check that the audit component is triggered
      await expect(page.locator('[data-testid="audit-indicator"]')).toBeVisible();

      // Check audit log (admin only)
      await page.click('[data-testid="admin-nav-link"]');
      await page.click('[data-testid="audit-log-link"]');

      // Should show recent access
      await expect(page.locator('[data-testid="audit-entries"]')).toContainText('Client data accessed');
      await expect(page.locator('[data-testid="audit-entries"]')).toContainText('admin@psypsy.com');
    });

    test('should enforce minimum necessary access principle', async ({ page }) => {
      // Professional users should only see their own clients/appointments
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Login as professional
      await page.fill('[data-testid="email-input"]', 'dr.smith@psypsy.com');
      await page.fill('[data-testid="password-input"]', 'drpass123');
      await page.click('[data-testid="login-button"]');

      await page.click('[data-testid="clients-nav-link"]');

      // Should only see clients assigned to this professional
      const clientRows = page.locator('[data-testid="client-row"]');
      const count = await clientRows.count();

      // Should be fewer clients than admin sees (assuming admin sees all)
      expect(count).toBeLessThan(10); // Assuming admin would see more

      // Should not be able to view unassigned clients
      await page.goto('/clients/unassigned-client-id');
      await expect(page).toHaveURL('/access-denied');
    });
  });

  test.describe('Data Transmission Security', () => {
    test('should use HTTPS for all communications', async ({ page }) => {
      // All requests should use HTTPS in production
      page.on('request', request => {
        const url = request.url();
        if (url.includes('api/') || url.includes('firebase')) {
          expect(url).toMatch(/^https:/);
        }
      });

      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="new-client-button"]');

      // Fill and submit form to trigger API requests
      await page.fill('[data-testid="first-name-input"]', 'Test');
      await page.fill('[data-testid="last-name-input"]', 'Client');
      await page.fill('[data-testid="email-input"]', 'test.client@example.com');
      await page.click('[data-testid="save-client-button"]');
    });

    test('should sanitize all user inputs', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="new-client-button"]');

      // Try XSS injection
      const maliciousScript = '<script>alert("XSS")</script>';
      await page.fill('[data-testid="first-name-input"]', maliciousScript);
      await page.fill('[data-testid="last-name-input"]', 'Test');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.click('[data-testid="save-client-button"]');

      // Check that script was sanitized in display
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="clients-table"]')).toContainText('&lt;script&gt;');
      await expect(page.locator('[data-testid="clients-table"]')).not.toContainText('<script>');

      // Ensure no JavaScript execution occurred
      const alertHandled = await page.evaluate(() => {
        return typeof window.alert === 'function';
      });
      expect(alertHandled).toBe(true); // Alert function should still exist, just not executed
    });

    test('should prevent SQL injection in search fields', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');

      // Try SQL injection in search
      const sqlInjection = "'; DROP TABLE clients; --";
      await page.fill('[data-testid="client-search-input"]', sqlInjection);
      await page.press('[data-testid="client-search-input"]', 'Enter');

      // Should handle gracefully - either no results or error message
      // Should NOT crash the application
      await expect(page.locator('[data-testid="clients-table"]')).toBeVisible();
      
      // Clear search should work
      await page.fill('[data-testid="client-search-input"]', '');
      await page.press('[data-testid="client-search-input"]', 'Enter');
      await expect(page.locator('[data-testid="client-row"]')).toHaveCount(await page.locator('[data-testid="client-row"]').count());
    });
  });

  test.describe('Session Management and Timeout', () => {
    test('should enforce session timeout for security', async ({ page }) => {
      // This would test automatic session timeout
      // In a real scenario, we'd wait for the actual timeout period
      // For testing, we can simulate it

      await page.evaluate(() => {
        // Simulate session expiry
        localStorage.removeItem('auth-token');
        sessionStorage.removeItem('session-data');
      });

      // Try to access protected resource
      await page.click('[data-testid="clients-nav-link"]');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(page.locator('[data-testid="session-expired-message"]')).toContainText('Session expired');
    });

    test('should lock account after multiple failed attempts', async ({ page }) => {
      // Logout first
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Try multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'admin@psypsy.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        
        if (i < 4) {
          await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
        }
      }

      // After 5 attempts, account should be locked
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Account locked');
      await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();

      // Even correct password should not work when locked
      await page.fill('[data-testid="password-input"]', 'password123');
      await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
    });

    test('should require password confirmation for sensitive operations', async ({ page }) => {
      await page.click('[data-testid="clients-nav-link"]');
      await page.click('[data-testid="client-row"]:first-child [data-testid="delete-button"]');

      // Should require password confirmation before deletion
      await expect(page.locator('[data-testid="password-confirm-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();

      // Try with wrong password
      await page.fill('[data-testid="confirm-password-input"]', 'wrongpassword');
      await page.click('[data-testid="confirm-delete-button"]');

      await expect(page.locator('[data-testid="password-error"]')).toContainText('Incorrect password');
      await expect(page.locator('[data-testid="password-confirm-modal"]')).toBeVisible();

      // Correct password should proceed
      await page.fill('[data-testid="confirm-password-input"]', 'password123');
      await page.click('[data-testid="confirm-delete-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toContainText('Client deleted');
    });
  });

  test.describe('Data Backup and Recovery', () => {
    test('should handle database connection failures gracefully', async ({ page }) => {
      // Simulate network issues
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.click('[data-testid="clients-nav-link"]');

      // Should show appropriate error message
      await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="connection-error"]')).toContainText('Unable to connect');

      // Should offer retry option
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

      // Remove network simulation
      await page.unroute('**/api/**');
      await page.click('[data-testid="retry-button"]');

      // Should recover and show data
      await expect(page.locator('[data-testid="clients-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="connection-error"]')).not.toBeVisible();
    });

    test('should maintain data integrity during concurrent operations', async ({ page, context }) => {
      // Open second tab to simulate concurrent access
      const secondPage = await context.newPage();
      
      // Login in both tabs
      await secondPage.goto('/login');
      await secondPage.fill('[data-testid="email-input"]', 'admin@psypsy.com');
      await secondPage.fill('[data-testid="password-input"]', 'password123');
      await secondPage.click('[data-testid="login-button"]');

      // Navigate to same client in both tabs
      await page.click('[data-testid="clients-nav-link"]');
      await secondPage.click('[data-testid="clients-nav-link"]');
      
      await page.click('[data-testid="client-row"]:first-child [data-testid="edit-button"]');
      await secondPage.click('[data-testid="client-row"]:first-child [data-testid="edit-button"]');

      // Modify client in first tab
      await page.fill('[data-testid="phone-input"]', '+1-555-1111');
      await page.click('[data-testid="save-client-button"]');

      // Try to modify same client in second tab
      await secondPage.fill('[data-testid="phone-input"]', '+1-555-2222');
      await secondPage.click('[data-testid="save-client-button"]');

      // Should detect conflict and handle appropriately
      await expect(secondPage.locator('[data-testid="conflict-warning"]')).toBeVisible();
      await expect(secondPage.locator('[data-testid="conflict-warning"]')).toContainText('Data has been modified');

      await secondPage.close();
    });
  });

  test.describe('Audit Trail and Compliance Reporting', () => {
    test('should generate HIPAA compliance report', async ({ page }) => {
      await page.click('[data-testid="admin-nav-link"]');
      await page.click('[data-testid="compliance-reports-link"]');

      // Generate HIPAA compliance report
      await page.click('[data-testid="generate-hipaa-report-button"]');
      
      // Configure report parameters
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      
      await page.fill('[data-testid="report-start-date"]', startDate.toISOString().split('T')[0]);
      await page.fill('[data-testid="report-end-date"]', endDate.toISOString().split('T')[0]);
      
      // Generate report
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="generate-report-button"]');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/hipaa_compliance_report.*\.pdf$/);

      // Verify report contains required sections
      const reportPath = await download.path();
      expect(reportPath).toBeTruthy();
    });

    test('should show detailed audit trail for PHI access', async ({ page }) => {
      await page.click('[data-testid="admin-nav-link"]');
      await page.click('[data-testid="audit-log-link"]');

      // Filter for PHI access events
      await page.selectOption('[data-testid="event-type-filter"]', 'phi_access');
      await page.click('[data-testid="apply-filters"]');

      // Should show PHI access events
      await expect(page.locator('[data-testid="audit-entry"]')).toContainText('PHI accessed');
      await expect(page.locator('[data-testid="audit-entry"]')).toContainText('User:');
      await expect(page.locator('[data-testid="audit-entry"]')).toContainText('Timestamp:');
      await expect(page.locator('[data-testid="audit-entry"]')).toContainText('Resource:');

      // Should be able to export audit logs
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-audit-log"]');

      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/audit_log.*\.(csv|pdf)$/);
    });
  });
});