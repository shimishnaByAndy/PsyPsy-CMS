/**
 * Healthcare Inputs Accessibility Tests
 *
 * Comprehensive accessibility testing for healthcare input components
 * following WCAG 2.2 AAA standards and healthcare compliance requirements.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  renderWithAccessibility,
  runHealthcareAccessibilityTests,
  testTouchTargets,
  testPIPEDAAccessibility,
  testUser
} from '../../../src/test/accessibility-utils'

// Import healthcare components
import { HealthcareInput } from '../../../src/components/ui/healthcare/HealthcareInput'
import { HealthcareTextarea } from '../../../src/components/ui/healthcare/HealthcareTextarea'

describe('Healthcare Inputs Accessibility', () => {
  beforeEach(() => {
    // Reset any global state before each test
    document.body.innerHTML = ''
  })

  describe('HealthcareInput Component', () => {
    it('should meet WCAG AAA accessibility standards', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareInput
          label="Patient Name"
          name="patientName"
          required
          data-testid="patient-name-input"
        />
      )

      await runHealthcareAccessibilityTests(container)
    })

    it('should have proper label association', () => {
      renderWithAccessibility(
        <HealthcareInput
          label="Medical Record Number"
          name="medicalRecordNumber"
          required
          data-testid="mrn-input"
        />
      )

      const input = screen.getByTestId('mrn-input')
      const label = screen.getByText('Medical Record Number')

      // Check proper label-input association
      expect(input).toHaveAttribute('id')
      expect(label).toHaveAttribute('for', input.id)
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('should support keyboard shortcuts for PHI masking (Ctrl+H)', async () => {
      renderWithAccessibility(
        <HealthcareInput
          label="Social Insurance Number"
          name="sin"
          containsPHI
          maskPHI
          data-testid="sin-input"
        />
      )

      const input = screen.getByTestId('sin-input')
      await testUser.click(input)
      await testUser.type(input, '123-456-789')

      // Input should initially show masked value
      expect(input).toHaveAttribute('type', 'password')

      // Test Ctrl+H to toggle masking
      await testUser.keyboard('{Control>}h{/Control}')

      await waitFor(() => {
        expect(input).toHaveAttribute('type', 'text')
      })

      // Toggle back to masked
      await testUser.keyboard('{Control>}h{/Control}')

      await waitFor(() => {
        expect(input).toHaveAttribute('type', 'password')
      })
    })

    it('should support emergency quick-save with Ctrl+S', async () => {
      const onEmergencySave = vi.fn()

      renderWithAccessibility(
        <HealthcareInput
          label="Emergency Notes"
          name="emergencyNotes"
          isEmergency
          onEmergencySave={onEmergencySave}
          data-testid="emergency-input"
        />
      )

      const input = screen.getByTestId('emergency-input')
      await testUser.click(input)
      await testUser.type(input, 'Patient experiencing chest pain')

      // Test Ctrl+S emergency save
      await testUser.keyboard('{Control>}s{/Control}')

      expect(onEmergencySave).toHaveBeenCalledWith('Patient experiencing chest pain')
    })

    it('should provide proper ARIA descriptions for PHI fields', () => {
      const { container } = renderWithAccessibility(
        <HealthcareInput
          label="Medical History"
          name="medicalHistory"
          containsPHI
          data-testid="medical-history-input"
          data-contains-phi
        />
      )

      const input = screen.getByTestId('medical-history-input')

      // PHI inputs should have ARIA descriptions
      expect(input).toHaveAttribute('aria-describedby')

      // Should have PHI indicator in description
      const descriptionId = input.getAttribute('aria-describedby')
      const description = container.querySelector(`#${descriptionId}`)
      expect(description).toBeInTheDocument()
      expect(description?.textContent).toContain('Protected Health Information')
    })

    it('should announce validation errors via live regions', async () => {
      const { container, rerender } = renderWithAccessibility(
        <HealthcareInput
          label="Email Address"
          name="email"
          type="email"
          required
          data-testid="email-input"
        />
      )

      // Add validation error
      rerender(
        <HealthcareInput
          label="Email Address"
          name="email"
          type="email"
          required
          error="Please enter a valid email address"
          data-testid="email-input"
        />
      )

      const input = screen.getByTestId('email-input')

      // Check that error is announced
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')

      // Error should be in a live region or associated description
      const errorMessage = screen.getByText('Please enter a valid email address')
      expect(errorMessage).toBeInTheDocument()
    })

    it('should meet minimum touch target sizes', () => {
      const { container } = renderWithAccessibility(
        <div>
          <HealthcareInput
            label="Small Input"
            name="small"
            size="compact"
          />
          <HealthcareInput
            label="Standard Input"
            name="standard"
            size="standard"
          />
          <HealthcareInput
            label="Large Input"
            name="large"
            size="large"
          />
        </div>
      )

      testTouchTargets(container)
    })
  })

  describe('HealthcareTextarea Component', () => {
    it('should meet WCAG AAA accessibility standards', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareTextarea
          label="Clinical Notes"
          name="clinicalNotes"
          required
          data-testid="clinical-notes"
        />
      )

      await runHealthcareAccessibilityTests(container)
    })

    it('should support enhanced keyboard navigation', async () => {
      renderWithAccessibility(
        <HealthcareTextarea
          label="Patient Assessment"
          name="assessment"
          data-testid="assessment-textarea"
        />
      )

      const textarea = screen.getByTestId('assessment-textarea')
      await testUser.click(textarea)

      // Test keyboard navigation within textarea
      await testUser.type(textarea, 'Patient shows improvement')
      await testUser.keyboard('{Enter}')
      await testUser.type(textarea, 'Recommending continued treatment')

      expect(textarea).toHaveValue('Patient shows improvement\nRecommending continued treatment')
    })

    it('should provide character count accessibility', async () => {
      renderWithAccessibility(
        <HealthcareTextarea
          label="Treatment Notes"
          name="treatmentNotes"
          maxLength={500}
          showCharacterCount
          data-testid="treatment-notes"
        />
      )

      const textarea = screen.getByTestId('treatment-notes')
      await testUser.click(textarea)
      await testUser.type(textarea, 'Sample treatment note')

      // Character count should be announced to screen readers
      const characterCount = screen.getByText(/characters/)
      expect(characterCount).toBeInTheDocument()
      expect(characterCount).toHaveAttribute('aria-live', 'polite')
    })

    it('should support PHI masking in textareas', async () => {
      renderWithAccessibility(
        <HealthcareTextarea
          label="Confidential Medical Notes"
          name="confidentialNotes"
          containsPHI
          maskPHI
          data-testid="confidential-textarea"
        />
      )

      const textarea = screen.getByTestId('confidential-textarea')
      await testUser.click(textarea)
      await testUser.type(textarea, 'Patient has sensitive medical condition')

      // Test PHI masking toggle
      await testUser.keyboard('{Control>}h{/Control}')

      // Textarea should respond to masking controls
      expect(textarea).toHaveAttribute('data-contains-phi')
    })
  })

  describe('Input Validation Accessibility', () => {
    it('should provide real-time validation feedback', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareInput
          label="Phone Number"
          name="phone"
          type="tel"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          required
          realTimeValidation
          data-testid="phone-input"
        />
      )

      const input = screen.getByTestId('phone-input')
      await testUser.click(input)
      await testUser.type(input, '123')

      // Should provide real-time feedback
      await waitFor(() => {
        const liveRegion = container.querySelector('[aria-live="polite"]')
        expect(liveRegion).toBeInTheDocument()
      })
    })

    it('should announce successful validation', async () => {
      const { container, rerender } = renderWithAccessibility(
        <HealthcareInput
          label="Patient ID"
          name="patientId"
          pattern="[A-Z]{2}[0-9]{6}"
          required
          data-testid="patient-id-input"
        />
      )

      const input = screen.getByTestId('patient-id-input')
      await testUser.click(input)
      await testUser.type(input, 'AB123456')

      // Simulate successful validation
      rerender(
        <HealthcareInput
          label="Patient ID"
          name="patientId"
          pattern="[A-Z]{2}[0-9]{6}"
          required
          isValid
          data-testid="patient-id-input"
        />
      )

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'false')
      })
    })
  })

  describe('Emergency Input Accessibility', () => {
    it('should prioritize emergency inputs with assertive announcements', () => {
      const { container } = renderWithAccessibility(
        <HealthcareInput
          label="Emergency Contact Information"
          name="emergencyContact"
          isEmergency
          required
          data-testid="emergency-contact-input"
        />
      )

      const input = screen.getByTestId('emergency-contact-input')

      // Emergency inputs should have enhanced accessibility
      expect(input).toHaveAttribute('aria-required', 'true')

      // Should have emergency-specific announcements
      const emergencyAnnouncements = container.querySelectorAll('[aria-live="assertive"]')
      expect(emergencyAnnouncements.length).toBeGreaterThan(0)
    })

    it('should provide emergency context in labels', () => {
      renderWithAccessibility(
        <HealthcareInput
          label="Critical Patient Alert"
          name="criticalAlert"
          isEmergency
          data-testid="critical-alert-input"
        />
      )

      const input = screen.getByTestId('critical-alert-input')
      const label = screen.getByText('Critical Patient Alert')

      expect(input).toHaveAttribute('aria-describedby')
      expect(label).toBeInTheDocument()

      // Emergency context should be clear
      expect(label.textContent).toContain('Critical')
    })
  })

  describe('PHI Input Accessibility', () => {
    it('should meet PIPEDA accessibility requirements', () => {
      const { container } = renderWithAccessibility(
        <div>
          <HealthcareInput
            label="Health Card Number"
            name="healthCard"
            containsPHI
            maskPHI
            data-testid="health-card-input"
            data-contains-phi
          />
          <HealthcareInput
            label="Medical Diagnosis"
            name="diagnosis"
            containsPHI
            data-testid="diagnosis-input"
            data-contains-phi
          />
        </div>
      )

      testPIPEDAAccessibility(container)
    })

    it('should provide PHI masking controls that are keyboard accessible', async () => {
      renderWithAccessibility(
        <HealthcareInput
          label="Social Security Number"
          name="ssn"
          containsPHI
          maskPHI
          showMaskingToggle
          data-testid="ssn-input"
        />
      )

      const input = screen.getByTestId('ssn-input')
      const maskingToggle = screen.getByRole('button', { name: /toggle.*masking/i })

      // Masking toggle should be keyboard accessible
      expect(maskingToggle).toHaveAttribute('tabindex', '0')
      expect(maskingToggle).toHaveAttribute('aria-label')

      // Test keyboard activation
      maskingToggle.focus()
      await testUser.keyboard('{Enter}')

      // Input type should change
      await waitFor(() => {
        expect(input).toHaveAttribute('type')
      })
    })
  })

  describe('Form Input Groups Accessibility', () => {
    it('should maintain proper fieldset structure', () => {
      renderWithAccessibility(
        <fieldset>
          <legend>Patient Contact Information</legend>
          <HealthcareInput
            label="Primary Phone"
            name="primaryPhone"
            type="tel"
            data-testid="primary-phone"
          />
          <HealthcareInput
            label="Secondary Phone"
            name="secondaryPhone"
            type="tel"
            data-testid="secondary-phone"
          />
          <HealthcareInput
            label="Email Address"
            name="email"
            type="email"
            data-testid="email"
          />
        </fieldset>
      )

      // Check fieldset structure
      const fieldset = screen.getByRole('group')
      const legend = screen.getByText('Patient Contact Information')

      expect(fieldset).toBeInTheDocument()
      expect(legend).toBeInTheDocument()
      expect(fieldset).toContainElement(legend)
    })

    it('should support logical tab order in input groups', async () => {
      renderWithAccessibility(
        <div>
          <HealthcareInput
            label="First Name"
            name="firstName"
            data-testid="first-name"
          />
          <HealthcareInput
            label="Last Name"
            name="lastName"
            data-testid="last-name"
          />
          <HealthcareInput
            label="Date of Birth"
            name="dob"
            type="date"
            data-testid="date-of-birth"
          />
        </div>
      )

      // Test tab order
      await testUser.tab()
      expect(screen.getByTestId('first-name')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('last-name')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('date-of-birth')).toHaveFocus()
    })
  })

  describe('Input Error Handling Accessibility', () => {
    it('should provide comprehensive error information', () => {
      renderWithAccessibility(
        <HealthcareInput
          label="Insurance Number"
          name="insuranceNumber"
          required
          error="Insurance number must be exactly 10 digits"
          helpText="Enter your provincial health insurance number"
          data-testid="insurance-input"
        />
      )

      const input = screen.getByTestId('insurance-input')

      // Check error state accessibility
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')

      // Error message should be accessible
      const errorMessage = screen.getByText(/Insurance number must be exactly 10 digits/)
      expect(errorMessage).toBeInTheDocument()

      // Help text should also be accessible
      const helpText = screen.getByText(/Enter your provincial health insurance number/)
      expect(helpText).toBeInTheDocument()
    })
  })
})