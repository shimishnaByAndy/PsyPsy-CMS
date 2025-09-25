/**
 * Healthcare Cards Accessibility Tests
 *
 * Comprehensive accessibility testing for healthcare card components
 * following WCAG 2.2 AAA standards and healthcare compliance requirements.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  renderWithAccessibility,
  runHealthcareAccessibilityTests,
  testKeyboardNavigation,
  testUser
} from '../../../src/test/accessibility-utils'

// Import healthcare components
import { HealthcareCard } from '../../../src/components/ui/healthcare/HealthcareCard'
import { HealthcareButton } from '../../../src/components/ui/healthcare/HealthcareButton'

describe('Healthcare Cards Accessibility', () => {
  beforeEach(() => {
    // Reset any global state before each test
    document.body.innerHTML = ''
  })

  describe('HealthcareCard Component', () => {
    it('should meet WCAG AAA accessibility standards', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareCard
          title="Patient Information"
          variant="patient"
          data-testid="patient-card"
        >
          <p>Patient details content</p>
        </HealthcareCard>
      )

      await runHealthcareAccessibilityTests(container)
    })

    it('should have proper semantic structure with landmarks', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Medical Record"
          variant="medical"
          data-testid="medical-card"
        >
          <div>Medical record content</div>
        </HealthcareCard>
      )

      const card = screen.getByTestId('medical-card')

      // Card should have proper role
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label')

      // Title should be properly structured
      const title = screen.getByText('Medical Record')
      expect(title).toBeInTheDocument()
    })

    it('should support keyboard navigation for interactive cards', async () => {
      const onCardClick = vi.fn()

      renderWithAccessibility(
        <HealthcareCard
          title="Clickable Patient Card"
          variant="patient"
          onClick={onCardClick}
          data-testid="clickable-card"
        >
          <p>Patient summary information</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('clickable-card')

      // Interactive cards should be keyboard accessible
      expect(card).toHaveAttribute('tabindex', '0')
      expect(card).toHaveAttribute('role', 'button')

      // Test keyboard activation
      card.focus()
      await testUser.keyboard('{Enter}')
      expect(onCardClick).toHaveBeenCalledTimes(1)

      await testUser.keyboard(' ')
      expect(onCardClick).toHaveBeenCalledTimes(2)
    })

    it('should provide proper focus management for card actions', async () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Patient Actions Card"
          variant="patient"
          data-testid="actions-card"
        >
          <div>
            <p>Patient information</p>
            <div>
              <HealthcareButton
                variant="primary"
                data-testid="edit-button"
              >
                Edit Patient
              </HealthcareButton>
              <HealthcareButton
                variant="secondary"
                data-testid="view-button"
              >
                View History
              </HealthcareButton>
            </div>
          </div>
        </HealthcareCard>
      )

      // Test tab order within card
      await testUser.tab()
      expect(screen.getByTestId('edit-button')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('view-button')).toHaveFocus()
    })

    it('should provide emergency card accessibility with assertive announcements', () => {
      const { container } = renderWithAccessibility(
        <HealthcareCard
          title="Emergency Alert"
          variant="emergency"
          isEmergency
          data-testid="emergency-card"
        >
          <p>Critical patient alert information</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('emergency-card')

      // Emergency cards should have assertive live regions
      expect(card).toHaveAttribute('role', 'alert')
      expect(card).toHaveAttribute('aria-live', 'assertive')

      // Emergency styling should be announced
      expect(card).toHaveAttribute('aria-label')
      expect(card.getAttribute('aria-label')).toContain('Emergency')
    })

    it('should handle PHI content with proper privacy indicators', () => {
      const { container } = renderWithAccessibility(
        <HealthcareCard
          title="Confidential Medical Information"
          variant="confidential"
          containsPHI
          data-testid="phi-card"
        >
          <p>Protected health information content</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('phi-card')

      // PHI cards should have proper indicators
      expect(card).toHaveAttribute('data-contains-phi')
      expect(card).toHaveAttribute('aria-describedby')

      // Should have visual PHI indicator
      const phiIndicator = container.querySelector('[data-phi-indicator]')
      expect(phiIndicator).toBeInTheDocument()
    })
  })

  describe('Card Variants Accessibility', () => {
    it('should provide proper context for patient cards', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="John Doe - Patient #12345"
          variant="patient"
          data-testid="patient-variant"
        >
          <p>Date of Birth: January 1, 1980</p>
          <p>Primary Physician: Dr. Smith</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('patient-variant')

      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label')
      expect(card.getAttribute('aria-label')).toContain('Patient card')
    })

    it('should provide proper context for appointment cards', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Upcoming Appointment"
          variant="appointment"
          data-testid="appointment-variant"
        >
          <p>Date: Tomorrow at 2:00 PM</p>
          <p>With: Dr. Johnson</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('appointment-variant')

      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label')
      expect(card.getAttribute('aria-label')).toContain('Appointment card')
    })

    it('should provide proper context for medical record cards', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Lab Results - Blood Work"
          variant="medical"
          data-testid="medical-variant"
        >
          <p>Date: Last week</p>
          <p>Status: Normal ranges</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('medical-variant')

      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label')
      expect(card.getAttribute('aria-label')).toContain('Medical record card')
    })

    it('should provide proper context for compliance cards', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Audit Trail"
          variant="compliance"
          data-testid="compliance-variant"
        >
          <p>Last accessed: 2 hours ago</p>
          <p>By: Dr. Wilson</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('compliance-variant')

      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label')
      expect(card.getAttribute('aria-label')).toContain('Compliance record card')
    })
  })

  describe('Card Loading States Accessibility', () => {
    it('should announce loading state to screen readers', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Patient Information"
          variant="patient"
          isLoading
          data-testid="loading-card"
        >
          <p>Loading patient data...</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('loading-card')

      expect(card).toHaveAttribute('aria-busy', 'true')
      expect(card).toHaveAttribute('aria-live', 'polite')

      // Loading indicator should be accessible
      const loadingText = screen.getByText(/Loading/)
      expect(loadingText).toBeInTheDocument()
    })

    it('should handle error states accessibly', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Patient Information"
          variant="patient"
          hasError
          errorMessage="Failed to load patient data"
          data-testid="error-card"
        >
          <p>Error loading data</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('error-card')

      expect(card).toHaveAttribute('role', 'alert')
      expect(card).toHaveAttribute('aria-live', 'assertive')

      // Error message should be accessible
      const errorMessage = screen.getByText('Failed to load patient data')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('Card High Contrast Support', () => {
    it('should maintain visibility in high contrast mode', () => {
      // Simulate high contrast mode
      const style = document.createElement('style')
      style.textContent = `
        @media (prefers-contrast: high) {
          .healthcare-card {
            --card-border: 2px solid;
            --card-background: transparent;
          }
        }
      `
      document.head.appendChild(style)

      renderWithAccessibility(
        <HealthcareCard
          title="High Contrast Test Card"
          variant="patient"
          data-testid="high-contrast-card"
        >
          <p>Card content for high contrast testing</p>
        </HealthcareCard>
      )

      const card = screen.getByTestId('high-contrast-card')

      // Card should maintain accessibility in high contrast
      expect(card).toBeVisible()
      expect(card).toHaveAttribute('role')

      document.head.removeChild(style)
    })
  })

  describe('Card Collections Accessibility', () => {
    it('should maintain proper navigation in card grids', async () => {
      renderWithAccessibility(
        <div role="grid" aria-label="Patient Cards">
          <div role="row">
            <HealthcareCard
              title="Patient A"
              variant="patient"
              onClick={vi.fn()}
              data-testid="patient-a"
            >
              <p>Patient A details</p>
            </HealthcareCard>
            <HealthcareCard
              title="Patient B"
              variant="patient"
              onClick={vi.fn()}
              data-testid="patient-b"
            >
              <p>Patient B details</p>
            </HealthcareCard>
          </div>
          <div role="row">
            <HealthcareCard
              title="Patient C"
              variant="patient"
              onClick={vi.fn()}
              data-testid="patient-c"
            >
              <p>Patient C details</p>
            </HealthcareCard>
            <HealthcareCard
              title="Patient D"
              variant="patient"
              onClick={vi.fn()}
              data-testid="patient-d"
            >
              <p>Patient D details</p>
            </HealthcareCard>
          </div>
        </div>
      )

      // Test navigation through card grid
      await testUser.tab()
      expect(screen.getByTestId('patient-a')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('patient-b')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('patient-c')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('patient-d')).toHaveFocus()
    })

    it('should provide proper list semantics for card lists', () => {
      renderWithAccessibility(
        <div role="list" aria-label="Recent Medical Records">
          <HealthcareCard
            title="Blood Test Results"
            variant="medical"
            role="listitem"
            data-testid="blood-test"
          >
            <p>Normal ranges</p>
          </HealthcareCard>
          <HealthcareCard
            title="X-Ray Results"
            variant="medical"
            role="listitem"
            data-testid="xray"
          >
            <p>No abnormalities found</p>
          </HealthcareCard>
          <HealthcareCard
            title="Prescription History"
            variant="medical"
            role="listitem"
            data-testid="prescriptions"
          >
            <p>Current medications</p>
          </HealthcareCard>
        </div>
      )

      // Check list structure
      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-label', 'Recent Medical Records')

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })
  })

  describe('Card Interactive Elements', () => {
    it('should handle complex interactive content accessibly', async () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Patient Management"
          variant="patient"
          data-testid="complex-card"
        >
          <div>
            <h3>John Doe</h3>
            <p>Patient ID: 12345</p>
            <div>
              <HealthcareButton
                variant="primary"
                size="compact"
                data-testid="edit-patient"
              >
                Edit
              </HealthcareButton>
              <HealthcareButton
                variant="secondary"
                size="compact"
                data-testid="view-history"
              >
                History
              </HealthcareButton>
              <HealthcareButton
                variant="warning"
                size="compact"
                data-testid="archive-patient"
              >
                Archive
              </HealthcareButton>
            </div>
          </div>
        </HealthcareCard>
      )

      // Test navigation through interactive elements
      await testUser.tab()
      expect(screen.getByTestId('edit-patient')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('view-history')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('archive-patient')).toHaveFocus()
    })

    it('should provide proper context for nested form elements', () => {
      renderWithAccessibility(
        <HealthcareCard
          title="Quick Patient Update"
          variant="patient"
          data-testid="form-card"
        >
          <form>
            <fieldset>
              <legend>Update Patient Status</legend>
              <label htmlFor="status-select">Status:</label>
              <select id="status-select" data-testid="status-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discharged">Discharged</option>
              </select>
              <HealthcareButton
                type="submit"
                variant="primary"
                size="compact"
                data-testid="update-status"
              >
                Update
              </HealthcareButton>
            </fieldset>
          </form>
        </HealthcareCard>
      )

      // Check form structure within card
      const fieldset = screen.getByRole('group')
      const legend = screen.getByText('Update Patient Status')
      const select = screen.getByTestId('status-select')
      const button = screen.getByTestId('update-status')

      expect(fieldset).toContainElement(legend)
      expect(fieldset).toContainElement(select)
      expect(fieldset).toContainElement(button)
    })
  })

  describe('Card ARIA Announcements', () => {
    it('should announce card updates via live regions', async () => {
      const { container, rerender } = renderWithAccessibility(
        <HealthcareCard
          title="Patient Status"
          variant="patient"
          data-testid="status-card"
        >
          <p>Status: Stable</p>
        </HealthcareCard>
      )

      // Update card content
      rerender(
        <HealthcareCard
          title="Patient Status"
          variant="patient"
          data-testid="status-card"
        >
          <p>Status: Critical</p>
          <div aria-live="assertive">
            Patient status changed to Critical
          </div>
        </HealthcareCard>
      )

      // Check for live region announcements
      const announcement = screen.getByText('Patient status changed to Critical')
      expect(announcement).toHaveAttribute('aria-live', 'assertive')
    })
  })
})