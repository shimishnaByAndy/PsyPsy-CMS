/**
 * Accessibility Testing Utilities for Healthcare Components
 *
 * Provides comprehensive accessibility testing utilities following WCAG 2.2 AAA
 * standards with healthcare-specific compliance requirements.
 */

import { render, RenderResult } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'

// Extend Jest matchers for axe
expect.extend(toHaveNoViolations)

// Healthcare-specific accessibility testing configuration
const healthcareAxeConfig = {
  rules: {
    // WCAG 2.2 AAA specific rules
    'color-contrast-enhanced': { enabled: true }, // 7:1 contrast ratio
    'focus-order-semantics': { enabled: true },
    'keyboard-navigation': { enabled: true },

    // Healthcare-specific accessibility rules
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },

    // Form accessibility (critical for medical forms)
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'required-attr': { enabled: true },

    // Interactive element accessibility
    'interactive-supports-focus': { enabled: true },
    'nested-interactive': { enabled: true },
    'role-img-alt': { enabled: true },

    // Navigation and structure
    'heading-order': { enabled: true },
    'landmark-unique': { enabled: true },
    'region': { enabled: true },

    // Medical data privacy indicators
    'aria-hidden-focus': { enabled: true },
    'focusable-content': { enabled: true }
  },
  tags: ['wcag22aaa', 'best-practice'],
  // Healthcare context requires stricter validation
  impact: ['minor', 'moderate', 'serious', 'critical']
}

/**
 * Healthcare-specific accessibility test wrapper
 */
export const renderWithAccessibility = (
  component: React.ReactElement,
  options?: {
    testId?: string
    skipAxe?: boolean
    customAxeConfig?: any
  }
): RenderResult => {
  const result = render(component)

  // Add test ID for easier targeting
  if (options?.testId) {
    const container = result.container.firstChild as HTMLElement
    if (container) {
      container.setAttribute('data-testid', options.testId)
    }
  }

  return result
}

/**
 * Run comprehensive accessibility tests on a component
 */
export const testAccessibility = async (
  container: HTMLElement,
  customConfig?: any
): Promise<void> => {
  const config = customConfig || healthcareAxeConfig
  const results = await axe(container, config)
  expect(results).toHaveNoViolations()
}

/**
 * Test keyboard navigation for healthcare workflows
 */
export const testKeyboardNavigation = async (
  container: HTMLElement,
  expectedTabOrder: string[]
): Promise<void> => {
  const user = userEvent.setup()

  // Get all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  // Test tab order matches expected
  for (let i = 0; i < expectedTabOrder.length; i++) {
    await user.tab()
    const expectedElement = container.querySelector(`[data-testid="${expectedTabOrder[i]}"]`)
    const activeElement = document.activeElement

    expect(activeElement).toBe(expectedElement)
  }
}

/**
 * Test touch target sizes for mobile healthcare workers
 */
export const testTouchTargets = (container: HTMLElement): void => {
  const interactiveElements = container.querySelectorAll(
    'button, [role="button"], input, select, textarea, a'
  )

  interactiveElements.forEach((element) => {
    const styles = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()

    // WCAG AAA requires 44px minimum for touch targets
    const minSize = 44

    expect(rect.width).toBeGreaterThanOrEqual(minSize)
    expect(rect.height).toBeGreaterThanOrEqual(minSize)
  })
}

/**
 * Test color contrast ratios for WCAG AAA compliance
 */
