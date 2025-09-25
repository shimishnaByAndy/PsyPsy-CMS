/**
 * NextUI Theme Showcase for PsyPsy CMS
 *
 * Demonstrates the integration of our design tokens with NextUI themes,
 * showing healthcare-specific components and accessibility features.
 */

import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Switch,
  Progress,
  Chip,
  Badge,
  Avatar,
  Divider,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react'
import {
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Stethoscope,
  FileText,
  Bell,
  Settings,
} from 'lucide-react'
import { useHealthcareTheme, useEmergencyMode, ThemeSelector } from '@/providers/NextUIThemeProvider'
import { designTokens } from '@/ui/design-tokens'

// =============================================================================
// HEALTHCARE COMPONENT EXAMPLES
// =============================================================================

/**
 * Patient Status Card with theme integration
 */
function PatientStatusCard() {
  const { currentTheme } = useHealthcareTheme()
  const { isEmergencyMode } = useEmergencyMode()

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<User />}
            className="bg-primary-100 text-primary-600"
          />
          <div>
            <h4 className="text-lg font-semibold">Patient: Marie Dubois</h4>
            <p className="text-default-500 text-sm">ID: PAT-2024-0123</p>
          </div>
          <Badge
            content="PHI"
            color="secondary"
            variant="flat"
            className="ml-auto"
          >
            <Shield className="h-4 w-4" />
          </Badge>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full bg-success"
              style={{ backgroundColor: designTokens.colors.alert.success }}
            />
            <span className="text-sm">Vital Signs: Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: isEmergencyMode
                  ? designTokens.colors.alert.critical
                  : designTokens.colors.alert.info
              }}
            />
            <span className="text-sm">
              {isEmergencyMode ? 'Emergency Status' : 'Routine Care'}
            </span>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Treatment Progress</span>
            <span className="text-sm text-default-500">75%</span>
          </div>
          <Progress
            value={75}
            color="success"
            className="w-full"
          />
        </div>

        {/* Healthcare Actions */}
        <div className="flex flex-wrap gap-2">
          <Chip
            startContent={<Stethoscope className="h-3 w-3" />}
            variant="flat"
            color="primary"
            size="sm"
          >
            Last Checkup: 2 days ago
          </Chip>
          <Chip
            startContent={<FileText className="h-3 w-3" />}
            variant="flat"
            color="default"
            size="sm"
          >
            Notes: 3 entries
          </Chip>
        </div>
      </CardBody>

      <Divider />

      <CardFooter className="pt-4">
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<FileText className="h-4 w-4" />}
            className="flex-1"
          >
            View Records
          </Button>
          <Button
            size="sm"
            color="success"
            variant="flat"
            startContent={<CheckCircle className="h-4 w-4" />}
            className="flex-1"
          >
            Update Status
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

/**
 * Professional Dashboard Widget
 */
