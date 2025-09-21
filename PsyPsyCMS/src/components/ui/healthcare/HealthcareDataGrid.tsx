import React from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Tooltip,
  Progress
} from '@/components/ui/nextui'
import {
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataGridColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  resizable?: boolean
  hideable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  /**
   * Column contains PHI data
   */
  containsPHI?: boolean
  /**
   * Access level required to view this column
   */
  accessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'
  /**
   * Data type for filtering and sorting
   */
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  /**
   * Enum options for filter dropdown
   */
  enumOptions?: Array<{ value: string; label: string }>
  /**
   * Custom cell renderer
   */
  render?: (value: any, item: any, column: DataGridColumn) => React.ReactNode
  /**
   * Custom header renderer
   */
  renderHeader?: (column: DataGridColumn) => React.ReactNode
}

interface FilterState {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between'
  value: any
  value2?: any // For 'between' operator
}

interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

interface HealthcareDataGridProps {
  /**
   * Column definitions
   */
  columns: DataGridColumn[]

  /**
   * Table data
   */
  data: Record<string, any>[]

  /**
   * Grid variant
   */
  variant?: 'patients' | 'appointments' | 'medical-records' | 'audit' | 'professionals'

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Selection configuration
   */
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void

  /**
   * Pagination configuration
   */
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
  }

  /**
   * Search and filtering
   */
  searchable?: boolean
  filterable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  onFilter?: (filters: FilterState[]) => void
  onSort?: (sort: SortState) => void

  /**
   * Export functionality
   */
  exportable?: boolean
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void

  /**
   * Bulk actions
   */
  bulkActions?: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    requiresConfirmation?: boolean
    confirmationMessage?: string
    action: (selectedItems: any[]) => void
  }>

  /**
   * Row actions
   */
  rowActions?: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    requiresPermission?: string
    action: (item: any) => void
  }>

  /**
   * PHI and compliance settings
   */
  maskPHI?: boolean
  userAccessLevel?: 'public' | 'restricted' | 'confidential' | 'emergency'
  complianceLevel?: 'HIPAA' | 'Law25' | 'PIPEDA'
  auditAction?: string

  /**
   * Advanced features
   */
  virtualScrolling?: boolean
  groupBy?: string
  expandableRows?: boolean
  rowExpansionContent?: (item: any) => React.ReactNode

  /**
   * Event handlers
   */
  onRowClick?: (item: any) => void
  onRowDoubleClick?: (item: any) => void

  /**
   * Custom styling
   */
  className?: string
  rowClassName?: (item: any) => string
}

/**
 * HealthcareDataGrid - Advanced data grid component for healthcare applications
 *
 * Features:
 * - PHI data protection and masking
 * - Role-based column access control
 * - Advanced filtering and search
 * - Bulk operations with audit logging
 * - Export functionality
 * - Virtual scrolling for large datasets
 * - Compliance monitoring
 */
