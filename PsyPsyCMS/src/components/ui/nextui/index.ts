/**
 * NextUI Component Exports for Tree-Shaking
 *
 * This file provides optimized imports for NextUI components used in PsyPsy CMS.
 * Only import components that are actually used to enable tree-shaking.
 *
 * Usage:
 * import { Button, Card, Input } from '@/components/ui/nextui'
 */

// Core NextUI components commonly used in healthcare applications
export {
  Button,
  ButtonGroup,
} from '@nextui-org/button'

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@nextui-org/card'

export {
  Input,
  Textarea,
} from '@nextui-org/input'

export {
  Select,
  SelectItem,
  SelectSection,
} from '@nextui-org/select'

export {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from '@nextui-org/table'

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/modal'

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@nextui-org/dropdown'

export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from '@nextui-org/navbar'

export {
  Avatar,
  AvatarGroup,
} from '@nextui-org/avatar'

export {
  Chip,
} from '@nextui-org/chip'

export {
  Badge,
} from '@nextui-org/badge'

export {
  Progress,
} from '@nextui-org/progress'

export {
  Spinner,
} from '@nextui-org/spinner'

export {
  Tooltip,
} from '@nextui-org/tooltip'

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@nextui-org/popover'

export {
  Accordion,
  AccordionItem,
} from '@nextui-org/accordion'

export {
  Tabs,
  Tab,
} from '@nextui-org/tabs'

export {
  Checkbox,
  CheckboxGroup,
} from '@nextui-org/checkbox'

export {
  Radio,
  RadioGroup,
} from '@nextui-org/radio'

export {
  Switch,
} from '@nextui-org/switch'

export {
  Slider,
} from '@nextui-org/slider'

export {
  DatePicker,
  DateRangePicker,
} from '@nextui-org/date-picker'

export {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from '@nextui-org/autocomplete'

export {
  Breadcrumbs,
  BreadcrumbItem,
} from '@nextui-org/breadcrumbs'

export {
  Pagination,
} from '@nextui-org/pagination'

export {
  Skeleton,
} from '@nextui-org/skeleton'

export {
  Alert,
} from '@nextui-org/alert'

export {
  Code,
} from '@nextui-org/code'

export {
  Snippet,
} from '@nextui-org/snippet'

export {
  Kbd,
} from '@nextui-org/kbd'

export {
  Link,
} from '@nextui-org/link'

export {
  Image,
} from '@nextui-org/image'

export {
  Divider,
} from '@nextui-org/divider'

export {
  Spacer,
} from '@nextui-org/spacer'

export {
  User,
} from '@nextui-org/user'

// Healthcare-specific component groupings for convenience
export * from './healthcare-components'

// Healthcare Design System Components
export { HealthcareButton, HealthcareButtonPresets } from '../healthcare/HealthcareButton'
export { HealthcareCard, HealthcareCardPresets } from '../healthcare/HealthcareCard'
export { HealthcareInput, HealthcareTextarea, HealthcareInputPresets } from '../healthcare/HealthcareInput'
export { HealthcareTable, HealthcareTablePresets } from '../healthcare/HealthcareTable'
export { HealthcareModal, HealthcareModalPresets } from '../healthcare/HealthcareModal'
export { HealthcareNavigation, HealthcareNavigationPresets } from '../healthcare/HealthcareNavigation'
export { HealthcareDataGrid } from '../healthcare/HealthcareDataGrid'
export {
  StatWidget,
  ProgressWidget,
  AlertWidget,
  TeamWidget,
  AppointmentWidget,
  HealthcareDashboardPresets
} from '../healthcare/HealthcareDashboardWidgets'
export {
  ProgressRing,
  SimpleBarChart,
  TimeSeriesChart,
  MiniChart,
  MetricCard,
  HealthcareCharts
} from '../healthcare/HealthcareCharts'
export {
  AdvancedSearch,
  QuickSearch,
  SmartSuggestions
} from '../healthcare/HealthcareSearchPatterns'

// Re-export NextUI types
export type * from '@nextui-org/theme'
export type * from './healthcare-components'