import React from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  TableProps,
  Selection,
  SortDescriptor
} from '@/components/ui/nextui'
import { Eye, EyeOff, MoreVertical, Shield, AlertTriangle, Lock, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HealthcareTableColumn {
  key: string
  label: string
  sortable?: boolean
  /**
   * Column contains PHI data and should be masked/protected
   */
  containsPHI?: boolean
  /**
   * Access level required to view this column
   */
  accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'
  /**
   * Column width configuration
   */
  width?: number | string
  /**
   * Custom cell renderer
   */
  render?: (item: any, key: string) => React.ReactNode
}

interface HealthcareTableProps extends Omit<TableProps, 'children'> {
  /**
   * Table variant for different healthcare contexts
   */
  variant?:
    | 'patients'        // Patient listing tables
    | 'appointments'    // Appointment schedules
    | 'medical-records' // Medical records/notes
    | 'professionals'   // Healthcare professional listings
    | 'audit'          // Audit and compliance logs
    | 'emergency'      // Emergency/critical data

  /**
   * Column definitions
   */
  columns: HealthcareTableColumn[]

  /**
   * Table data
   */
  data: Record<string, any>[]

  /**
   * PHI data masking settings
   */
  maskPHI?: boolean

  /**
   * Enable bulk operations
   */
  allowBulkOperations?: boolean

  /**
   * Selection configuration
   */
  selectionMode?: 'none' | 'single' | 'multiple'

  /**
   * Current user's access level
   */
  userAccessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'

  /**
   * Compliance level indicators
   */
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'

  /**
   * Row actions menu
   */
  rowActions?: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    action: (item: any) => void
    requiresPHI?: boolean
    accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'
    variant?: 'default' | 'danger' | 'warning'
  }>

  /**
   * Table-level actions
   */
  tableActions?: React.ReactNode

  /**
   * Emergency data indicator
   */
  hasEmergencyData?: boolean

  /**
   * Audit logging
   */
  auditAction?: string

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Selection change handler
   */
  onSelectionChange?: (selection: Selection) => void

  /**
   * Sort change handler
   */
  onSortChange?: (sort: SortDescriptor) => void

  /**
   * Row click handler
   */
  onRowClick?: (item: any) => void
}

/**
 * HealthcareTable - NextUI Table optimized for healthcare data with HIPAA compliance
 *
 * @example
 * ```tsx
 * <HealthcareTable
 *   variant="patients"
 *   columns={patientColumns}
 *   data={patientData}
 *   maskPHI={true}
 *   complianceLevel="HIPAA"
 *   userAccessLevel="confidential"
 *   selectionMode="multiple"
 *   onSelectionChange={handleSelection}
 * />
 * ```
 */
