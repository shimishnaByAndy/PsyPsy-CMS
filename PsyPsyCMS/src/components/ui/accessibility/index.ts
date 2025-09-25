/**
 * Accessibility Components - WCAG AAA Compliance Suite
 *
 * Comprehensive accessibility utilities, components, and testing tools
 * for ensuring WCAG AAA compliance in healthcare applications.
 */

// Core accessibility utilities and hooks
export {
  AccessibilityProvider,
  useAccessibility,
  useFocusManagement,
  useFocusRestore,
  useKeyboardNavigation,
  useScreenReaderAnnouncement,
  useAccessibilityValidation,
  AriaLiveRegion,
  calculateContrastRatio,
  validateWCAGContrast,
  getWCAGCompliantColors,
  type AccessibilityOptions,
  type FocusableElement,
  type AriaLiveRegionProps,
} from './AccessibilityUtils'

// Accessibility testing and validation
export {
  AccessibilityTester,
  type AccessibilityIssue,
  type AccessibilityReport,
  type AccessibilityTesterProps,
} from './AccessibilityTester'

// User accessibility settings
export {
  AccessibilitySettings,
  type AccessibilityPreferences,
  type AccessibilitySettingsProps,
} from './AccessibilitySettings'

// Re-export default components
export { default as AccessibilityUtils } from './AccessibilityUtils'
export { default as AccessibilityTester } from './AccessibilityTester'
export { default as AccessibilitySettings } from './AccessibilitySettings'

// Performance monitoring for healthcare applications
export {
  PerformanceMonitor,
  type PerformanceMonitorProps,
  type PerformanceThresholds,
  type PerformanceMetrics,
} from '../performance/PerformanceMonitor'