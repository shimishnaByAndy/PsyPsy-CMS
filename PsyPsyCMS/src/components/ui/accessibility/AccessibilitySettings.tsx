/**
 * AccessibilitySettings - User accessibility preferences panel
 *
 * Provides a comprehensive interface for users to customize accessibility
 * settings including visual, motor, and cognitive accommodations.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Switch,
  Slider,
  Select,
  SelectItem,
  Button,
  Divider,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Progress,
} from '@nextui-org/react'
import {
  Eye,
  EyeOff,
  Type,
  MousePointer,
  Keyboard,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Palette,
  Zap,
  Settings,
  Save,
  RotateCcw,
  TestTube,
  Info,
  CheckCircle,
} from 'lucide-react'
import { useAccessibility, AccessibilityOptions } from './AccessibilityUtils'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AccessibilityPreferences extends AccessibilityOptions {
  // Visual preferences
  highContrastMode?: boolean
  darkModePreference?: 'light' | 'dark' | 'auto'
  colorBlindnessType?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

  // Motor preferences
  clickDelay?: number
  doubleClickSpeed?: number
  dragDelay?: number

  // Cognitive preferences
  animationSpeed?: number
  autoplayMedia?: boolean
  complexAnimations?: boolean

  // Audio preferences
  soundEffects?: boolean
  voiceAnnouncements?: boolean
  audioDescriptions?: boolean
}

export interface AccessibilitySettingsProps {
  /**
   * Whether to show the settings panel
   */
  isOpen?: boolean

  /**
   * Callback when settings are saved
   */
  onSave?: (preferences: AccessibilityPreferences) => void

  /**
   * Callback when settings panel is closed
   */
  onClose?: () => void

  /**
   * Initial preferences
   */
  initialPreferences?: Partial<AccessibilityPreferences>

  /**
   * Whether to show advanced options
   */
  showAdvanced?: boolean

  /**
   * Whether to enable real-time preview
   */
  enablePreview?: boolean
}

// =============================================================================
// ACCESSIBILITY PRESETS
// =============================================================================

