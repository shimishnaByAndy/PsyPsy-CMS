/**
 * Healthcare-Specific NextUI Component Collections
 *
 * Pre-configured component combinations commonly used in healthcare applications
 * for better developer experience and consistency.
 */

import { ReactElement } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Badge,
  Avatar,
  Progress,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Checkbox,
  Switch,
  Alert,
  Accordion,
  AccordionItem,
} from './index'

/**
 * Healthcare Form Components
 * Common form patterns for patient data entry, professional profiles, etc.
 */
export const HealthcareFormComponents = {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  Switch,
  Alert,
} as const

/**
 * Patient Dashboard Components
 * Components commonly used in patient management interfaces
 */
export const PatientDashboardComponents = {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Chip,
  Badge,
  Progress,
  Tooltip,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} as const

/**
 * Professional Interface Components
 * Components for healthcare professional workflows
 */
export const ProfessionalInterfaceComponents = {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
  Alert,
  Progress,
  Badge,
} as const

/**
 * Compliance and Audit Components
 * Components for HIPAA/Quebec Law 25 compliance features
 */
export const ComplianceComponents = {
  Alert,
  Badge,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Accordion,
  AccordionItem,
} as const

/**
 * Medical Data Display Components
 * Components optimized for displaying medical information
 */
export const MedicalDataComponents = {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Badge,
  Progress,
  Tooltip,
} as const

/**
 * Appointment Management Components
 * Components for scheduling and appointment workflows
 */
export const AppointmentComponents = {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Badge,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
} as const

// Type definitions for healthcare component props
export interface HealthcareCardProps {
  patient?: {
    id: string
    name: string
    avatar?: string
  }
  appointment?: {
    id: string
    dateTime: string
    status: 'scheduled' | 'completed' | 'cancelled'
  }
  professional?: {
    id: string
    name: string
    title: string
    avatar?: string
  }
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'
  phiData?: boolean
}

export interface HealthcareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  complianceWarning?: boolean
  phiContent?: boolean
}

export interface HealthcareTableProps {
  data: Array<Record<string, any>>
  columns: Array<{
    key: string
    label: string
    isPHI?: boolean
    sortable?: boolean
  }>
  selectionMode?: 'single' | 'multiple' | 'none'
  isCompact?: boolean
  auditEnabled?: boolean
}

export interface HealthcareAlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  description?: string
  complianceRelated?: boolean
  dismissible?: boolean
}

// Healthcare-specific color and size variants
export const HealthcareVariants = {
  colors: {
    primary: 'primary', // Healthcare green
    success: 'success', // Medical success
    warning: 'warning', // Attention needed
    danger: 'danger',   // Critical/error
    phi: 'secondary',   // PHI data indicator
  },
  sizes: {
    compact: 'sm',      // Compact layouts
    standard: 'md',     // Standard spacing
    comfortable: 'lg',  // Accessibility-focused
  },
  radiuses: {
    medical: 'md',      // Professional appearance
    friendly: 'lg',     // Patient-facing interfaces
  },
} as const

// Healthcare-specific component configurations
export const HealthcareDefaults = {
  button: {
    size: 'md' as const,
    radius: 'md' as const,
    variant: 'solid' as const,
  },
  card: {
    radius: 'lg' as const,
    shadow: 'sm' as const,
    isBlurred: false,
  },
  input: {
    size: 'md' as const,
    radius: 'md' as const,
    variant: 'bordered' as const,
  },
  table: {
    color: 'default' as const,
    selectionMode: 'single' as const,
    isCompact: false,
  },
  modal: {
    size: 'lg' as const,
    backdrop: 'opaque' as const,
    scrollBehavior: 'inside' as const,
  },
} as const