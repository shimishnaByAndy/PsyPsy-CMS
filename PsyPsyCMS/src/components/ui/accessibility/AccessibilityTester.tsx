/**
 * AccessibilityTester - WCAG AAA compliance testing and validation
 *
 * Provides real-time accessibility testing, compliance validation,
 * and developer tools for ensuring WCAG AAA standards.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Divider,
  Accordion,
  AccordionItem,
  Code,
  Badge,
  Tooltip,
} from '@nextui-org/react'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Keyboard,
  MousePointer,
  Volume2,
  Smartphone,
  Monitor,
  RefreshCw,
  Download,
  Settings,
  Info,
} from 'lucide-react'
import {
  calculateContrastRatio,
  validateWCAGContrast,
  getWCAGCompliantColors,
  useAccessibilityValidation,
} from './AccessibilityUtils'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AccessibilityIssue {
  id: string
  element: HTMLElement
  severity: 'error' | 'warning' | 'info'
  category: 'color-contrast' | 'keyboard' | 'focus' | 'aria' | 'structure' | 'content' | 'touch-target'
  message: string
  description: string
  remediation: string
  wcagCriteria: string[]
  automated: boolean
}

export interface AccessibilityReport {
  score: number
  totalIssues: number
  issuesBySeverity: {
    error: number
    warning: number
    info: number
  }
  issuesByCategory: Record<string, number>
  issues: AccessibilityIssue[]
  testedElements: number
  complianceLevel: 'fail' | 'AA' | 'AAA'
  timestamp: Date
}

export interface AccessibilityTesterProps {
  /**
   * Whether to run tests automatically on component mount
   */
  autoRun?: boolean

  /**
   * Whether to run tests continuously (watching for DOM changes)
   */
  continuous?: boolean

  /**
   * Which tests to include
   */
  includeTests?: Array<'color-contrast' | 'keyboard' | 'focus' | 'aria' | 'structure' | 'content' | 'touch-target'>

  /**
   * Whether to show the testing UI
   */
  showUI?: boolean

  /**
   * Callback when tests complete
   */
  onTestComplete?: (report: AccessibilityReport) => void

  /**
   * Whether to highlight issues on the page
   */
  highlightIssues?: boolean

  /**
   * CSS selector to limit testing scope
   */
  scope?: string
}

// =============================================================================
// ACCESSIBILITY TESTING UTILITIES
// =============================================================================

