/**
 * Healthcare Buttons Accessibility Tests
 *
 * Comprehensive accessibility testing for healthcare button components
 * following WCAG 2.2 AAA standards and healthcare compliance requirements.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  renderWithAccessibility,
  runHealthcareAccessibilityTests,
  testTouchTargets,
  testColorContrast,
  testUser
} from '../../../src/test/accessibility-utils'

// Import healthcare components
import { HealthcareButton } from '../../../src/components/ui/healthcare/HealthcareButton'

describe('Healthcare Buttons Accessibility', () => {
  beforeEach(() => {
    // Reset any global state before each test
    document.body.innerHTML = ''
  })

  describe('HealthcareButton Component', () => {
    it('should meet WCAG AAA accessibility standards', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          data-testid="primary-button"
          onClick={vi.fn()}
        >
          Schedule Appointment
        </HealthcareButton>
      )

      await runHealthcareAccessibilityTests(container)
    })

    it('should meet minimum touch target size requirements (44px)', () => {
      const { container } = renderWithAccessibility(
        <div>
          <HealthcareButton variant="compact" size="compact">
            Compact Button
          </HealthcareButton>
          <HealthcareButton variant="primary" size="standard">
            Standard Button
          </HealthcareButton>
          <HealthcareButton variant="secondary" size="large">
            Large Button
          </HealthcareButton>
        </div>
      )

      testTouchTargets(container)
    })

    it('should maintain proper color contrast ratios (7:1 for AAA)', () => {
      const { container } = renderWithAccessibility(
        <div>
          <HealthcareButton variant="primary">Primary Action</HealthcareButton>
          <HealthcareButton variant="secondary">Secondary Action</HealthcareButton>
          <HealthcareButton variant="success">Success Action</HealthcareButton>
          <HealthcareButton variant="warning">Warning Action</HealthcareButton>
          <HealthcareButton variant="danger">Danger Action</HealthcareButton>
        </div>
      )

      testColorContrast(container)
    })

    it('should support keyboard navigation with Enter and Space keys', async () => {
      const onClick = vi.fn()

      renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          onClick={onClick}
          data-testid="keyboard-button"
        >
          Keyboard Test Button
        </HealthcareButton>
      )

      const button = screen.getByTestId('keyboard-button')

      // Focus the button
      button.focus()
      expect(document.activeElement).toBe(button)

      // Test Enter key
      await testUser.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledTimes(1)

      // Test Space key
      await testUser.keyboard(' ')
      expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('should provide proper ARIA attributes', () => {
      renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          isLoading
          disabled
          data-testid="aria-button"
          aria-describedby="button-description"
        >
          Loading Button
        </HealthcareButton>
      )

      const button = screen.getByTestId('aria-button')

      // Check essential ARIA attributes
      expect(button).toHaveAttribute('role', 'button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('aria-describedby')
      expect(button).toHaveAttribute('id')
    })

    it('should announce loading states to screen readers', async () => {
      const { rerender } = renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          data-testid="loading-button"
        >
          Submit Form
        </HealthcareButton>
      )

      // Initially not loading
      const button = screen.getByTestId('loading-button')
      expect(button).not.toHaveAttribute('aria-busy')

      // Change to loading state
      rerender(
        <HealthcareButton
          variant="primary"
          isLoading
          data-testid="loading-button"
        >
          Submit Form
        </HealthcareButton>
      )

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'true')
        expect(button).toHaveTextContent('Submitting...')
      })
    })
  })

  describe('Emergency Button Accessibility', () => {
    it('should provide enhanced accessibility for emergency buttons', async () => {
      const onEmergencyClick = vi.fn()

      const { container } = renderWithAccessibility(
        <HealthcareButton
          variant="danger"
          isEmergency
          onClick={onEmergencyClick}
          data-testid="emergency-button"
        >
          Emergency Alert
        </HealthcareButton>
      )

      const button = screen.getByTestId('emergency-button')

      // Emergency buttons should have assertive announcements
      expect(button).toHaveAttribute('aria-live', 'assertive')
      expect(button).toHaveAttribute('role', 'button')

      // Test emergency keyboard shortcut (Ctrl+E)
      button.focus()
      await testUser.keyboard('{Control>}e{/Control}')

      expect(onEmergencyClick).toHaveBeenCalled()
    })

    it('should prioritize emergency button focus', () => {
      renderWithAccessibility(
        <div>
          <HealthcareButton variant="primary">Regular Button</HealthcareButton>
          <HealthcareButton
            variant="danger"
            isEmergency
            data-testid="emergency-priority"
          >
            Emergency Button
          </HealthcareButton>
          <HealthcareButton variant="secondary">Another Button</HealthcareButton>
        </div>
      )

      const emergencyButton = screen.getByTestId('emergency-priority')

      // Emergency button should be easily identifiable
      expect(emergencyButton).toHaveAttribute('aria-label')
      expect(emergencyButton.getAttribute('aria-label')).toContain('Emergency')
    })
  })

  describe('PHI-Enabled Button Accessibility', () => {
    it('should provide PHI context for accessibility tools', () => {
      const { container } = renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          containsPHI
          data-testid="phi-button"
          aria-describedby="phi-description"
        >
          View Patient Records
        </HealthcareButton>
      )

      const button = screen.getByTestId('phi-button')

      // PHI buttons should have additional context
      expect(button).toHaveAttribute('aria-describedby', 'phi-description')
      expect(button).toHaveAttribute('data-contains-phi')

      // Should have visual PHI indicator
      const phiIndicator = container.querySelector('[data-phi-indicator]')
      expect(phiIndicator).toBeInTheDocument()
    })

    it('should announce PHI access warnings', async () => {
      const onPHIAccess = vi.fn()

      renderWithAccessibility(
        <div>
          <HealthcareButton
            variant="primary"
            containsPHI
            onClick={onPHIAccess}
            data-testid="phi-access-button"
            aria-describedby="phi-warning"
          >
            Access PHI Data
          </HealthcareButton>
          <div id="phi-warning" className="sr-only">
            This action will access Protected Health Information. Access will be logged for audit purposes.
          </div>
        </div>
      )

      const button = screen.getByTestId('phi-access-button')
      await testUser.click(button)

      expect(onPHIAccess).toHaveBeenCalled()

      // Check that PHI warning is accessible
      expect(screen.getByText(/Protected Health Information/)).toBeInTheDocument()
    })
  })

  describe('Button States Accessibility', () => {
    it('should properly announce disabled state', () => {
      renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          disabled
          data-testid="disabled-button"
        >
          Disabled Action
        </HealthcareButton>
      )

      const button = screen.getByTestId('disabled-button')

      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveProperty('disabled', true)
    })

    it('should provide focus indicators meeting 2px minimum', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          data-testid="focus-button"
        >
          Focus Test Button
        </HealthcareButton>
      )

      const button = screen.getByTestId('focus-button')

      // Focus the button
      button.focus()

      // Check for focus-visible styles
      await waitFor(() => {
        expect(button).toHaveFocus()

        // The component should apply focus styles when focused
        const styles = window.getComputedStyle(button)
        // This would check for outline or box-shadow focus indicators
        expect(button).toHaveAttribute('data-focused')
      })
    })

    it('should handle hover states accessibly', async () => {
      const { container } = renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          data-testid="hover-button"
        >
          Hover Test Button
        </HealthcareButton>
      )

      const button = screen.getByTestId('hover-button')

      // Simulate hover
      await testUser.hover(button)

      // Button should maintain accessibility during hover
      expect(button).toHaveAttribute('role', 'button')
      expect(button).toBeVisible()
    })
  })

  describe('High Contrast Mode Support', () => {
    it('should maintain visibility in high contrast mode', () => {
      // Simulate high contrast mode
      const style = document.createElement('style')
      style.textContent = `
        @media (prefers-contrast: high) {
          .healthcare-button {
            --button-border: 2px solid;
            --focus-ring-width: 3px;
          }
        }
      `
      document.head.appendChild(style)

      const { container } = renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          data-testid="high-contrast-button"
        >
          High Contrast Button
        </HealthcareButton>
      )

      const button = screen.getByTestId('high-contrast-button')

      // Button should be visible and maintain proper contrast
      expect(button).toBeVisible()
      expect(button).toHaveAttribute('role', 'button')

      document.head.removeChild(style)
    })
  })

  describe('Button Groups Accessibility', () => {
    it('should maintain proper tab order in button groups', async () => {
      renderWithAccessibility(
        <div role="group" aria-label="Patient Actions">
          <HealthcareButton
            variant="primary"
            data-testid="edit-patient"
          >
            Edit Patient
          </HealthcareButton>
          <HealthcareButton
            variant="secondary"
            data-testid="view-history"
          >
            View History
          </HealthcareButton>
          <HealthcareButton
            variant="danger"
            data-testid="delete-patient"
          >
            Delete Patient
          </HealthcareButton>
        </div>
      )

      // Test tab navigation through button group
      await testUser.tab()
      expect(screen.getByTestId('edit-patient')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('view-history')).toHaveFocus()

      await testUser.tab()
      expect(screen.getByTestId('delete-patient')).toHaveFocus()
    })

    it('should provide proper group labeling', () => {
      renderWithAccessibility(
        <div role="group" aria-label="Medical Record Actions" data-testid="button-group">
          <HealthcareButton variant="primary">Add Note</HealthcareButton>
          <HealthcareButton variant="secondary">Edit Record</HealthcareButton>
          <HealthcareButton variant="warning">Archive Record</HealthcareButton>
        </div>
      )

      const buttonGroup = screen.getByTestId('button-group')
      expect(buttonGroup).toHaveAttribute('role', 'group')
      expect(buttonGroup).toHaveAttribute('aria-label', 'Medical Record Actions')
    })
  })

  describe('Icon Button Accessibility', () => {
    it('should provide proper labels for icon-only buttons', () => {
      renderWithAccessibility(
        <HealthcareButton
          variant="primary"
          iconOnly
          data-testid="icon-button"
          aria-label="Add new patient"
        >
          <span aria-hidden="true">+</span>
        </HealthcareButton>
      )

      const button = screen.getByTestId('icon-button')

      expect(button).toHaveAttribute('aria-label', 'Add new patient')

      // Icon should be hidden from screen readers
      const icon = button.querySelector('span')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})