export function HealthcareDataGrid({
  columns,
  data,
  variant = 'patients',
  isLoading = false,
  selectionMode = 'none',
  selectedKeys = new Set(),
  onSelectionChange,
  pagination,
  searchable = true,
  filterable = true,
  searchPlaceholder = 'Search healthcare records...',
  onSearch,
  onFilter,
  onSort,
  exportable = true,
  onExport,
  bulkActions = [],
  rowActions = [],
  maskPHI = false,
  userAccessLevel = 'public',
  complianceLevel,
  auditAction,
  virtualScrolling = false,
  groupBy,
  expandableRows = false,
  rowExpansionContent,
  onRowClick,
  onRowDoubleClick,
  className,
  rowClassName,
}: HealthcareDataGridProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<FilterState[]>([])
  const [sortState, setSortState] = React.useState<SortState | null>(null)
  const [maskedColumns, setMaskedColumns] = React.useState<Set<string>>(
    new Set(maskPHI ? columns.filter(col => col.containsPHI).map(col => col.key) : [])
  )
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  const { isOpen: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure()
  const { isOpen: isExportOpen, onOpen: openExport, onClose: closeExport } = useDisclosure()

  // Filter columns based on access level and hidden state
  const visibleColumns = columns.filter(col => {
    if (hiddenColumns.has(col.key)) return false
    if (!col.accessLevel) return true

    const accessLevels = ['public', 'restricted', 'confidential', 'emergency']
    const userLevel = accessLevels.indexOf(userAccessLevel)
    const requiredLevel = accessLevels.indexOf(col.accessLevel)

    return userLevel >= requiredLevel
  })

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)

    // Audit search action
    if (auditAction && complianceLevel) {
      console.log('[Healthcare Audit] Data Grid Search:', {
        action: auditAction,
        query,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey: string) => {
    const newHiddenColumns = new Set(hiddenColumns)
    if (newHiddenColumns.has(columnKey)) {
      newHiddenColumns.delete(columnKey)
    } else {
      newHiddenColumns.add(columnKey)
    }
    setHiddenColumns(newHiddenColumns)
  }

  // Handle PHI masking toggle
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
      console.log('[Healthcare Audit] PHI Column Access:', {
        action: newMaskedColumns.has(columnKey) ? 'mask_phi' : 'unmask_phi',
        column: columnKey,
        complianceLevel,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Handle row expansion
  const toggleRowExpansion = (rowKey: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(rowKey)) {
      newExpandedRows.delete(rowKey)
    } else {
      newExpandedRows.add(rowKey)
    }
    setExpandedRows(newExpandedRows)
  }

  // Handle bulk actions
  const handleBulkAction = (action: any) => {
    const selectedItems = data.filter(item => selectedKeys.has(item.id))

    if (action.requiresConfirmation) {
      if (confirm(action.confirmationMessage || `Are you sure you want to ${action.label.toLowerCase()}?`)) {
        action.action(selectedItems)

        // Audit bulk action
        if (auditAction && complianceLevel) {
          console.log('[Healthcare Audit] Bulk Action:', {
            action: action.key,
            itemCount: selectedItems.length,
            complianceLevel,
            timestamp: new Date().toISOString(),
          })
        }
      }
    } else {
      action.action(selectedItems)
    }
  }

  // Render cell content
  const renderCell = (item: any, columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column) return null

    const value = item[columnKey]

    // Custom renderer
    if (column.render) {
      return column.render(value, item, column)
    }

    // PHI masking
    if (column.containsPHI && maskedColumns.has(columnKey)) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-purple-600">••••••••</span>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onClick={() => toggleColumnMask(columnKey)}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    // Default rendering based on data type
    if (column.dataType === 'date' && value) {
      return new Date(value).toLocaleDateString()
    }

    if (column.dataType === 'boolean') {
      return value ? (
        <CheckCircle className="h-4 w-4 text-success" />
      ) : (
        <XCircle className="h-4 w-4 text-danger" />
      )
    }

    return value?.toString() || ''
  }

  // Render column header
  const renderColumnHeader = (column: DataGridColumn) => {
    if (column.renderHeader) {
      return column.renderHeader(column)
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{column.label}</span>

        {/* PHI indicator */}
        {column.containsPHI && (
          <Badge color="warning" variant="flat" size="sm">
            PHI
          </Badge>
        )}

        {/* Access level indicator */}
        {column.accessLevel === 'confidential' && (
          <Shield className="h-3 w-3 text-red-500" />
        )}

        {/* PHI masking toggle */}
        {column.containsPHI && (
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onClick={() => toggleColumnMask(column.key)}
          >
            {maskedColumns.has(column.key) ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Sortable indicator */}
        {column.sortable && (
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onClick={() => {
              const newDirection = sortState?.column === column.key && sortState.direction === 'asc' ? 'desc' : 'asc'
              const newSort = { column: column.key, direction: newDirection }
              setSortState(newSort)
              onSort?.(newSort)
            }}
          >
            ↕️
          </Button>
        )}
      </div>
    )
  }

  // Render row actions
  const renderRowActions = (item: any) => {
    if (rowActions.length === 0) return null

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" variant="light" isIconOnly>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          {rowActions.map((action) => (
            <DropdownItem
              key={action.key}
              onClick={() => action.action(item)}
              startContent={action.icon}
              color={action.color}
            >
              {action.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    )
  }

  const selectedItemsCount = selectedKeys.size
  const hasSelectedItems = selectedItemsCount > 0

  return (
    <div className={cn('healthcare-data-grid', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          {/* Search */}
          {searchable && (
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              startContent={<Search className="h-4 w-4" />}
              className="w-80"
              size="sm"
            />
          )}

          {/* Filters */}
          {filterable && (
            <Button
              variant="bordered"
              size="sm"
              onClick={openFilter}
              startContent={<Filter className="h-4 w-4" />}
            >
              Filters
              {filters.length > 0 && (
                <Chip size="sm" color="primary">
                  {filters.length}
                </Chip>
              )}
            </Button>
          )}

          {/* Column visibility */}
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" size="sm">
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {columns.filter(col => col.hideable !== false).map((column) => (
                <DropdownItem
                  key={column.key}
                  onClick={() => toggleColumnVisibility(column.key)}
                  startContent={
                    <Checkbox
                      isSelected={!hiddenColumns.has(column.key)}
                      onChange={() => toggleColumnVisibility(column.key)}
                    />
                  }
                >
                  {column.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection info */}
          {hasSelectedItems && (
            <Chip color="primary" variant="flat">
              {selectedItemsCount} selected
            </Chip>
          )}

          {/* Bulk actions */}
          {hasSelectedItems && bulkActions.length > 0 && (
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" color="primary">
                  Actions
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {bulkActions.map((action) => (
                  <DropdownItem
                    key={action.key}
                    onClick={() => handleBulkAction(action)}
                    startContent={action.icon}
                    color={action.color}
                  >
                    {action.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}

          {/* Export */}
          {exportable && (
            <Button
              variant="bordered"
              size="sm"
              onClick={openExport}
              startContent={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          )}

          {/* Refresh */}
          <Button
            variant="light"
            size="sm"
            isIconOnly
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Table
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        aria-label="Healthcare data grid"
        className="min-h-[400px]"
      >
        <TableHeader>
          {visibleColumns.map((column) => (
            <TableColumn
              key={column.key}
              width={column.width}
              minWidth={column.minWidth}
              maxWidth={column.maxWidth}
              allowsSorting={column.sortable}
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
          loadingContent={<Spinner />}
          emptyContent="No healthcare records found"
        >
          {(item) => (
            <TableRow
              key={item.id}
              className={cn(
                'hover:bg-default-50 cursor-pointer',
                rowClassName?.(item)
              )}
              onClick={() => onRowClick?.(item)}
              onDoubleClick={() => onRowDoubleClick?.(item)}
            >
              {visibleColumns.map((column) => (
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

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-default-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Select
              size="sm"
              value={pagination.limit.toString()}
              onChange={(e) => pagination.onLimitChange(parseInt(e.target.value))}
              className="w-20"
            >
              <SelectItem key="10" value="10">10</SelectItem>
              <SelectItem key="25" value="25">25</SelectItem>
              <SelectItem key="50" value="50">50</SelectItem>
              <SelectItem key="100" value="100">100</SelectItem>
            </Select>

            <Pagination
              total={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={pagination.onPageChange}
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Export Modal */}
      <Modal isOpen={isExportOpen} onClose={closeExport}>
        <ModalContent>
          <ModalHeader>Export Data</ModalHeader>
          <ModalBody>
            <p>Choose export format:</p>
            <div className="flex gap-2 mt-4">
              <Button color="primary" onClick={() => onExport?.('csv')}>
                CSV
              </Button>
              <Button color="primary" onClick={() => onExport?.('excel')}>
                Excel
              </Button>
              <Button color="primary" onClick={() => onExport?.('pdf')}>
                PDF
              </Button>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={closeExport}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}