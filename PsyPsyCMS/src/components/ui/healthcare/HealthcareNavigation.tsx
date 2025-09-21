import React from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Avatar,
  Chip,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Divider,
  Tooltip
} from '@/components/ui/nextui'
import {
  Shield,
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  AlertTriangle,
  Activity,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href?: string
  active?: boolean
  badge?: string | number
  disabled?: boolean
  requiresPermission?: string
  children?: NavigationItem[]
}

interface HealthcareNavigationProps {
  /**
   * Current user information
   */
  currentUser: {
    name: string
    email: string
    avatar?: string
    role: string
    permissions?: string[]
  }

  /**
   * Navigation items
   */
  navigationItems: NavigationItem[]

  /**
   * Current theme mode
   */
  isDarkMode?: boolean

  /**
   * Notification count
   */
  notificationCount?: number

  /**
   * Emergency alerts count
   */
  emergencyAlerts?: number

  /**
   * Compliance indicators
   */
  complianceStatus?: {
    hipaa: boolean
    law25: boolean
    pipeda: boolean
  }

  /**
   * System status
   */
  systemStatus?: 'operational' | 'maintenance' | 'error'

  /**
   * Event handlers
   */
  onNavigate?: (item: NavigationItem) => void
  onSearch?: (query: string) => void
  onToggleTheme?: () => void
  onLogout?: () => void
  onNotificationClick?: () => void
  onEmergencyClick?: () => void
  onSettingsClick?: () => void
  onHelpClick?: () => void

  /**
   * Mobile menu state
   */
  isMenuOpen?: boolean
  onMenuToggle?: () => void

  /**
   * Healthcare-specific features
   */
  showComplianceIndicators?: boolean
  showEmergencyAlerts?: boolean
  enableAuditMode?: boolean
}

/**
 * HealthcareNavigation - Advanced NextUI navigation component for healthcare applications
 *
 * Features:
 * - HIPAA compliance indicators
 * - Emergency alert system
 * - Role-based navigation
 * - Audit logging integration
 * - Responsive mobile design
 * - Accessibility optimized
 */