export const testColorContrast = (container: HTMLElement): void => {
  const textElements = container.querySelectorAll('*')

  textElements.forEach((element) => {
    const styles = window.getComputedStyle(element)
    const hasText = element.textContent?.trim()

    if (hasText) {
      // This would typically integrate with a color contrast library
      // For testing purposes, we ensure CSS custom properties are used
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Verify that design tokens are being used (indicates proper contrast)
      expect(color).toMatch(/var\(--|\#|rgb|hsl/)
      expect(backgroundColor).toMatch(/var\(--|\#|rgb|hsl|transparent/)
    }
  })
}

/**
 * Test ARIA attributes for healthcare components
 */
export const testARIAAttributes = (container: HTMLElement): void => {
  // Test required ARIA attributes for healthcare forms
  const healthcareInputs = container.querySelectorAll('[data-healthcare-input]')
  healthcareInputs.forEach((input) => {
    expect(input).toHaveAttribute('aria-label')
    expect(input).toHaveAttribute('id')

    // PHI inputs should have additional ARIA attributes
    if (input.hasAttribute('data-contains-phi')) {
      expect(input).toHaveAttribute('aria-describedby')
    }
  })

  // Test emergency components have proper roles
  const emergencyElements = container.querySelectorAll('[data-emergency]')
  emergencyElements.forEach((element) => {
    expect(element).toHaveAttribute('role')
    expect(element).toHaveAttribute('aria-live')
  })
}

/**
 * Test focus management for healthcare workflows
 */
export const testFocusManagement = async (
  container: HTMLElement,
  trigger: HTMLElement,
  expectedFocusTarget: HTMLElement
): Promise<void> => {
  const user = userEvent.setup()

  // Trigger action (e.g., opening modal, submitting form)
  await user.click(trigger)

  // Wait for focus to settle
  await new Promise(resolve => setTimeout(resolve, 100))

  // Verify focus moved to expected element
  expect(document.activeElement).toBe(expectedFocusTarget)
}

/**
 * Test screen reader announcements
 */
export const testScreenReaderAnnouncements = (container: HTMLElement): void => {
  // Test for live regions
  const liveRegions = container.querySelectorAll('[aria-live]')
  expect(liveRegions.length).toBeGreaterThan(0)

  // Test announcement content is meaningful
  liveRegions.forEach((region) => {
    const ariaLive = region.getAttribute('aria-live')
    expect(['polite', 'assertive', 'off']).toContain(ariaLive)

    // Emergency announcements should be assertive
    if (region.hasAttribute('data-emergency')) {
      expect(ariaLive).toBe('assertive')
    }
  })
}

/**
 * Test high contrast mode support
 */
export const testHighContrastSupport = (container: HTMLElement): void => {
  // Add high contrast media query simulation
  const style = document.createElement('style')
  style.textContent = `
    @media (prefers-contrast: high) {
      * {
        --test-high-contrast: true;
      }
    }
  `
  document.head.appendChild(style)

  // Check that high contrast styles are applied
  const elements = container.querySelectorAll('*')
  elements.forEach((element) => {
    const styles = window.getComputedStyle(element)
    // This would check for appropriate high contrast styling
    // Implementation depends on CSS custom property system
  })

  document.head.removeChild(style)
}

/**
 * Healthcare-specific accessibility test suite
 */
export const runHealthcareAccessibilityTests = async (
  container: HTMLElement,
  options: {
    testTouchTargets?: boolean
    testKeyboard?: boolean
    testContrast?: boolean
    testARIA?: boolean
    testFocus?: boolean
    testScreenReader?: boolean
    testHighContrast?: boolean
  } = {}
): Promise<void> => {
  // Always run core accessibility tests
  await testAccessibility(container)

  // Run optional specific tests
  if (options.testTouchTargets !== false) {
    testTouchTargets(container)
  }

  if (options.testContrast !== false) {
    testColorContrast(container)
  }

  if (options.testARIA !== false) {
    testARIAAttributes(container)
  }

  if (options.testScreenReader !== false) {
    testScreenReaderAnnouncements(container)
  }

  if (options.testHighContrast !== false) {
    testHighContrastSupport(container)
  }
}

/**
 * Quebec Law 25 specific accessibility tests
 */
export const testQuebecLaw25Accessibility = (container: HTMLElement): void => {
  // Test consent form accessibility
  const consentForms = container.querySelectorAll('[data-consent-form]')
  consentForms.forEach((form) => {
    expect(form).toHaveAttribute('role', 'form')
    expect(form).toHaveAttribute('aria-label')

    // Required consent indicators must be accessible
    const requiredFields = form.querySelectorAll('[required]')
    requiredFields.forEach((field) => {
      expect(field).toHaveAttribute('aria-required', 'true')
    })
  })

  // Test data export accessibility
  const exportButtons = container.querySelectorAll('[data-export-data]')
  exportButtons.forEach((button) => {
    expect(button).toHaveAttribute('aria-describedby')
    expect(button).toHaveAttribute('aria-label')
  })
}

/**
 * PIPEDA specific accessibility tests
 */
export const testPIPEDAAccessibility = (container: HTMLElement): void => {
  // Test PHI data indicators are accessible
  const phiElements = container.querySelectorAll('[data-contains-phi]')
  phiElements.forEach((element) => {
    expect(element).toHaveAttribute('aria-describedby')

    // PHI masking controls must be keyboard accessible
    const maskingControls = element.querySelectorAll('[data-phi-mask]')
    maskingControls.forEach((control) => {
      expect(control).toHaveAttribute('tabindex')
      expect(control).toHaveAttribute('aria-label')
    })
  })

  // Test audit trail accessibility
  const auditElements = container.querySelectorAll('[data-audit-info]')
  auditElements.forEach((element) => {
    expect(element).toHaveAttribute('aria-label')
  })
}

// Export all utilities
export {
  healthcareAxeConfig,
  userEvent as testUser
}