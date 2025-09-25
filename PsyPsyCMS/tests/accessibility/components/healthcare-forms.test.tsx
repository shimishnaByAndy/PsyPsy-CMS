/**
 * Healthcare Forms Accessibility Tests
 *
 * Comprehensive accessibility testing for healthcare form components
 * following WCAG 2.2 AAA standards and healthcare compliance requirements.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  renderWithAccessibility,
  runHealthcareAccessibilityTests,
  testKeyboardNavigation,
  testQuebecLaw25Accessibility,
  testPIPEDAAccessibility,
  testUser
} from '../../../src/test/accessibility-utils'

// Import healthcare components
import { HealthcareForm } from '../../../src/components/ui/healthcare/HealthcareForm'
import { HealthcareInput } from '../../../src/components/ui/healthcare/HealthcareInput'
import { HealthcareButton } from '../../../src/components/ui/healthcare/HealthcareButton'

describe('Healthcare Forms Accessibility', () => {
  beforeEach(() => {
    // Reset any global state before each test
    document.body.innerHTML = ''
  })

  describe('HealthcareForm Component', () => {
    it('should meet WCAG AAA accessibility standards', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Patient Registration Form"
          onSubmit={vi.fn()}
          data-testid="patient-form"
        >
          <HealthcareInput
            label="Patient Name"
            name="patientName"
            required
            data-testid="patient-name-input"
          />
          <HealthcareInput
            label="Medical ID"
            name="medicalId"
            containsPHI
            data-testid="medical-id-input"
          />
          <HealthcareButton
            variant="primary"
            type="submit"
            data-testid="submit-button"
          >
            Submit Registration
          </HealthcareButton>
        </HealthcareForm>
      )

      await runHealthcareAccessibilityTests(container)
    })

    it('should have proper form structure with fieldsets and legends', () => {
      renderWithAccessibility(
        <HealthcareForm title="Medical History Form" onSubmit={vi.fn()}>
          <HealthcareInput label="Current Medications" name="medications" />
          <HealthcareInput label="Allergies" name="allergies" />
        </HealthcareForm>
      )

      // Check for proper form structure
      const fieldset = screen.getByRole('group')
      expect(fieldset).toBeInTheDocument()
      expect(fieldset).toHaveAttribute('aria-label')

      // Check for legend (may be visually hidden)
      const legend = fieldset.querySelector('legend')
      expect(legend).toBeInTheDocument()
    })

    it('should support keyboard navigation with Ctrl+Enter for emergency submission', async () => {
      const onSubmit = vi.fn()

      renderWithAccessibility(
        <HealthcareForm
          title="Emergency Contact Form"
          onSubmit={onSubmit}
          isEmergency
          data-testid="emergency-form"
        >
          <HealthcareInput
            label="Emergency Contact Name"
            name="emergencyName"
            required
            data-testid="emergency-name"
          />
          <HealthcareButton
            variant="danger"
            type="submit"
            isEmergency
            data-testid="emergency-submit"
          >
            Submit Emergency Contact
          </HealthcareButton>
        </HealthcareForm>
      )

      const nameInput = screen.getByTestId('emergency-name')
      await testUser.click(nameInput)
      await testUser.type(nameInput, 'Dr. Emergency Contact')

      // Test Ctrl+Enter emergency submission
      await testUser.keyboard('{Control>}{Enter}{/Control}')

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('should announce form status changes to screen readers', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Patient Information Form"
          onSubmit={vi.fn()}
          validationErrors={[{ field: 'email', message: 'Invalid email format' }]}
        >
          <HealthcareInput
            label="Email Address"
            name="email"
            type="email"
            data-testid="email-input"
          />
        </HealthcareForm>
      )

      // Check for live regions for announcements
      const liveRegion = container.querySelector('[aria-live]')
      expect(liveRegion).toBeInTheDocument()
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')

      // Check that validation errors are announced
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })

    it('should support auto-save with Ctrl+S keyboard shortcut', async () => {
      const onAutoSave = vi.fn()

      renderWithAccessibility(
        <HealthcareForm
          title="Clinical Notes Form"
          onSubmit={vi.fn()}
          onAutoSave={onAutoSave}
          enableAutoSave
          data-testid="notes-form"
        >
          <HealthcareInput
            label="Clinical Notes"
            name="notes"
            multiline
            data-testid="notes-input"
          />
        </HealthcareForm>
      )

      const notesInput = screen.getByTestId('notes-input')
      await testUser.click(notesInput)
      await testUser.type(notesInput, 'Patient shows improvement')

      // Test Ctrl+S auto-save
      await testUser.keyboard('{Control>}s{/Control}')

      await waitFor(() => {
        expect(onAutoSave).toHaveBeenCalled()
      })
    })

    it('should meet Quebec Law 25 accessibility requirements', () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Data Consent Form"
          onSubmit={vi.fn()}
          data-consent-form
        >
          <HealthcareInput
            label="I consent to data processing"
            name="dataConsent"
            type="checkbox"
            required
            data-testid="consent-checkbox"
          />
          <HealthcareButton
            variant="primary"
            type="submit"
            data-export-data
            aria-describedby="export-description"
          >
            Export My Data
          </HealthcareButton>
          <div id="export-description" className="sr-only">
            This will export all your personal health information in a portable format
          </div>
        </HealthcareForm>
      )

      testQuebecLaw25Accessibility(container)
    })

    it('should meet PIPEDA accessibility requirements for PHI handling', () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Medical Records Form"
          onSubmit={vi.fn()}
        >
          <HealthcareInput
            label="Social Insurance Number"
            name="sin"
            containsPHI
            maskPHI
            data-testid="sin-input"
            data-contains-phi
          />
          <HealthcareInput
            label="Medical History"
            name="history"
            containsPHI
            multiline
            data-testid="history-input"
            data-contains-phi
          />
        </HealthcareForm>
      )

      testPIPEDAAccessibility(container)
    })
  })

  describe('Form Validation Accessibility', () => {
    it('should announce validation errors immediately', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Patient Registration"
          onSubmit={vi.fn()}
          validationErrors={[
            { field: 'patientName', message: 'Patient name is required' },
            { field: 'email', message: 'Valid email address is required' }
          ]}
        >
          <HealthcareInput
            label="Patient Name"
            name="patientName"
            required
            data-testid="name-input"
          />
          <HealthcareInput
            label="Email"
            name="email"
            type="email"
            required
            data-testid="email-input"
          />
        </HealthcareForm>
      )

      // Check that error messages are properly associated with inputs
      const nameInput = screen.getByTestId('name-input')
      const emailInput = screen.getByTestId('email-input')

      expect(nameInput).toHaveAttribute('aria-describedby')
      expect(emailInput).toHaveAttribute('aria-describedby')

      // Check that error messages are announced via live regions
      const errorMessages = container.querySelectorAll('[role="alert"]')
      expect(errorMessages.length).toBeGreaterThan(0)
    })

    it('should provide real-time validation feedback', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Real-time Validation Form"
          onSubmit={vi.fn()}
          realTimeValidation
        >
          <HealthcareInput
            label="Phone Number"
            name="phone"
            type="tel"
            required
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            data-testid="phone-input"
          />
        </HealthcareForm>
      )

      const phoneInput = screen.getByTestId('phone-input')
      await testUser.click(phoneInput)
      await testUser.type(phoneInput, '123')

      // Check for real-time validation announcements
      await waitFor(() => {
        const liveRegion = container.querySelector('[aria-live="polite"]')
        expect(liveRegion).toBeInTheDocument()
      })
    })
  })

  describe('Emergency Form Accessibility', () => {
    it('should prioritize emergency forms with assertive announcements', () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Emergency Contact Information"
          onSubmit={vi.fn()}
          isEmergency
          data-testid="emergency-form"
        >
          <HealthcareInput
            label="Emergency Contact"
            name="emergencyContact"
            required
            isEmergency
            data-testid="emergency-contact"
          />
        </HealthcareForm>
      )

      // Emergency forms should have assertive live regions
      const emergencyAnnouncements = container.querySelectorAll('[aria-live="assertive"]')
      expect(emergencyAnnouncements.length).toBeGreaterThan(0)

      // Emergency form should have appropriate role
      const form = screen.getByTestId('emergency-form')
      expect(form).toHaveAttribute('aria-label')
      expect(form.getAttribute('aria-label')).toContain('Emergency')
    })

    it('should provide enhanced keyboard shortcuts for emergency workflows', async () => {
      const onEmergencySubmit = vi.fn()

      renderWithAccessibility(
        <HealthcareForm
          title="Critical Patient Alert"
          onSubmit={onEmergencySubmit}
          isEmergency
        >
          <HealthcareInput
            label="Critical Alert Details"
            name="alertDetails"
            required
            isEmergency
            data-testid="alert-details"
          />
          <HealthcareButton
            variant="danger"
            type="submit"
            isEmergency
            data-testid="critical-submit"
          >
            Submit Critical Alert
          </HealthcareButton>
        </HealthcareForm>
      )

      const alertInput = screen.getByTestId('alert-details')
      await testUser.click(alertInput)
      await testUser.type(alertInput, 'Patient experiencing cardiac episode')

      // Test emergency keyboard shortcuts
      await testUser.keyboard('{Control>}{Enter}{/Control}')

      await waitFor(() => {
        expect(onEmergencySubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Healthcare Form Tab Order', () => {
    it('should maintain logical tab order for complex medical forms', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareForm
          title="Comprehensive Medical Form"
          onSubmit={vi.fn()}
        >
          <HealthcareInput
            label="Patient Name"
            name="patientName"
            data-testid="patient-name"
          />
          <HealthcareInput
            label="Date of Birth"
            name="dob"
            type="date"
            data-testid="date-of-birth"
          />
          <HealthcareInput
            label="Medical ID"
            name="medicalId"
            containsPHI
            data-testid="medical-id"
          />
          <HealthcareInput
            label="Primary Physician"
            name="primaryPhysician"
            data-testid="primary-physician"
          />
          <HealthcareButton
            variant="secondary"
            type="button"
            data-testid="save-draft"
          >
            Save Draft
          </HealthcareButton>
          <HealthcareButton
            variant="primary"
            type="submit"
            data-testid="submit-form"
          >
            Submit Form
          </HealthcareButton>
        </HealthcareForm>
      )

      const expectedTabOrder = [
        'patient-name',
        'date-of-birth',
        'medical-id',
        'primary-physician',
        'save-draft',
        'submit-form'
      ]

      await testKeyboardNavigation(container, expectedTabOrder)
    })
  })
})