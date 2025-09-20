/**
 * DataTable - Advanced TanStack Table with filtering, sorting, pagination & export
 *
 * Features:
 * - Server-side pagination, filtering, and sorting
 * - Export to CSV, Excel, JSON
 * - PIPEDA + Quebec Law 25 compliant audit logging
 * - Responsive design
 * - Type-safe with TypeScript
 *
 * @compliance PIPEDA + Quebec Law 25 - All data access is automatically audited
 * @audit-level standard
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
  type Table as TanStackTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'

// Export functionality imports
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

// Types
export interface TableFilters {
  [key: string]: any
}

export interface TableMeta {
  totalCount?: number
  pageCount?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export interface DataTableProps<TData extends Record<string, any>> {
  data: TData[]
  columns: ColumnDef<TData>[]

  // Server-side operations
  onSortingChange?: (sorting: SortingState) => void
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  onPaginationChange?: (pagination: PaginationState) => void

  // State
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
  pagination?: PaginationState

  // Loading & meta
  isLoading?: boolean
  meta?: TableMeta

  // Features
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  enableColumnVisibility?: boolean
  enableExport?: boolean
  enableSelection?: boolean

  // Customization
  searchPlaceholder?: string
  exportFilename?: string
  className?: string

  // Quebec Law 25 & PIPEDA Compliance
  auditTableAccess?: (action: string, filters?: any) => void
  containsPersonalInfo?: boolean

  // Responsive
  mobileBreakpoint?: number
}

export interface FilterComponentProps {
  column: any
  value: string
  onChange: (value: string) => void
}

// Default filter component
const DefaultFilter: React.FC<FilterComponentProps> = ({ column, value, onChange }) => (
  <Input
    placeholder={`Filter ${column.columnDef.header || 'column'}...`}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="max-w-sm"
  />
)

export function DataTable<TData extends Record<string, any>>({
  data,
  columns,
  onSortingChange,
  onColumnFiltersChange,
  onPaginationChange,
  sorting = [],
  columnFilters = [],
  pagination = { pageIndex: 0, pageSize: 10 },
  isLoading = false,
  meta,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableColumnVisibility = true,
  enableExport = true,
  enableSelection = false,
  searchPlaceholder = 'Search...',
  exportFilename = 'data',
  className,
  auditTableAccess,
  containsPersonalInfo = false,
  mobileBreakpoint = 768,
}: DataTableProps<TData>) {
  // Local state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Audit logging for Quebec Law 25 & PIPEDA compliance
  const auditAction = useCallback((action: string, data?: any) => {
    if (auditTableAccess) {
      auditTableAccess(action, {
        containsPersonalInfo,
        timestamp: new Date().toISOString(),
        filters: columnFilters,
        sorting,
        jurisdiction: 'Quebec, Canada',
        compliance: ['PIPEDA', 'Law25'],
        ...data,
      })
    }
  }, [auditTableAccess, containsPersonalInfo, columnFilters, sorting])

  // Responsive detection
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < mobileBreakpoint)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileBreakpoint])

  // Audit table access on mount and filter changes
  React.useEffect(() => {
    auditAction('table_view', { dataCount: data.length })
  }, [data.length, auditAction])

  React.useEffect(() => {
    auditAction('filter_change', { filters: columnFilters })
  }, [columnFilters, auditAction])

  // Enhanced columns with responsive behavior
  const enhancedColumns = useMemo(() => {
    if (!isMobile) return columns

    // On mobile, show only first 2-3 most important columns + action column
    return columns.slice(0, 3)
  }, [columns, isMobile])

  // TanStack Table instance
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange,
      manualSorting: !!onSortingChange,
    }),
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange,
      manualFiltering: !!onColumnFiltersChange,
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: 'includesString',
    }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange,
      manualPagination: !!onPaginationChange,
      pageCount: meta?.pageCount ?? Math.ceil(data.length / pagination.pageSize),
    }),
    ...(enableColumnVisibility && {
      onColumnVisibilityChange: setColumnVisibility,
    }),
    state: {
      sorting,
      columnFilters,
      pagination,
      columnVisibility,
      globalFilter,
    },
  })

  // Export functionality
  const exportData = useCallback((format: 'csv' | 'excel' | 'json') => {
    auditAction('data_export', { format, rowCount: data.length })

    const exportData = table.getFilteredRowModel().rows.map(row =>
      row.getAllCells().reduce((acc, cell) => {
        const columnId = cell.column.id
        const value = cell.getValue()
        acc[columnId] = value
        return acc
      }, {} as Record<string, any>)
    )

    switch (format) {
      case 'csv':
        const csv = [
          // Headers
          table.getHeaderGroups()[0].headers.map(h => h.column.columnDef.header).join(','),
          // Rows
          ...exportData.map(row => Object.values(row).join(','))
        ].join('\n')

        const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        saveAs(csvBlob, `${exportFilename}.csv`)
        break

      case 'excel':
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
        XLSX.writeFile(workbook, `${exportFilename}.xlsx`)
        break

      case 'json':
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json;charset=utf-8;'
        })
        saveAs(jsonBlob, `${exportFilename}.json`)
        break
    }
  }, [table, data, exportFilename, auditAction])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-6 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        {enableFiltering && (
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => exportData('csv')}
                >
                  Export as CSV
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => exportData('excel')}
                >
                  Export as Excel
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  onCheckedChange={() => exportData('json')}
                >
                  Export as JSON
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Active filters */}
      {columnFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {columnFilters.map(filter => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.id}: {String(filter.value)}
              <button
                onClick={() => {
                  const newFilters = columnFilters.filter(f => f.id !== filter.id)
                  onColumnFiltersChange?.(newFilters)
                }}
                className="ml-1 hover:bg-muted rounded-sm"
              >
                ×
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onColumnFiltersChange?.([])}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="relative">
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {enableSorting && header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <ChevronUpIcon
                              className={`h-3 w-3 ${
                                header.column.getIsSorted() === 'asc'
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            <ChevronDownIcon
                              className={`h-3 w-3 -mt-1 ${
                                header.column.getIsSorted() === 'desc'
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={containsPersonalInfo ? 'border-l-4 border-l-violet-500' : ''}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                meta?.totalCount || data.length
              )}{' '}
              of {meta?.totalCount || data.length} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={value => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <span className="flex items-center gap-1 px-2 text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Warning */}
      {containsPersonalInfo && (
        <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-200 rounded-md">
          <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
          <span className="text-sm text-violet-700">
            This table contains personal information. All access is logged for PIPEDA and Quebec Law 25 compliance.
          </span>
        </div>
      )}
    </div>
  )
}

export default DataTable