export function HealthcareTable({
  variant = 'patients',
  columns,
  data,
  maskPHI = false,
  allowBulkOperations = false,
  selectionMode = 'none',
  userAccessLevel = 'public',
  complianceLevel,
  rowActions = [],
  tableActions,
  hasEmergencyData = false,
  auditAction,
  isLoading = false,
  className,
  onSelectionChange,
  onSortChange,
  onRowClick,
  ...props
}: HealthcareTableProps) {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]))
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: '',
    direction: 'ascending'
  })
  const [maskedColumns, setMaskedColumns] = React.useState<Set<string>>(
    new Set(maskPHI ? columns.filter(col => col.containsPHI).map(col => col.key) : [])
  )

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'patients':
        return {
          headerColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600'
        }
      case 'appointments':
        return {
          headerColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600'
        }
      case 'medical-records':
        return {
          headerColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          accentColor: 'text-orange-600'
        }
      case 'professionals':
        return {
          headerColor: 'bg-green-50',
          borderColor: 'border-green-200',
          accentColor: 'text-green-600'
        }
      case 'audit':
        return {
          headerColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          accentColor: 'text-indigo-600'
        }
      case 'emergency':
        return {
          headerColor: 'bg-red-50',
          borderColor: 'border-red-200',
          accentColor: 'text-red-600'
        }
      default:
        return {
          headerColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          accentColor: 'text-gray-600'
        }
    }
  }

  const variantStyles = getVariantStyles()

  // Check if user can access a column
  const canAccessColumn = (column: HealthcareTableColumn) => {
    if (!column.accessLevel) return true

    const accessLevels = ['public', 'restricted', 'confidential', 'emergency']
    const userLevel = accessLevels.indexOf(userAccessLevel)
    const requiredLevel = accessLevels.indexOf(column.accessLevel)

    return userLevel >= requiredLevel
  }

  // Check if user can perform an action
  const canPerformAction = (action: any) => {
    if (!action.accessLevel) return true
    return canAccessColumn({ accessLevel: action.accessLevel } as HealthcareTableColumn)
  }

  // Toggle column masking
  const toggleColumnMask = (columnKey: string) => {
    const newMaskedColumns = new Set(maskedColumns)
    if (newMaskedColumns.has(columnKey)) {
      newMaskedColumns.delete(columnKey)
    } else {
      newMaskedColumns.add(columnKey)
    }
    setMaskedColumns(newMaskedColumns)

    // Audit PHI access
    if (auditAction && complianceLevel) {
      console.log('[Healthcare Audit] Column Access:', {
        action: newMaskedColumns.has(columnKey) ? 'mask_phi' : 'unmask_phi',
        column: columnKey,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSelectionChange = (selection: Selection) => {
    setSelectedKeys(selection)
    onSelectionChange?.(selection)

    // Audit selection for PHI data
    if (auditAction && data.some(item => columns.some(col => col.containsPHI))) {
      console.log('[Healthcare Audit] Table Selection:', {
        action: auditAction,
        selectionCount: selection === 'all' ? data.length : (selection as Set<string>).size,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSortChange = (sort: SortDescriptor) => {
    setSortDescriptor(sort)
    onSortChange?.(sort)
  }

  const renderCell = (item: any, columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column) return null

    // Check access permissions
    if (!canAccessColumn(column)) {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <Lock className="h-3 w-3" />
          <span className="text-xs">Access Denied</span>
        </div>
      )
    }

    const value = item[columnKey]

    // Custom renderer
    if (column.render) {
      return column.render(item, columnKey)
    }

    // PHI masking
    if (column.containsPHI && maskedColumns.has(columnKey)) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-purple-600">••••••••</span>
          <button
            onClick={() => toggleColumnMask(columnKey)}
            className="text-xs text-purple-500 hover:text-purple-700"
            aria-label="Show data"
          >
            <Eye className="h-3 w-3" />
          </button>
        </div>
      )
    }

    return value
  }

  const renderColumnHeader = (column: HealthcareTableColumn) => {
    return (
      <div className="flex items-center gap-2">
        <span>{column.label}</span>

        {/* PHI indicator */}
        {column.containsPHI && (
          <Badge color="warning" variant="flat" size="sm" content="PHI">
            <Shield className="h-3 w-3 text-purple-500" />
          </Badge>
        )}

        {/* Access level indicator */}
        {column.accessLevel === 'confidential' && (
          <Lock className="h-3 w-3 text-red-500" />
        )}

        {/* Masking toggle for PHI columns */}
        {column.containsPHI && (
          <button
            onClick={() => toggleColumnMask(column.key)}
            className="text-xs text-purple-500 hover:text-purple-700"
            aria-label={maskedColumns.has(column.key) ? 'Show column' : 'Hide column'}
          >
            {maskedColumns.has(column.key) ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    )
  }

  const renderRowActions = (item: any) => {
    const availableActions = rowActions.filter(action => canPerformAction(action))

    if (availableActions.length === 0) return null

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="light" isIconOnly>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          {availableActions.map((action) => (
            <DropdownItem
              key={action.key}
              onClick={() => action.action(item)}
              startContent={action.icon}
              color={action.variant === 'danger' ? 'danger' : 'default'}
            >
              {action.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    )
  }

  // Filter columns based on access level
  const accessibleColumns = columns.filter(canAccessColumn)

  return (
    <div className="space-y-4">
      {/* Table header with compliance indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasEmergencyData && (
            <Chip
              color="danger"
              variant="flat"
              startContent={<AlertTriangle className="h-3 w-3" />}
            >
              Emergency Data
            </Chip>
          )}

          {complianceLevel && (
            <Chip color="secondary" variant="bordered" size="sm">
              {complianceLevel} Compliant
            </Chip>
          )}

          {/* Selected count */}
          {selectedKeys !== 'all' && (selectedKeys as Set<string>).size > 0 && (
            <Chip color="primary" variant="flat" size="sm">
              {(selectedKeys as Set<string>).size} selected
            </Chip>
          )}
        </div>

        {/* Table actions */}
        {tableActions && (
          <div className="flex gap-2">
            {tableActions}
          </div>
        )}
      </div>

      {/* Main table */}
      <Table
        className={cn(
          'healthcare-table',
          variantStyles.borderColor,
          hasEmergencyData && 'ring-2 ring-red-200',
          className
        )}
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        {...props}
      >
        <TableHeader>
          {accessibleColumns.map((column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.sortable}
              width={column.width}
              className={cn(
                variantStyles.headerColor,
                column.containsPHI && 'bg-purple-50'
              )}
            >
              {renderColumnHeader(column)}
            </TableColumn>
          ))}
          {rowActions.length > 0 && (
            <TableColumn key="actions" width={60}>
              Actions
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={data}
          isLoading={isLoading}
          emptyContent="No healthcare records found"
        >
          {(item) => (
            <TableRow
              key={item.id || item.key}
              className={cn(
                'hover:bg-gray-50 cursor-pointer transition-colors',
                hasEmergencyData && 'bg-red-50/30'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {accessibleColumns.map((column) => (
                <TableCell key={column.key}>
                  {renderCell(item, column.key)}
                </TableCell>
              ))}
              {rowActions.length > 0 && (
                <TableCell>
                  {renderRowActions(item)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Predefined healthcare table configurations
export const HealthcareTablePresets = {
  // Patient table configuration
  patientTable: {
    variant: 'patients' as const,
    columns: [
      { key: 'name', label: 'Patient Name', sortable: true, containsPHI: true, accessLevel: 'confidential' as const },
      { key: 'id', label: 'Patient ID', sortable: true, containsPHI: true, accessLevel: 'confidential' as const },
      { key: 'dateOfBirth', label: 'Date of Birth', sortable: true, containsPHI: true, accessLevel: 'confidential' as const },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'lastVisit', label: 'Last Visit', sortable: true },
    ],
    maskPHI: true,
    selectionMode: 'multiple' as const,
    complianceLevel: 'HIPAA' as const,
  },

  // Appointment table configuration
  appointmentTable: {
    variant: 'appointments' as const,
    columns: [
      { key: 'date', label: 'Date', sortable: true },
      { key: 'time', label: 'Time', sortable: true },
      { key: 'patient', label: 'Patient', sortable: true, containsPHI: true, accessLevel: 'restricted' as const },
      { key: 'provider', label: 'Provider', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
    ],
    selectionMode: 'single' as const,
    complianceLevel: 'HIPAA' as const,
  },

  // Medical records table configuration
  medicalRecordTable: {
    variant: 'medical-records' as const,
    columns: [
      { key: 'date', label: 'Date', sortable: true },
      { key: 'type', label: 'Record Type', sortable: true },
      { key: 'provider', label: 'Provider', sortable: true },
      { key: 'diagnosis', label: 'Diagnosis', sortable: true, containsPHI: true, accessLevel: 'confidential' as const },
      { key: 'status', label: 'Status', sortable: true },
    ],
    maskPHI: true,
    selectionMode: 'multiple' as const,
    complianceLevel: 'HIPAA' as const,
    userAccessLevel: 'confidential' as const,
  },

  // Audit log table configuration
  auditTable: {
    variant: 'audit' as const,
    columns: [
      { key: 'timestamp', label: 'Timestamp', sortable: true },
      { key: 'user', label: 'User', sortable: true },
      { key: 'action', label: 'Action', sortable: true },
      { key: 'resource', label: 'Resource', sortable: true },
      { key: 'ip', label: 'IP Address', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
    ],
    selectionMode: 'multiple' as const,
    complianceLevel: 'Law25' as const,
  },
} as const