function ProfessionalDashboard() {
  const { userContext } = useHealthcareTheme()

  return (
    <Card className="w-full">
      <CardHeader>
        <h4 className="text-lg font-semibold">
          Professional Dashboard
          {userContext.locale === 'fr' && ' - Tableau de Bord'}
        </h4>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-default-500">
              {userContext.locale === 'fr' ? 'Patients Aujourd\'hui' : 'Patients Today'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">3</div>
            <div className="text-sm text-default-500">
              {userContext.locale === 'fr' ? 'En Attente' : 'Pending'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">8</div>
            <div className="text-sm text-default-500">
              {userContext.locale === 'fr' ? 'Complétés' : 'Completed'}
            </div>
          </div>
        </div>

        <Divider />

        {/* Next Appointment */}
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">
              {userContext.locale === 'fr' ? 'Prochain Rendez-vous' : 'Next Appointment'}
            </div>
            <div className="text-sm text-default-600">
              {userContext.locale === 'fr' ? '14:30 - Jean Martin' : '2:30 PM - Jean Martin'}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * Healthcare Form Example
 */
function HealthcareFormExample() {
  const { isEmergencyMode } = useEmergencyMode()

  return (
    <Card className="w-full">
      <CardHeader>
        <h4 className="text-lg font-semibold">Patient Information Form</h4>
      </CardHeader>

      <CardBody className="space-y-4">
        <Input
          label="Patient Name"
          placeholder="Enter patient full name"
          startContent={<User className="h-4 w-4 text-default-400" />}
          variant="bordered"
          className="w-full"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date of Birth"
            type="date"
            variant="bordered"
          />
          <Input
            label="Health Card Number"
            placeholder="**** **** ****"
            startContent={<Shield className="h-4 w-4 text-purple-500" />}
            variant="bordered"
            description="Protected Health Information"
          />
        </div>

        {/* Emergency Priority Toggle */}
        <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={`h-5 w-5 ${isEmergencyMode ? 'text-danger animate-pulse' : 'text-default-400'}`}
            />
            <div>
              <div className="font-medium">Emergency Priority</div>
              <div className="text-sm text-default-500">
                Activate for urgent cases requiring immediate attention
              </div>
            </div>
          </div>
          <Switch
            color="danger"
            isSelected={isEmergencyMode}
            thumbIcon={isEmergencyMode ? <AlertTriangle /> : undefined}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <input
            type="checkbox"
            id="consent"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="consent" className="text-sm">
            I consent to the collection and use of my personal health information
            in accordance with{' '}
            <a href="#" className="text-blue-600 underline">
              Quebec Law 25
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 underline">
              PIPEDA regulations
            </a>
            .
          </label>
        </div>
      </CardBody>

      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button
            color="default"
            variant="bordered"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            color={isEmergencyMode ? 'danger' : 'primary'}
            className="flex-1"
            startContent={isEmergencyMode ? <AlertTriangle /> : <CheckCircle />}
          >
            {isEmergencyMode ? 'Emergency Submit' : 'Submit Form'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

/**
 * Design Token Examples
 */
function DesignTokenExamples() {
  const { currentTheme } = useHealthcareTheme()

  const colorExamples = [
    { name: 'Medical Success', value: designTokens.colors.alert.success, usage: 'Healthy vitals, successful procedures' },
    { name: 'Medical Warning', value: designTokens.colors.alert.warning, usage: 'Attention needed, review required' },
    { name: 'Medical Critical', value: designTokens.colors.alert.critical, usage: 'Emergency situations, critical alerts' },
    { name: 'PHI Protection', value: designTokens.colors.compliance.phi, usage: 'Protected health information marking' },
    { name: 'Interactive Primary', value: designTokens.colors.interactive.primary, usage: 'Primary actions, links' },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <h4 className="text-lg font-semibold">Design Token Integration</h4>
        <p className="text-sm text-default-500">
          Healthcare-specific colors with WCAG AAA compliance
        </p>
      </CardHeader>

      <CardBody className="space-y-4">
        {colorExamples.map((color, index) => (
          <div key={index} className="flex items-center gap-4">
            <div
              className="w-8 h-8 rounded-lg border border-default-200"
              style={{ backgroundColor: color.value }}
            />
            <div className="flex-1">
              <div className="font-medium">{color.name}</div>
              <div className="text-sm text-default-500">{color.usage}</div>
              <code className="text-xs text-default-400">{color.value}</code>
            </div>
          </div>
        ))}

        <Divider />

        {/* Spacing Examples */}
        <div>
          <h5 className="font-medium mb-2">Spacing Scale (8px grid)</h5>
          <div className="space-y-2">
            {[1, 2, 4, 8, 12].map((scale) => (
              <div key={scale} className="flex items-center gap-4">
                <div
                  className="bg-primary-200 rounded"
                  style={{
                    width: designTokens.spacing[scale],
                    height: '12px',
                  }}
                />
                <span className="text-sm">
                  Scale {scale}: {designTokens.spacing[scale]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Examples */}
        <div>
          <h5 className="font-medium mb-2">Typography Scale</h5>
          <div className="space-y-2">
            <div style={{ fontSize: designTokens.typography.fontSize.base }}>
              Body text (16px) - Accessibility minimum
            </div>
            <div style={{ fontSize: designTokens.typography.fontSize.lg }}>
              Large text (18px) - Comfortable reading
            </div>
            <div style={{ fontSize: designTokens.typography.fontSize.xl }}>
              Subheading (20px) - Emphasized content
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// =============================================================================
// MAIN SHOWCASE COMPONENT
// =============================================================================

/**
 * Complete NextUI Theme Showcase
 */
export function NextUIThemeShowcase() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { currentTheme } = useHealthcareTheme()
  const { isEmergencyMode, activateEmergencyMode, deactivateEmergencyMode } = useEmergencyMode()

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">NextUI Healthcare Theme Integration</h1>
        <p className="text-default-600">
          Demonstration of design tokens integrated with NextUI components for healthcare workflows
        </p>
        <div className="flex justify-center gap-2">
          <Chip color="primary" variant="flat">Current Theme: {currentTheme}</Chip>
          {isEmergencyMode && (
            <Chip color="danger" variant="flat" className="animate-pulse">
              Emergency Mode Active
            </Chip>
          )}
        </div>
      </div>

      {/* Theme Controls */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <h3 className="text-lg font-semibold">Theme Controls</h3>
        </CardHeader>
        <CardBody>
          <ThemeSelector />
        </CardBody>
      </Card>

      {/* Emergency Mode Toggle */}
      <div className="flex justify-center">
        <Button
          color={isEmergencyMode ? "success" : "danger"}
          variant={isEmergencyMode ? "flat" : "solid"}
          onPress={isEmergencyMode ? deactivateEmergencyMode : activateEmergencyMode}
          startContent={<AlertTriangle className="h-4 w-4" />}
          className={isEmergencyMode ? "" : "animate-pulse"}
        >
          {isEmergencyMode ? "Deactivate Emergency Mode" : "Test Emergency Mode"}
        </Button>
      </div>

      {/* Component Examples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PatientStatusCard />
        <ProfessionalDashboard />
        <HealthcareFormExample />
        <DesignTokenExamples />
      </div>

      {/* Additional Features */}
      <div className="flex justify-center gap-4">
        <Tooltip content="View accessibility features">
          <Button
            variant="flat"
            onPress={onOpen}
            startContent={<Settings className="h-4 w-4" />}
          >
            Accessibility Features
          </Button>
        </Tooltip>
      </div>

      {/* Accessibility Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Accessibility & Compliance Features
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-success">✓ WCAG AAA Compliance</h4>
                    <p className="text-sm text-default-600">
                      7:1 contrast ratios for normal text, 4.5:1 for large text
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-success">✓ Touch Accessibility</h4>
                    <p className="text-sm text-default-600">
                      Minimum 44px touch targets for all interactive elements
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-success">✓ Quebec Law 25 Ready</h4>
                    <p className="text-sm text-default-600">
                      PHI marking, consent tracking, and data residency compliance
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-success">✓ Healthcare Workflows</h4>
                    <p className="text-sm text-default-600">
                      Emergency modes, professional themes, and medical status indicators
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-success">✓ Responsive Design</h4>
                    <p className="text-sm text-default-600">
                      Mobile-first approach with healthcare workflow considerations
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default NextUIThemeShowcase