class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = []
  private testedElements = 0

  constructor(private scope?: string) {}

  async runFullAudit(): Promise<AccessibilityReport> {
    this.issues = []
    this.testedElements = 0

    const container = this.scope
      ? document.querySelector(this.scope) as HTMLElement
      : document.body

    if (!container) {
      throw new Error(`Scope element not found: ${this.scope}`)
    }

    // Run all accessibility tests
    await Promise.all([
      this.testColorContrast(container),
      this.testKeyboardNavigation(container),
      this.testFocusManagement(container),
      this.testAriaAttributes(container),
      this.testStructure(container),
      this.testContent(container),
      this.testTouchTargets(container),
    ])

    return this.generateReport()
  }

  private async testColorContrast(container: HTMLElement) {
    const elements = container.querySelectorAll('*')

    elements.forEach(element => {
      const htmlElement = element as HTMLElement
      const styles = window.getComputedStyle(htmlElement)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Skip if transparent or no background
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return
      }

      // Convert colors to hex for contrast calculation
      const foregroundHex = this.rgbToHex(color)
      const backgroundHex = this.rgbToHex(backgroundColor)

      if (foregroundHex && backgroundHex) {
        const fontSize = parseFloat(styles.fontSize)
        const fontWeight = styles.fontWeight
        const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700

        const contrastResult = validateWCAGContrast(foregroundHex, backgroundHex, fontSize, isBold)

        if (!contrastResult.passes.AAA) {
          this.addIssue({
            id: `contrast-${this.testedElements}`,
            element: htmlElement,
            severity: contrastResult.passes.AA ? 'warning' : 'error',
            category: 'color-contrast',
            message: `Insufficient color contrast ratio: ${contrastResult.ratio.toFixed(2)}:1`,
            description: `WCAG AAA requires ${fontSize >= 18 || isBold ? '4.5' : '7'}:1 contrast ratio`,
            remediation: 'Adjust foreground or background colors to meet contrast requirements',
            wcagCriteria: ['1.4.6 Contrast (Enhanced)'],
            automated: true,
          })
        }
      }

      this.testedElements++
    })
  }

  private async testKeyboardNavigation(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    )

    focusableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement

      // Check if element is keyboard accessible
      const tabIndex = htmlElement.getAttribute('tabindex')
      if (tabIndex === '-1') {
        this.addIssue({
          id: `keyboard-${index}`,
          element: htmlElement,
          severity: 'warning',
          category: 'keyboard',
          message: 'Interactive element not keyboard accessible',
          description: 'Element has tabindex="-1" making it unreachable via keyboard',
          remediation: 'Remove tabindex="-1" or provide alternative keyboard access',
          wcagCriteria: ['2.1.1 Keyboard', '2.1.3 Keyboard (No Exception)'],
          automated: true,
        })
      }

      // Check for keyboard event handlers
      const hasKeyboardHandlers = htmlElement.onkeydown || htmlElement.onkeyup || htmlElement.onkeypress
      const hasClickHandler = htmlElement.onclick

      if (hasClickHandler && !hasKeyboardHandlers) {
        this.addIssue({
          id: `keyboard-handler-${index}`,
          element: htmlElement,
          severity: 'error',
          category: 'keyboard',
          message: 'Interactive element missing keyboard event handlers',
          description: 'Element has click handler but no keyboard event handlers',
          remediation: 'Add onKeyDown handler to support Enter and Space key activation',
          wcagCriteria: ['2.1.1 Keyboard'],
          automated: true,
        })
      }
    })
  }

  private async testFocusManagement(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
    )

    focusableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const styles = window.getComputedStyle(htmlElement)

      // Check for custom focus indicators
      if (styles.outline === 'none' || styles.outline === '0px') {
        // Check if there's a custom focus style
        const focusStyles = this.getFocusStyles(htmlElement)
        if (!focusStyles.hasCustomFocus) {
          this.addIssue({
            id: `focus-${index}`,
            element: htmlElement,
            severity: 'error',
            category: 'focus',
            message: 'Interactive element has no visible focus indicator',
            description: 'Element removes default focus outline without providing alternative',
            remediation: 'Provide visible focus indicator using :focus-visible pseudo-class',
            wcagCriteria: ['2.4.7 Focus Visible'],
            automated: true,
          })
        }
      }
    })
  }

  private async testAriaAttributes(container: HTMLElement) {
    const elements = container.querySelectorAll('*')

    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement

      // Check for proper ARIA labels
      if (htmlElement.tagName === 'BUTTON' || htmlElement.getAttribute('role') === 'button') {
        const hasAccessibleName = htmlElement.getAttribute('aria-label') ||
                                 htmlElement.getAttribute('aria-labelledby') ||
                                 htmlElement.textContent?.trim()

        if (!hasAccessibleName) {
          this.addIssue({
            id: `aria-label-${index}`,
            element: htmlElement,
            severity: 'error',
            category: 'aria',
            message: 'Interactive element missing accessible name',
            description: 'Button or button role element has no accessible name',
            remediation: 'Add aria-label, aria-labelledby, or text content',
            wcagCriteria: ['4.1.2 Name, Role, Value'],
            automated: true,
          })
        }
      }

      // Check for invalid ARIA attributes
      const ariaAttributes = Array.from(htmlElement.attributes)
        .filter(attr => attr.name.startsWith('aria-'))

      ariaAttributes.forEach(attr => {
        if (!this.isValidAriaAttribute(attr.name, htmlElement.tagName)) {
          this.addIssue({
            id: `aria-invalid-${index}`,
            element: htmlElement,
            severity: 'warning',
            category: 'aria',
            message: `Invalid ARIA attribute: ${attr.name}`,
            description: `ARIA attribute ${attr.name} is not valid for ${htmlElement.tagName}`,
            remediation: 'Remove invalid ARIA attribute or use correct attribute',
            wcagCriteria: ['4.1.1 Parsing'],
            automated: true,
          })
        }
      })

      // Check for proper ARIA roles
      const role = htmlElement.getAttribute('role')
      if (role && !this.isValidAriaRole(role)) {
        this.addIssue({
          id: `aria-role-${index}`,
          element: htmlElement,
          severity: 'error',
          category: 'aria',
          message: `Invalid ARIA role: ${role}`,
          description: `Role "${role}" is not a valid ARIA role`,
          remediation: 'Use a valid ARIA role or remove the role attribute',
          wcagCriteria: ['4.1.2 Name, Role, Value'],
          automated: true,
        })
      }
    })
  }

  private async testStructure(container: HTMLElement) {
    // Check heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0

    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1))

      if (currentLevel > previousLevel + 1) {
        this.addIssue({
          id: `heading-${index}`,
          element: heading as HTMLElement,
          severity: 'warning',
          category: 'structure',
          message: `Heading level ${currentLevel} follows level ${previousLevel}`,
          description: 'Heading levels should not skip levels in the hierarchy',
          remediation: 'Use sequential heading levels (h1, h2, h3, etc.)',
          wcagCriteria: ['1.3.1 Info and Relationships'],
          automated: true,
        })
      }

      previousLevel = currentLevel
    })

    // Check for landmark regions
    const landmarks = container.querySelectorAll('main, nav, aside, section, article, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]')

    if (landmarks.length === 0 && container === document.body) {
      this.addIssue({
        id: 'landmarks-missing',
        element: container,
        severity: 'warning',
        category: 'structure',
        message: 'No landmark regions found',
        description: 'Page should have landmark regions for screen reader navigation',
        remediation: 'Add main, nav, aside, or appropriate ARIA landmarks',
        wcagCriteria: ['1.3.1 Info and Relationships'],
        automated: true,
      })
    }
  }

  private async testContent(container: HTMLElement) {
    // Check images for alt text
    const images = container.querySelectorAll('img')

    images.forEach((img, index) => {
      const altText = img.getAttribute('alt')
      const isDecorative = img.getAttribute('role') === 'presentation' ||
                          img.getAttribute('role') === 'none' ||
                          altText === ''

      if (altText === null && !isDecorative) {
        this.addIssue({
          id: `img-alt-${index}`,
          element: img,
          severity: 'error',
          category: 'content',
          message: 'Image missing alt attribute',
          description: 'All images must have alt attribute, even if empty for decorative images',
          remediation: 'Add alt attribute with descriptive text or alt="" for decorative images',
          wcagCriteria: ['1.1.1 Non-text Content'],
          automated: true,
        })
      }
    })

    // Check form labels
    const inputs = container.querySelectorAll('input, textarea, select')

    inputs.forEach((input, index) => {
      const htmlInput = input as HTMLElement
      const type = htmlInput.getAttribute('type')

      if (type === 'hidden') return

      const id = htmlInput.getAttribute('id')
      const hasLabel = id && container.querySelector(`label[for="${id}"]`)
      const hasAriaLabel = htmlInput.getAttribute('aria-label') ||
                          htmlInput.getAttribute('aria-labelledby')

      if (!hasLabel && !hasAriaLabel) {
        this.addIssue({
          id: `form-label-${index}`,
          element: htmlInput,
          severity: 'error',
          category: 'content',
          message: 'Form input missing label',
          description: 'All form inputs must have associated labels',
          remediation: 'Add label element with for attribute or aria-label',
          wcagCriteria: ['1.3.1 Info and Relationships', '3.3.2 Labels or Instructions'],
          automated: true,
        })
      }
    })
  }

  private async testTouchTargets(container: HTMLElement) {
    const interactiveElements = container.querySelectorAll(
      'button, [href], input[type="button"], input[type="submit"], input[type="reset"], [role="button"], [tabindex]:not([tabindex="-1"])'
    )

    interactiveElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const rect = htmlElement.getBoundingClientRect()

      // WCAG AAA requires minimum 44x44px touch targets
      if (rect.width < 44 || rect.height < 44) {
        this.addIssue({
          id: `touch-target-${index}`,
          element: htmlElement,
          severity: 'warning',
          category: 'touch-target',
          message: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          description: 'Interactive elements should be at least 44x44px for touch accessibility',
          remediation: 'Increase padding or dimensions to meet minimum touch target size',
          wcagCriteria: ['2.5.5 Target Size (Enhanced)'],
          automated: true,
        })
      }
    })
  }

  private addIssue(issue: Omit<AccessibilityIssue, 'id'> & { id?: string }) {
    this.issues.push({
      id: issue.id || `issue-${this.issues.length}`,
      ...issue,
    } as AccessibilityIssue)
  }

  private generateReport(): AccessibilityReport {
    const issuesBySeverity = this.issues.reduce((acc, issue) => {
      acc[issue.severity]++
      return acc
    }, { error: 0, warning: 0, info: 0 })

    const issuesByCategory = this.issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate compliance score
    const errorWeight = 10
    const warningWeight = 3
    const infoWeight = 1

    const totalPenalty =
      issuesBySeverity.error * errorWeight +
      issuesBySeverity.warning * warningWeight +
      issuesBySeverity.info * infoWeight

    const maxScore = this.testedElements * 2 // Arbitrary max score
    const score = Math.max(0, Math.round(((maxScore - totalPenalty) / maxScore) * 100))

    // Determine compliance level
    let complianceLevel: 'fail' | 'AA' | 'AAA' = 'AAA'
    if (issuesBySeverity.error > 0) {
      complianceLevel = 'fail'
    } else if (issuesBySeverity.warning > 0) {
      complianceLevel = 'AA'
    }

    return {
      score,
      totalIssues: this.issues.length,
      issuesBySeverity,
      issuesByCategory,
      issues: this.issues,
      testedElements: this.testedElements,
      complianceLevel,
      timestamp: new Date(),
    }
  }

  // Helper methods
  private rgbToHex(rgb: string): string | null {
    const result = rgb.match(/\d+/g)
    if (!result || result.length < 3) return null

    const r = parseInt(result[0])
    const g = parseInt(result[1])
    const b = parseInt(result[2])

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  private getFocusStyles(element: HTMLElement): { hasCustomFocus: boolean } {
    // This would need to be implemented to check for custom focus styles
    // For now, return false to be conservative
    return { hasCustomFocus: false }
  }

  private isValidAriaAttribute(attribute: string, tagName: string): boolean {
    // Simplified validation - in real implementation, check against ARIA spec
    const validAttributes = [
      'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
      'aria-expanded', 'aria-selected', 'aria-checked', 'aria-disabled',
      'aria-required', 'aria-invalid', 'aria-live', 'aria-atomic',
      'aria-relevant', 'aria-busy', 'aria-controls', 'aria-owns',
    ]
    return validAttributes.includes(attribute)
  }

  private isValidAriaRole(role: string): boolean {
    // Simplified validation - check against common ARIA roles
    const validRoles = [
      'button', 'link', 'checkbox', 'radio', 'tab', 'tabpanel',
      'dialog', 'alertdialog', 'alert', 'status', 'log', 'marquee',
      'timer', 'application', 'document', 'main', 'navigation',
      'banner', 'contentinfo', 'complementary', 'region',
    ]
    return validRoles.includes(role)
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AccessibilityTester({
  autoRun = false,
  continuous = false,
  includeTests = ['color-contrast', 'keyboard', 'focus', 'aria', 'structure', 'content', 'touch-target'],
  showUI = true,
  onTestComplete,
  highlightIssues = false,
  scope,
}: AccessibilityTesterProps) {
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([])

  const auditorRef = useRef<AccessibilityAuditor>()

  // Initialize auditor
  useEffect(() => {
    auditorRef.current = new AccessibilityAuditor(scope)
  }, [scope])

  const runTests = useCallback(async () => {
    if (!auditorRef.current || isRunning) return

    setIsRunning(true)

    try {
      const newReport = await auditorRef.current.runFullAudit()
      setReport(newReport)
      onTestComplete?.(newReport)

      // Highlight issues if requested
      if (highlightIssues) {
        const elements = newReport.issues.map(issue => issue.element)
        setHighlightedElements(elements)

        // Add visual indicators
        elements.forEach((element, index) => {
          const issue = newReport.issues[index]
          element.style.outline = `3px solid ${
            issue.severity === 'error' ? '#f56565' :
            issue.severity === 'warning' ? '#ed8936' : '#4299e1'
          }`
          element.style.outlineOffset = '2px'
          element.setAttribute('data-a11y-issue', issue.id)
        })
      }
    } catch (error) {
      console.error('Accessibility test failed:', error)
    } finally {
      setIsRunning(false)
    }
  }, [isRunning, onTestComplete, highlightIssues])

  const clearHighlights = useCallback(() => {
    highlightedElements.forEach(element => {
      element.style.outline = ''
      element.style.outlineOffset = ''
      element.removeAttribute('data-a11y-issue')
    })
    setHighlightedElements([])
  }, [highlightedElements])

  const exportReport = useCallback(() => {
    if (!report) return

    const reportData = {
      ...report,
      issues: report.issues.map(issue => ({
        ...issue,
        element: {
          tagName: issue.element.tagName,
          className: issue.element.className,
          id: issue.element.id,
          textContent: issue.element.textContent?.substring(0, 100),
        },
      })),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [report])

  // Auto-run tests
  useEffect(() => {
    if (autoRun) {
      runTests()
    }
  }, [autoRun, runTests])

  // Continuous testing
  useEffect(() => {
    if (!continuous) return

    const observer = new MutationObserver(() => {
      // Debounce the test runs
      setTimeout(runTests, 1000)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => observer.disconnect()
  }, [continuous, runTests])

  if (!showUI) return null

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Accessibility Tester</h3>
              <p className="text-sm text-default-600">WCAG AAA Compliance Validation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              startContent={<RefreshCw className="h-4 w-4" />}
              onPress={runTests}
              isLoading={isRunning}
              isDisabled={isRunning}
            >
              Run Tests
            </Button>

            {report && (
              <Button
                size="sm"
                variant="flat"
                startContent={<Download className="h-4 w-4" />}
                onPress={exportReport}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {report && (
          <>
            {/* Overall Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-medium font-semibold">Accessibility Score</h4>
                <Chip
                  color={report.complianceLevel === 'AAA' ? 'success' :
                         report.complianceLevel === 'AA' ? 'warning' : 'danger'}
                  variant="flat"
                >
                  WCAG {report.complianceLevel}
                </Chip>
              </div>

              <Progress
                value={report.score}
                color={report.score >= 90 ? 'success' :
                       report.score >= 70 ? 'warning' : 'danger'}
                className="w-full"
                showValueLabel
              />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-danger">{report.issuesBySeverity.error}</div>
                  <div className="text-sm text-default-600">Errors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">{report.issuesBySeverity.warning}</div>
                  <div className="text-sm text-default-600">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{report.testedElements}</div>
                  <div className="text-sm text-default-600">Elements Tested</div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Issues by Category */}
            <div className="space-y-3">
              <h4 className="text-medium font-semibold">Issues by Category</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(report.issuesByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-2 bg-default-50 rounded">
                    <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
                    <Badge color="danger" variant="flat">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            {/* Detailed Issues */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-medium font-semibold">Detailed Issues</h4>
                <Button
                  size="sm"
                  variant="flat"
                  color={highlightedElements.length > 0 ? 'warning' : 'primary'}
                  onPress={highlightedElements.length > 0 ? clearHighlights : () => {
                    // Highlight all issues
                    setHighlightedElements(report.issues.map(issue => issue.element))
                  }}
                >
                  {highlightedElements.length > 0 ? 'Clear Highlights' : 'Highlight Issues'}
                </Button>
              </div>

              <Accordion variant="bordered">
                {report.issues.map((issue, index) => (
                  <AccordionItem
                    key={issue.id}
                    title={
                      <div className="flex items-center gap-3">
                        {issue.severity === 'error' ? (
                          <XCircle className="h-4 w-4 text-danger" />
                        ) : issue.severity === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        ) : (
                          <Info className="h-4 w-4 text-primary" />
                        )}
                        <span className="text-sm font-medium">{issue.message}</span>
                        <Chip size="sm" variant="flat" color="default">
                          {issue.category}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-3 p-4">
                      <p className="text-sm text-default-700">{issue.description}</p>

                      <div>
                        <h6 className="text-xs font-semibold text-default-600 mb-1">How to Fix:</h6>
                        <p className="text-sm">{issue.remediation}</p>
                      </div>

                      <div>
                        <h6 className="text-xs font-semibold text-default-600 mb-1">WCAG Criteria:</h6>
                        <div className="flex flex-wrap gap-1">
                          {issue.wcagCriteria.map(criteria => (
                            <Code key={criteria} size="sm">{criteria}</Code>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-default-500">
                        <span>Element: {issue.element.tagName.toLowerCase()}</span>
                        {issue.element.className && (
                          <span>Class: {issue.element.className}</span>
                        )}
                        {issue.element.id && (
                          <span>ID: {issue.element.id}</span>
                        )}
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        )}

        {!report && !isRunning && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-default-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-default-600 mb-2">
              Ready to Test Accessibility
            </h4>
            <p className="text-sm text-default-500 mb-4">
              Run comprehensive WCAG AAA compliance tests on your components
            </p>
            <Button
              color="primary"
              startContent={<RefreshCw className="h-4 w-4" />}
              onPress={runTests}
            >
              Start Accessibility Test
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default AccessibilityTester