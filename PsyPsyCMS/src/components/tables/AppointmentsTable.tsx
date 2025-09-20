/**
 * AppointmentsTable - Specialized table for managing healthcare appointments
 *
 * Features:
 * - Appointment status workflow management
 * - Urgency prioritization
 * - Client/Professional matching visualization
 * - Real-time status updates
 * - PIPEDA + Law 25 compliance
 *
 * @compliance PIPEDA + Quebec Law 25 - Appointment data contains personal health information
 * @audit-level critical
 */

import React, { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { useAppointmentsTableQuery, useTableMutation } from '@/hooks/useTableQuery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  DollarSignIcon,
  MoreHorizontalIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  ActivityIcon,
} from 'lucide-react'
import { type Appointment } from '@/types/appointment'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

interface AppointmentsTableProps {
  onStatusUpdate?: (appointmentId: string, status: Appointment['status'], notes?: string) => Promise<void>
  onViewDetails?: (appointment: Appointment) => void
  enableStatusActions?: boolean
  className?: string
}

const getStatusBadge = (status: Appointment['status']) => {
  const statusConfig = {
    draft: { variant: 'secondary' as const, label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    submitted: { variant: 'default' as const, label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    matching: { variant: 'secondary' as const, label: 'Matching', color: 'bg-purple-100 text-purple-800' },
    'offers-received': { variant: 'secondary' as const, label: 'Offers Received', color: 'bg-indigo-100 text-indigo-800' },
    confirmed: { variant: 'success' as const, label: 'Confirmed', color: 'bg-green-100 text-green-800' },
    completed: { variant: 'success' as const, label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
    cancelled: { variant: 'destructive' as const, label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <Badge variant={config.variant} className={config.color}>
      {config.label}
    </Badge>
  )
}

const getUrgencyBadge = (urgency: string) => {
  const urgencyConfig = {
    low: { variant: 'secondary' as const, label: 'Low', color: 'bg-gray-100 text-gray-800' },
    medium: { variant: 'secondary' as const, label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    high: { variant: 'destructive' as const, label: 'High', color: 'bg-orange-100 text-orange-800' },
    emergency: { variant: 'destructive' as const, label: 'Emergency', color: 'bg-red-100 text-red-800' },
  }

  const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.low

  return (
    <Badge variant={config.variant} className={`${config.color} font-medium`}>
      {urgency === 'emergency' && '🚨 '}
      {config.label}
    </Badge>
  )
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  onStatusUpdate,
  onViewDetails,
  enableStatusActions = true,
  className,
}) => {
  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState([])

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Build filter options
  const filterOptions = useMemo(() => {
    const filters = []

    if (statusFilter !== 'all') {
      filters.push({ id: 'status', value: statusFilter })
    }

    if (urgencyFilter !== 'all') {
      filters.push({ id: 'details.urgency', value: urgencyFilter })
    }

    if (typeFilter !== 'all') {
      filters.push({ id: 'details.type', value: typeFilter })
    }

    return filters
  }, [statusFilter, urgencyFilter, typeFilter])

  // Query
  const {
    data: result,
    isLoading,
    error,
  } = useAppointmentsTableQuery(
    { pagination, sorting, columnFilters: [...columnFilters, ...filterOptions] },
    {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
    }
  )

  // Mutations
  const updateMutation = useTableMutation<Appointment>('appointments', true)

  // Handle status update
  const handleStatusUpdate = async (appointmentId: string, newStatus: Appointment['status'], notes?: string) => {
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(appointmentId, newStatus, notes)
      } else {
        const updateData: any = {
          status: newStatus,
        }

        // Update workflow timestamps
        if (newStatus === 'confirmed') {
          updateData['workflow.confirmedAt'] = new Date()
        } else if (newStatus === 'completed') {
          updateData['workflow.completedAt'] = new Date()
        } else if (newStatus === 'cancelled') {
          updateData['workflow.cancelledAt'] = new Date()
          if (notes) {
            updateData['workflow.cancellationReason'] = notes
          }
        } else if (newStatus === 'matching') {
          updateData['workflow.matchingStartedAt'] = new Date()
        }

        await updateMutation.mutateAsync({
          action: 'update',
          id: appointmentId,
          data: updateData
        })
      }
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  // Column definitions
  const columns = useMemo<ColumnDef<Appointment>[]>(() => [
    {
      id: 'client',
      header: 'Client',
      cell: ({ row }) => {
        const appointment = row.original
        const initials = appointment.clientName
          .split(' ')
          .map(n => n.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2)

        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs font-medium bg-blue-100 text-blue-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {appointment.clientName}
              </p>
              <p className="text-xs text-muted-foreground">
                {appointment.details.isForSelf ? 'For self' : `For ${appointment.details.dependentInfo?.name}`}
              </p>
            </div>
          </div>
        )
      },
      size: 180,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const appointment = row.original
        return (
          <div className="flex flex-col gap-1">
            {getStatusBadge(appointment.status)}
            <div className="text-xs text-muted-foreground">
              {appointment.workflow.submittedAt && (
                <span>
                  {formatDistanceToNow(new Date(appointment.workflow.submittedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        )
      },
      size: 140,
    },
    {
      id: 'urgency',
      header: 'Priority',
      accessorKey: 'details.urgency',
      cell: ({ row }) => {
        const urgency = row.original.details.urgency
        return getUrgencyBadge(urgency)
      },
      size: 100,
    },
    {
      id: 'type',
      header: 'Service',
      cell: ({ row }) => {
        const appointment = row.original

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium capitalize">
              {appointment.details.type}
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.details.sessionType} • {appointment.details.duration} min
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.details.meetingType === 'online' ? '💻 Online' : '🏥 In-person'}
            </div>
          </div>
        )
      },
      size: 130,
    },
    {
      id: 'scheduling',
      header: 'Preferred Time',
      cell: ({ row }) => {
        const appointment = row.original
        const preferredDate = appointment.scheduling.preferredDates[0]
        const scheduledDate = appointment.scheduling.scheduledDateTime

        return (
          <div className="space-y-1">
            {scheduledDate ? (
              <div className="text-sm">
                <div className="font-medium">
                  {format(new Date(scheduledDate), 'MMM d, yyyy')}
                </div>
                <div className="text-muted-foreground">
                  {format(new Date(scheduledDate), 'h:mm a')}
                </div>
                <Badge variant="success" className="text-xs mt-1">
                  Scheduled
                </Badge>
              </div>
            ) : preferredDate ? (
              <div className="text-sm">
                <div className="text-muted-foreground">
                  {format(new Date(preferredDate), 'MMM d, yyyy')}
                </div>
                <div className="text-xs text-muted-foreground">
                  Preferred
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Flexible
              </span>
            )}
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'professional',
      header: 'Professional',
      cell: ({ row }) => {
        const appointment = row.original

        if (appointment.professionalName && appointment.professionalId) {
          const initials = appointment.professionalName
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2)

          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-green-100 text-green-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">Dr. {appointment.professionalName}</div>
                <Badge variant="success" className="text-xs">
                  Matched
                </Badge>
              </div>
            </div>
          )
        }

        return (
          <div className="text-sm text-muted-foreground">
            {appointment.status === 'matching' ? 'Finding match...' : 'Unassigned'}
          </div>
        )
      },
      size: 180,
    },
    {
      id: 'concerns',
      header: 'Concerns',
      cell: ({ row }) => {
        const concerns = row.original.details.concerns.slice(0, 2)
        const remaining = row.original.details.concerns.length - 2

        return (
          <div className="space-y-1">
            {concerns.map((concern, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {concern}
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remaining} more
              </Badge>
            )}
          </div>
        )
      },
      size: 160,
    },
    {
      id: 'budget',
      header: 'Budget',
      cell: ({ row }) => {
        const appointment = row.original

        return (
          <div className="text-sm">
            <div className="font-medium flex items-center gap-1">
              <DollarSignIcon className="h-3 w-3" />
              {appointment.budget.maxAmount}
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.budget.currency}
            </div>
            {appointment.budget.useInsurance && (
              <Badge variant="outline" className="text-xs mt-1">
                Insurance
              </Badge>
            )}
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const appointment = row.original
        const canProgress = appointment.status === 'submitted'
        const canComplete = appointment.status === 'confirmed'
        const canCancel = !['completed', 'cancelled'].includes(appointment.status)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(appointment)}>
                View Details
              </DropdownMenuItem>
              {enableStatusActions && canProgress && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(appointment.id, 'matching')}
                  className="text-purple-600"
                >
                  <PlayCircleIcon className="h-4 w-4 mr-2" />
                  Start Matching
                </DropdownMenuItem>
              )}
              {enableStatusActions && canComplete && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                  className="text-green-600"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              {enableStatusActions && canCancel && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(appointment.id, 'cancelled', 'Admin cancellation')}
                  className="text-red-600"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Cancel Appointment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 60,
    },
  ], [enableStatusActions, onViewDetails, updateMutation])

  // Audit function for Quebec Law 25 & PIPEDA compliance
  const auditTableAccess = (action: string, filters?: any) => {
    console.log('[AUDIT - Appointments Table]', {
      action,
      timestamp: new Date().toISOString(),
      containsPersonalInfo: true,
      containsHealthInfo: true, // Appointments contain health-related personal information
      jurisdiction: 'Quebec, Canada',
      compliance: ['PIPEDA', 'Law25'],
      sensitiveDataAccess: {
        statusFilter,
        urgencyFilter,
        typeFilter,
      },
      ...filters,
    })
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Appointments</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Appointments Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="matching">Matching</SelectItem>
                  <SelectItem value="offers-received">Offers Received</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency-filter">Priority</Label>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="emergency">🚨 Emergency</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Service Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="evaluation">Evaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {result?.data.filter(a => a.details.urgency === 'emergency').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Emergency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result?.data.filter(a => a.status === 'submitted').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">New</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {result?.data.filter(a => a.status === 'matching').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Matching</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result?.data.filter(a => a.status === 'confirmed').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {result?.data.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        data={result?.data || []}
        columns={columns}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        sorting={sorting}
        columnFilters={columnFilters}
        pagination={pagination}
        isLoading={isLoading}
        meta={result?.meta}
        searchPlaceholder="Search appointments by client name or concerns..."
        exportFilename="appointments"
        containsPersonalInfo={true}
        auditTableAccess={auditTableAccess}
        enableSorting
        enableFiltering
        enablePagination
        enableExport
        enableColumnVisibility
        className="bg-white"
      />
    </div>
  )
}

export default AppointmentsTable