export function HealthcareNavigation({
  currentUser,
  navigationItems,
  isDarkMode = false,
  notificationCount = 0,
  emergencyAlerts = 0,
  complianceStatus,
  systemStatus = 'operational',
  onNavigate,
  onSearch,
  onToggleTheme,
  onLogout,
  onNotificationClick,
  onEmergencyClick,
  onSettingsClick,
  onHelpClick,
  isMenuOpen = false,
  onMenuToggle,
  showComplianceIndicators = true,
  showEmergencyAlerts = true,
  enableAuditMode = true,
}: HealthcareNavigationProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filter navigation items based on user permissions
  const filteredNavItems = navigationItems.filter(item => {
    if (!item.requiresPermission) return true
    return currentUser.permissions?.includes(item.requiresPermission) ?? false
  })

  // Get system status color
  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational':
        return 'success'
      case 'maintenance':
        return 'warning'
      case 'error':
        return 'danger'
      default:
        return 'default'
    }
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim())

      // Audit search action
      if (enableAuditMode) {
        console.log('[Healthcare Audit] Search Performed:', {
          query: searchQuery,
          user: currentUser.email,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  // Handle navigation click with audit logging
  const handleNavigationClick = (item: NavigationItem) => {
    if (item.disabled) return

    if (enableAuditMode) {
      console.log('[Healthcare Audit] Navigation:', {
        destination: item.href || item.id,
        label: item.label,
        user: currentUser.email,
        timestamp: new Date().toISOString(),
      })
    }

    onNavigate?.(item)
  }

  return (
    <Navbar
      className={cn(
        'healthcare-navbar border-b-1',
        systemStatus === 'error' && 'border-danger-200',
        systemStatus === 'maintenance' && 'border-warning-200'
      )}
      maxWidth="full"
      position="sticky"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={onMenuToggle}
    >
      {/* Brand and Logo */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary-600" />
              <span className="font-bold text-lg">PsyPsy CMS</span>
            </div>

            {/* System status indicator */}
            <Chip
              size="sm"
              color={getSystemStatusColor()}
              variant="dot"
              className="ml-2"
            >
              {systemStatus}
            </Chip>
          </div>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation Items */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {filteredNavItems.slice(0, 6).map((item) => (
          <NavbarItem key={item.id} isActive={item.active}>
            <Tooltip content={item.label} placement="bottom">
              <Button
                variant={item.active ? "solid" : "light"}
                color={item.active ? "primary" : "default"}
                size="sm"
                onClick={() => handleNavigationClick(item)}
                isDisabled={item.disabled}
                startContent={<item.icon className="h-4 w-4" />}
                endContent={
                  item.badge && (
                    <Chip size="sm" color="danger" variant="flat">
                      {item.badge}
                    </Chip>
                  )
                }
                className="min-w-fit"
              >
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            </Tooltip>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Right Side Actions */}
      <NavbarContent justify="end">
        {/* Emergency Alerts */}
        {showEmergencyAlerts && emergencyAlerts > 0 && (
          <NavbarItem>
            <Button
              color="danger"
              variant="flat"
              size="sm"
              onClick={onEmergencyClick}
              startContent={<AlertTriangle className="h-4 w-4" />}
              className="animate-pulse"
            >
              <span className="hidden sm:inline">Emergency</span>
              <Chip size="sm" color="danger" variant="solid">
                {emergencyAlerts}
              </Chip>
            </Button>
          </NavbarItem>
        )}

        {/* Compliance Indicators */}
        {showComplianceIndicators && complianceStatus && (
          <NavbarItem className="hidden md:flex">
            <div className="flex items-center space-x-1">
              {complianceStatus.hipaa && (
                <Chip size="sm" color="success" variant="bordered">
                  HIPAA
                </Chip>
              )}
              {complianceStatus.law25 && (
                <Chip size="sm" color="success" variant="bordered">
                  Law25
                </Chip>
              )}
            </div>
          </NavbarItem>
        )}

        {/* Notifications */}
        <NavbarItem>
          <Button
            variant="light"
            isIconOnly
            onClick={onNotificationClick}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                color="danger"
                content={notificationCount > 9 ? '9+' : notificationCount.toString()}
                size="sm"
                className="absolute -top-1 -right-1"
              >
                <div className="w-2 h-2" />
              </Badge>
            )}
          </Button>
        </NavbarItem>

        {/* Theme Toggle */}
        <NavbarItem>
          <Button
            variant="light"
            isIconOnly
            onClick={onToggleTheme}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </NavbarItem>

        {/* User Menu */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                size="sm"
                className="cursor-pointer"
                color="primary"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu actions">
              <DropdownSection title="Account" showDivider>
                <DropdownItem
                  key="profile"
                  description={currentUser.email}
                  startContent={<User className="h-4 w-4" />}
                >
                  {currentUser.name}
                </DropdownItem>
                <DropdownItem
                  key="role"
                  description={`Current role: ${currentUser.role}`}
                  startContent={<Shield className="h-4 w-4" />}
                >
                  Role & Permissions
                </DropdownItem>
              </DropdownSection>

              <DropdownSection title="Actions" showDivider>
                <DropdownItem
                  key="settings"
                  onClick={onSettingsClick}
                  startContent={<Settings className="h-4 w-4" />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="help"
                  onClick={onHelpClick}
                  startContent={<HelpCircle className="h-4 w-4" />}
                >
                  Help & Support
                </DropdownItem>
              </DropdownSection>

              <DropdownSection title="System">
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={onLogout}
                  startContent={<LogOut className="h-4 w-4" />}
                >
                  Sign Out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
        {/* Search in mobile menu */}
        <NavbarMenuItem>
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search patients, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" color="primary" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </NavbarMenuItem>

        <Divider className="my-2" />

        {/* Mobile navigation items */}
        {filteredNavItems.map((item) => (
          <NavbarMenuItem key={item.id}>
            <Button
              variant={item.active ? "solid" : "light"}
              color={item.active ? "primary" : "default"}
              size="lg"
              onClick={() => handleNavigationClick(item)}
              isDisabled={item.disabled}
              startContent={<item.icon className="h-5 w-5" />}
              endContent={
                item.badge && (
                  <Chip size="sm" color="danger" variant="flat">
                    {item.badge}
                  </Chip>
                )
              }
              className="w-full justify-start"
            >
              {item.label}
            </Button>
          </NavbarMenuItem>
        ))}

        <Divider className="my-2" />

        {/* Mobile compliance indicators */}
        {showComplianceIndicators && complianceStatus && (
          <NavbarMenuItem>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Compliance:</span>
              {complianceStatus.hipaa && (
                <Chip size="sm" color="success" variant="bordered">
                  HIPAA ✓
                </Chip>
              )}
              {complianceStatus.law25 && (
                <Chip size="sm" color="success" variant="bordered">
                  Quebec Law 25 ✓
                </Chip>
              )}
            </div>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </Navbar>
  )
}

// Predefined healthcare navigation configurations
export const HealthcareNavigationPresets = {
  // Standard healthcare navigation
  standard: {
    showComplianceIndicators: true,
    showEmergencyAlerts: true,
    enableAuditMode: true,
    complianceStatus: {
      hipaa: true,
      law25: true,
      pipeda: false,
    },
  },

  // Emergency mode navigation
  emergency: {
    showComplianceIndicators: true,
    showEmergencyAlerts: true,
    enableAuditMode: true,
    systemStatus: 'error' as const,
    emergencyAlerts: 1,
  },

  // Maintenance mode navigation
  maintenance: {
    showComplianceIndicators: false,
    showEmergencyAlerts: false,
    enableAuditMode: false,
    systemStatus: 'maintenance' as const,
  },
} as const