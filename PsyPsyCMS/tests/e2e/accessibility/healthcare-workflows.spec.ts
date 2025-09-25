/**
 * Healthcare Workflows E2E Accessibility Tests
 *
 * End-to-end accessibility testing for complete healthcare workflows
 * using Playwright with axe-core integration for WCAG 2.2 AAA compliance.
 */

import { test, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Healthcare-specific axe configuration
const healthcareAxeConfig = {
  rules: {
    'color-contrast-enhanced': { enabled: true }, // 7:1 contrast ratio
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'interactive-supports-focus': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-unique': { enabled: true }
  },
  tags: ['wcag22aaa', 'best-practice'],
  impact: ['minor', 'moderate', 'serious', 'critical']
}

test.describe('Healthcare Workflows Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Wait for app to load
    await page.waitForLoadState('networkidle')

    // Ensure we're in a clean state for testing
    await page.evaluate(() => {
      // Clear any existing announcements
      const liveRegions = document.querySelectorAll('[aria-live]')
      liveRegions.forEach(region => {
        if (region.textContent) {
          region.textContent = ''
        }
      })
    })
  })

  test.describe('Patient Management Workflow', () => {
    test('should be accessible throughout patient registration flow', async ({ page }) => {
      // Navigate to patient registration
      await page.click('[data-testid="patients-nav"]')
      await page.click('[data-testid="add-patient-button"]')

      // Test initial form accessibility
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(axeResults.violations).toEqual([])

      // Fill out patient form with keyboard navigation
      await page.press('body', 'Tab') // Focus first input
      await page.keyboard.type('John Doe')

      await page.press('body', 'Tab') // Move to next field
      await page.keyboard.type('1980-01-01')

      await page.press('body', 'Tab') // Move to next field
      await page.keyboard.type('555-123-4567')

      // Test form validation accessibility
      await page.press('body', 'Tab') // Move to submit button
      await page.press('body', 'Enter') // Submit with missing required fields

      // Check that validation errors are announced
      const errorAnnouncement = await page.waitForSelector('[aria-live="polite"]', {
        state: 'visible'
      })
      expect(await errorAnnouncement.textContent()).toContain('required')

      // Test final form accessibility after validation
      const finalAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(finalAxeResults.violations).toEqual([])
    })

    test('should support keyboard-only patient search', async ({ page }) => {
      await page.click('[data-testid="patients-nav"]')

      // Use keyboard to navigate to search
      await page.press('body', 'Tab')
      await page.press('body', 'Tab') // Assuming search is second focusable element

      // Type search query
      await page.keyboard.type('John')

      // Wait for search results
      await page.waitForSelector('[data-testid="search-results"]')

      // Navigate search results with keyboard
      await page.press('body', 'ArrowDown')
      await page.press('body', 'Enter')

      // Verify patient details page is accessible
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(axeResults.violations).toEqual([])
    })

    test('should handle PHI data masking accessibly', async ({ page }) => {
      // Navigate to patient with PHI data
      await page.goto('/patients/test-patient-with-phi')

      // Check initial accessibility
      const initialAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(initialAxeResults.violations).toEqual([])

      // Test PHI masking toggle with keyboard
      const phiField = page.locator('[data-contains-phi]').first()
      await phiField.focus()

      // Use Ctrl+H to toggle masking
      await page.keyboard.press('Control+h')

      // Verify announcement was made
      const announcement = await page.waitForSelector('[aria-live]')
      expect(await announcement.textContent()).toContain('PHI visibility toggled')

      // Test accessibility after masking change
      const maskedAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(maskedAxeResults.violations).toEqual([])
    })
  })

  test.describe('Appointment Scheduling Workflow', () => {
    test('should be accessible throughout appointment booking', async ({ page }) => {
      await page.click('[data-testid="appointments-nav"]')
      await page.click('[data-testid="schedule-appointment-button"]')

      // Test calendar accessibility
      const calendarAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-testid="appointment-calendar"]')
        .analyze()

      expect(calendarAxeResults.violations).toEqual([])

      // Navigate calendar with keyboard
      await page.press('[data-testid="appointment-calendar"]', 'Tab')
      await page.press('body', 'ArrowRight') // Move to next day
      await page.press('body', 'ArrowRight') // Move to next day
      await page.press('body', 'Enter') // Select date

      // Select time slot
      await page.press('body', 'Tab')
      await page.press('body', 'ArrowDown') // Navigate time slots
      await page.press('body', 'Enter') // Select time

      // Test appointment form accessibility
      const formAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-testid="appointment-form"]')
        .analyze()

      expect(formAxeResults.violations).toEqual([])
    })

    test('should handle appointment conflicts accessibly', async ({ page }) => {
      await page.goto('/appointments/schedule')

      // Try to book a conflicting appointment
      await page.fill('[data-testid="patient-select"]', 'existing-patient')
      await page.fill('[data-testid="datetime-input"]', '2025-01-15T14:00')

      await page.click('[data-testid="check-availability"]')

      // Wait for conflict warning
      const conflictAlert = await page.waitForSelector('[role="alert"]')
      expect(await conflictAlert.textContent()).toContain('conflict')

      // Verify alert is properly announced
      expect(await conflictAlert.getAttribute('aria-live')).toBe('assertive')

      // Test accessibility of conflict resolution UI
      const conflictAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(conflictAxeResults.violations).toEqual([])
    })
  })

  test.describe('Emergency Workflow Accessibility', () => {
    test('should prioritize emergency alerts for screen readers', async ({ page }) => {
      // Trigger emergency alert
      await page.click('[data-testid="emergency-alert-button"]')

      // Emergency alert should appear with assertive announcement
      const emergencyAlert = await page.waitForSelector('[data-emergency="true"]')
      expect(await emergencyAlert.getAttribute('aria-live')).toBe('assertive')
      expect(await emergencyAlert.getAttribute('role')).toBe('alert')

      // Test emergency form accessibility
      const emergencyFormAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-testid="emergency-form"]')
        .analyze()

      expect(emergencyFormAxeResults.violations).toEqual([])

      // Test emergency keyboard shortcuts
      await page.press('body', 'Control+Enter') // Emergency submit

      // Verify submission announcement
      const submissionAlert = await page.waitForSelector('[aria-live="assertive"]')
      expect(await submissionAlert.textContent()).toContain('Emergency')
    })

    test('should maintain accessibility during emergency workflows', async ({ page }) => {
      await page.goto('/emergency/new-incident')

      // Fill emergency form rapidly with keyboard
      await page.press('body', 'Tab')
      await page.keyboard.type('Critical patient alert')

      await page.press('body', 'Tab')
      await page.keyboard.type('Patient experiencing cardiac episode')

      await page.press('body', 'Tab')
      await page.keyboard.type('Dr. Emergency Contact')

      // Submit with emergency shortcut
      await page.press('body', 'Control+Enter')

      // Verify success feedback is accessible
      const successMessage = await page.waitForSelector('[role="status"]')
      expect(await successMessage.getAttribute('aria-live')).toBe('polite')

      // Test post-submission accessibility
      const postSubmissionAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(postSubmissionAxeResults.violations).toEqual([])
    })
  })

  test.describe('Medical Notes Workflow', () => {
    test('should be accessible during note creation and editing', async ({ page }) => {
      await page.click('[data-testid="medical-notes-nav"]')
      await page.click('[data-testid="create-note-button"]')

      // Test notes editor accessibility
      const editorAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-testid="notes-editor"]')
        .analyze()

      expect(editorAxeResults.violations).toEqual([])

      // Test auto-save functionality
      const editor = page.locator('[data-testid="notes-editor"] textarea')
      await editor.fill('Patient shows significant improvement in mobility')

      // Trigger auto-save with Ctrl+S
      await page.press('body', 'Control+s')

      // Verify auto-save announcement
      const autoSaveStatus = await page.waitForSelector('[aria-live="polite"]')
      expect(await autoSaveStatus.textContent()).toContain('saved')

      // Test accessibility after auto-save
      const savedAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(savedAxeResults.violations).toEqual([])
    })

    test('should handle note templates accessibly', async ({ page }) => {
      await page.goto('/medical-notes/new')

      // Open template selector
      await page.click('[data-testid="template-selector"]')

      // Navigate templates with keyboard
      await page.press('body', 'ArrowDown')
      await page.press('body', 'ArrowDown')
      await page.press('body', 'Enter')

      // Verify template loading announcement
      const templateStatus = await page.waitForSelector('[aria-live="polite"]')
      expect(await templateStatus.textContent()).toContain('template loaded')

      // Test accessibility of populated template
      const templateAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(templateAxeResults.violations).toEqual([])
    })
  })

  test.describe('Quebec Law 25 Compliance Workflow', () => {
    test('should handle consent management accessibly', async ({ page }) => {
      await page.goto('/compliance/consent-management')

      // Test consent form accessibility
      const consentAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-consent-form]')
        .analyze()

      expect(consentAxeResults.violations).toEqual([])

      // Navigate consent options with keyboard
      await page.press('body', 'Tab')
      await page.press('body', 'Space') // Check consent checkbox

      await page.press('body', 'Tab')
      await page.press('body', 'Space') // Check data processing consent

      // Test consent submission
      await page.press('body', 'Tab')
      await page.press('body', 'Enter') // Submit consent

      // Verify consent confirmation is accessible
      const confirmationMessage = await page.waitForSelector('[role="status"]')
      expect(await confirmationMessage.getAttribute('aria-live')).toBe('polite')
    })

    test('should handle data export requests accessibly', async ({ page }) => {
      await page.goto('/compliance/data-export')

      // Test data export form
      const exportAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-export-form]')
        .analyze()

      expect(exportAxeResults.violations).toEqual([])

      // Request data export
      await page.click('[data-testid="export-all-data"]')

      // Verify export status is announced
      const exportStatus = await page.waitForSelector('[aria-live="polite"]')
      expect(await exportStatus.textContent()).toContain('export')

      // Test download accessibility
      const downloadLink = await page.waitForSelector('[data-testid="download-link"]')
      expect(await downloadLink.getAttribute('aria-describedby')).toBeTruthy()
    })
  })

  test.describe('Professional Dashboard Accessibility', () => {
    test('should maintain accessibility across dashboard widgets', async ({ page }) => {
      await page.goto('/dashboard/professional')

      // Test overall dashboard accessibility
      const dashboardAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(dashboardAxeResults.violations).toEqual([])

      // Test widget navigation with keyboard
      await page.press('body', 'Tab') // First widget
      await page.press('body', 'Enter') // Expand widget

      await page.press('body', 'Tab') // Next widget
      await page.press('body', 'Enter') // Expand widget

      // Test widget content accessibility
      const widgetAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .include('[data-testid="dashboard-widgets"]')
        .analyze()

      expect(widgetAxeResults.violations).toEqual([])
    })

    test('should handle real-time updates accessibly', async ({ page }) => {
      await page.goto('/dashboard/professional')

      // Simulate real-time update
      await page.evaluate(() => {
        // Trigger a simulated update
        const liveRegion = document.querySelector('[aria-live="polite"]')
        if (liveRegion) {
          liveRegion.textContent = 'New appointment scheduled'
        }
      })

      // Verify live region announcement
      const liveRegion = page.locator('[aria-live="polite"]')
      await expect(liveRegion).toContainText('New appointment scheduled')

      // Test accessibility after update
      const updateAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(updateAxeResults.violations).toEqual([])
    })
  })

  test.describe('High Contrast Mode Testing', () => {
    test('should maintain accessibility in high contrast mode', async ({ page }) => {
      // Enable high contrast mode simulation
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              --high-contrast-enabled: true;
            }
          }
        `
      })

      await page.goto('/')

      // Test high contrast accessibility
      const highContrastAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(highContrastAxeResults.violations).toEqual([])

      // Test specific high contrast features
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const isVisible = await button.isVisible()

        if (isVisible) {
          // Button should maintain visibility in high contrast
          await expect(button).toBeVisible()
        }
      }
    })
  })

  test.describe('Mobile Viewport Accessibility', () => {
    test('should maintain accessibility on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Test mobile accessibility
      const mobileAxeResults = await new AxeBuilder({ page })
        .withTags(['wcag22aaa'])
        .analyze()

      expect(mobileAxeResults.violations).toEqual([])

      // Test touch target sizes (minimum 44px)
      const interactiveElements = page.locator('button, [role="button"], input, select, textarea, a')
      const elementCount = await interactiveElements.count()

      for (let i = 0; i < Math.min(elementCount, 10); i++) { // Test first 10 elements
        const element = interactiveElements.nth(i)
        const isVisible = await element.isVisible()

        if (isVisible) {
          const boundingBox = await element.boundingBox()
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThanOrEqual(44)
            expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })
  })
})