const ACCESSIBILITY_PRESETS = {
  default: {
    name: 'Default',
    description: 'Standard accessibility settings',
    preferences: {
      highContrast: false,
      reducedMotion: false,
      fontSizeMultiplier: 1.0,
      keyboardNavigation: true,
      screenReaderAnnouncements: true,
      focusManagement: 'auto',
    } as AccessibilityPreferences,
  },
  lowVision: {
    name: 'Low Vision',
    description: 'Enhanced visibility for users with visual impairments',
    preferences: {
      highContrast: true,
      fontSizeMultiplier: 1.5,
      keyboardNavigation: true,
      screenReaderAnnouncements: true,
      focusManagement: 'auto',
      darkModePreference: 'dark',
      complexAnimations: false,
    } as AccessibilityPreferences,
  },
  motorImpairment: {
    name: 'Motor Impairment',
    description: 'Optimized for users with motor disabilities',
    preferences: {
      reducedMotion: true,
      keyboardNavigation: true,
      focusManagement: 'auto',
      clickDelay: 500,
      doubleClickSpeed: 1000,
      dragDelay: 300,
      complexAnimations: false,
    } as AccessibilityPreferences,
  },
  cognitiveSupport: {
    name: 'Cognitive Support',
    description: 'Simplified interface for cognitive accessibility',
    preferences: {
      reducedMotion: true,
      fontSizeMultiplier: 1.25,
      animationSpeed: 0.5,
      autoplayMedia: false,
      complexAnimations: false,
      screenReaderAnnouncements: true,
    } as AccessibilityPreferences,
  },
  deaf: {
    name: 'Deaf/Hard of Hearing',
    description: 'Visual-focused accessibility features',
    preferences: {
      soundEffects: false,
      voiceAnnouncements: false,
      audioDescriptions: false,
      screenReaderAnnouncements: true,
      keyboardNavigation: true,
      focusManagement: 'auto',
    } as AccessibilityPreferences,
  },
} as const

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AccessibilitySettings({
  isOpen = false,
  onSave,
  onClose,
  initialPreferences = {},
  showAdvanced = false,
  enablePreview = true,
}: AccessibilitySettingsProps) {
  const { options, updateOptions } = useAccessibility()
  const { isOpen: isModalOpen, onOpen: onModalOpen, onOpenChange } = useDisclosure()

  // Local state for preferences
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    ...options,
    ...initialPreferences,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('default')

  // Update local state when options change
  useEffect(() => {
    setPreferences(prev => ({ ...prev, ...options }))
  }, [options])

  // Track changes
  useEffect(() => {
    const currentOptions = { ...options, ...initialPreferences }
    const hasChanged = JSON.stringify(preferences) !== JSON.stringify(currentOptions)
    setHasChanges(hasChanged)
  }, [preferences, options, initialPreferences])

  // Handle preference updates
  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))

    // Apply immediately if preview is enabled
    if (enablePreview && key in options) {
      updateOptions({ [key]: value } as Partial<AccessibilityOptions>)
    }
  }, [enablePreview, updateOptions, options])

  // Apply preset
  const applyPreset = useCallback((presetKey: string) => {
    const preset = ACCESSIBILITY_PRESETS[presetKey as keyof typeof ACCESSIBILITY_PRESETS]
    if (preset) {
      setPreferences(preset.preferences)
      setSelectedPreset(presetKey)

      if (enablePreview) {
        updateOptions(preset.preferences)
      }
    }
  }, [enablePreview, updateOptions])

  // Save preferences
  const savePreferences = useCallback(() => {
    updateOptions(preferences)
    onSave?.(preferences)
    setHasChanges(false)

    // Store in localStorage for persistence
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences))
  }, [preferences, updateOptions, onSave])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaultPrefs = ACCESSIBILITY_PRESETS.default.preferences
    setPreferences(defaultPrefs)
    setSelectedPreset('default')

    if (enablePreview) {
      updateOptions(defaultPrefs)
    }
  }, [enablePreview, updateOptions])

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-preferences')
    if (saved) {
      try {
        const savedPrefs = JSON.parse(saved)
        setPreferences(prev => ({ ...prev, ...savedPrefs }))
        updateOptions(savedPrefs)
      } catch (error) {
        console.warn('Failed to load saved accessibility preferences:', error)
      }
    }
  }, [updateOptions])

  const renderVisualSettings = () => (
    <div className="space-y-4">
      <h4 className="text-medium font-semibold flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Visual Settings
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">High Contrast Mode</div>
            <div className="text-sm text-default-600">
              Increases contrast for better visibility
            </div>
          </div>
          <Switch
            isSelected={preferences.highContrast || false}
            onValueChange={(value) => updatePreference('highContrast', value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Font Size</div>
            <Chip variant="flat" size="sm">
              {Math.round((preferences.fontSizeMultiplier || 1) * 100)}%
            </Chip>
          </div>
          <Slider
            size="sm"
            step={0.1}
            maxValue={2.0}
            minValue={0.8}
            value={preferences.fontSizeMultiplier || 1.0}
            onChange={(value) => updatePreference('fontSizeMultiplier', Array.isArray(value) ? value[0] : value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-default-500">
            <span>Small</span>
            <span>Normal</span>
            <span>Large</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Dark Mode Preference</div>
          <Select
            size="sm"
            selectedKeys={[preferences.darkModePreference || 'auto']}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string
              updatePreference('darkModePreference', value as any)
            }}
          >
            <SelectItem key="light" startContent={<Eye className="h-3 w-3" />}>
              Light
            </SelectItem>
            <SelectItem key="dark" startContent={<EyeOff className="h-3 w-3" />}>
              Dark
            </SelectItem>
            <SelectItem key="auto" startContent={<Monitor className="h-3 w-3" />}>
              Auto (System)
            </SelectItem>
          </Select>
        </div>

        {showAdvanced && (
          <div className="space-y-2">
            <div className="font-medium">Color Blindness Support</div>
            <Select
              size="sm"
              selectedKeys={[preferences.colorBlindnessType || 'none']}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string
                updatePreference('colorBlindnessType', value as any)
              }}
            >
              <SelectItem key="none">None</SelectItem>
              <SelectItem key="protanopia">Protanopia (Red-blind)</SelectItem>
              <SelectItem key="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
              <SelectItem key="tritanopia">Tritanopia (Blue-blind)</SelectItem>
              <SelectItem key="achromatopsia">Achromatopsia (Complete color blindness)</SelectItem>
            </Select>
          </div>
        )}
      </div>
    </div>
  )

  const renderMotorSettings = () => (
    <div className="space-y-4">
      <h4 className="text-medium font-semibold flex items-center gap-2">
        <MousePointer className="h-4 w-4" />
        Motor & Navigation
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Reduced Motion</div>
            <div className="text-sm text-default-600">
              Minimizes animations and transitions
            </div>
          </div>
          <Switch
            isSelected={preferences.reducedMotion || false}
            onValueChange={(value) => updatePreference('reducedMotion', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Keyboard Navigation</div>
            <div className="text-sm text-default-600">
              Enhanced keyboard navigation indicators
            </div>
          </div>
          <Switch
            isSelected={preferences.keyboardNavigation !== false}
            onValueChange={(value) => updatePreference('keyboardNavigation', value)}
          />
        </div>

        {showAdvanced && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Click Delay</div>
                <Chip variant="flat" size="sm">
                  {preferences.clickDelay || 0}ms
                </Chip>
              </div>
              <Slider
                size="sm"
                step={50}
                maxValue={1000}
                minValue={0}
                value={preferences.clickDelay || 0}
                onChange={(value) => updatePreference('clickDelay', Array.isArray(value) ? value[0] : value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Double Click Speed</div>
                <Chip variant="flat" size="sm">
                  {preferences.doubleClickSpeed || 500}ms
                </Chip>
              </div>
              <Slider
                size="sm"
                step={100}
                maxValue={2000}
                minValue={200}
                value={preferences.doubleClickSpeed || 500}
                onChange={(value) => updatePreference('doubleClickSpeed', Array.isArray(value) ? value[0] : value)}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )

  const renderCognitiveSettings = () => (
    <div className="space-y-4">
      <h4 className="text-medium font-semibold flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Cognitive Support
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Screen Reader Announcements</div>
            <div className="text-sm text-default-600">
              Announces important changes and updates
            </div>
          </div>
          <Switch
            isSelected={preferences.screenReaderAnnouncements !== false}
            onValueChange={(value) => updatePreference('screenReaderAnnouncements', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Complex Animations</div>
            <div className="text-sm text-default-600">
              Disable complex animations and effects
            </div>
          </div>
          <Switch
            isSelected={!(preferences.complexAnimations === false)}
            onValueChange={(value) => updatePreference('complexAnimations', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Autoplay Media</div>
            <div className="text-sm text-default-600">
              Automatically play videos and audio
            </div>
          </div>
          <Switch
            isSelected={preferences.autoplayMedia !== false}
            onValueChange={(value) => updatePreference('autoplayMedia', value)}
          />
        </div>

        {showAdvanced && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Animation Speed</div>
              <Chip variant="flat" size="sm">
                {Math.round((preferences.animationSpeed || 1) * 100)}%
              </Chip>
            </div>
            <Slider
              size="sm"
              step={0.1}
              maxValue={2.0}
              minValue={0.1}
              value={preferences.animationSpeed || 1.0}
              onChange={(value) => updatePreference('animationSpeed', Array.isArray(value) ? value[0] : value)}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderAudioSettings = () => (
    <div className="space-y-4">
      <h4 className="text-medium font-semibold flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Audio & Sound
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Sound Effects</div>
            <div className="text-sm text-default-600">
              Play UI sound effects and notifications
            </div>
          </div>
          <Switch
            isSelected={preferences.soundEffects !== false}
            onValueChange={(value) => updatePreference('soundEffects', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Voice Announcements</div>
            <div className="text-sm text-default-600">
              Spoken feedback for important actions
            </div>
          </div>
          <Switch
            isSelected={preferences.voiceAnnouncements !== false}
            onValueChange={(value) => updatePreference('voiceAnnouncements', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Audio Descriptions</div>
            <div className="text-sm text-default-600">
              Descriptive audio for visual content
            </div>
          </div>
          <Switch
            isSelected={preferences.audioDescriptions !== false}
            onValueChange={(value) => updatePreference('audioDescriptions', value)}
          />
        </div>
      </div>
    </div>
  )

  const content = (
    <div className="space-y-6">
      {/* Presets */}
      <div className="space-y-3">
        <h4 className="text-medium font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Quick Presets
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(ACCESSIBILITY_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant={selectedPreset === key ? 'solid' : 'bordered'}
              color={selectedPreset === key ? 'primary' : 'default'}
              size="sm"
              className="justify-start h-auto p-3"
              onPress={() => applyPreset(key)}
            >
              <div className="text-left">
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-default-600">{preset.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Settings Sections */}
      <div className="space-y-6">
        {renderVisualSettings()}
        <Divider />
        {renderMotorSettings()}
        <Divider />
        {renderCognitiveSettings()}
        <Divider />
        {renderAudioSettings()}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="flat"
          startContent={<RotateCcw className="h-4 w-4" />}
          onPress={resetToDefaults}
        >
          Reset to Defaults
        </Button>

        <div className="flex gap-2">
          {onClose && (
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
          )}
          <Button
            color="primary"
            startContent={<Save className="h-4 w-4" />}
            onPress={savePreferences}
            isDisabled={!hasChanges}
          >
            Save Settings
          </Button>
        </div>
      </div>

      {hasChanges && enablePreview && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-primary-700">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">Preview Mode Active</span>
          </div>
          <p className="text-xs text-primary-600 mt-1">
            Changes are being previewed in real-time. Click "Save Settings" to make them permanent.
          </p>
        </div>
      )}
    </div>
  )

  // If used as a modal
  if (isOpen) {
    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        closeButton
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Accessibility Settings</h3>
            <p className="text-sm text-default-600 font-normal">
              Customize your accessibility preferences for a better experience
            </p>
          </ModalHeader>
          <ModalBody>{content}</ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  // Standalone card component
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Accessibility Settings</h3>
          <p className="text-sm text-default-600">
            Customize your accessibility preferences for a better experience
          </p>
        </div>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  )
}

export default AccessibilitySettings