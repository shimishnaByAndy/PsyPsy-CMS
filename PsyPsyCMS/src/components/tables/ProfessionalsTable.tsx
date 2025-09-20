/**
 * ProfessionalsTable - Specialized table for managing healthcare professionals
 *
 * Features:
 * - Professional verification status management
 * - License and credential tracking
 * - Quebec Order membership validation
 * - Specialty filtering
 * - PIPEDA + Law 25 compliance
 *
 * @compliance PIPEDA + Quebec Law 25 - Professional data contains personal information
 * @audit-level high
 */

import React, { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { useProfessionalsTableQuery, useTableMutation } from '@/hooks/useTableQuery'
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
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MoreHorizontalIcon,
  UserCheckIcon,
  AlertTriangleIcon,
  MapPinIcon,
  AwardIcon,
  CalendarIcon,
} from 'lucide-react'
import { type Professional } from '@/types/professional'
import { format } from 'date-fns'

interface ProfessionalsTableProps {
  onVerificationAction?: (professionalId: string, action: 'verify' | 'reject', notes?: string) => Promise<void>
  onViewProfile?: (professional: Professional) => void
  enableVerificationActions?: boolean
  className?: string
}

const getVerificationStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { variant: 'secondary' as const, icon: ClockIcon, label: 'Pending', color: 'text-yellow-600' },
    verified: { variant: 'success' as const, icon: CheckCircleIcon, label: 'Verified', color: 'text-green-600' },
    rejected: { variant: 'destructive' as const, icon: XCircleIcon, label: 'Rejected', color: 'text-red-600' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

const getSpecialtiesBadges = (specialties: string[]) => {
  const maxShow = 2
  const visibleSpecialties = specialties.slice(0, maxShow)
  const remainingCount = specialties.length - maxShow

  return (
    <div className="flex flex-wrap gap-1">
      {visibleSpecialties.map(specialty => (
        <Badge key={specialty} variant="outline" className="text-xs">
          {specialty}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}

export const ProfessionalsTable: React.FC<ProfessionalsTableProps> = ({
  onVerificationAction,
  onViewProfile,
  enableVerificationActions = true,
  className,
}) => {
  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState([])

  // Filters
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('')
  const [cityFilter, setCityFilter] = useState<string>('')

  // Build filter options
  const filterOptions = useMemo(() => {
    const filters = []

    if (verificationFilter !== 'all') {
      filters.push({ id: 'professionalInfo.verificationStatus', value: verificationFilter })
    }

    if (specialtyFilter) {
      filters.push({ id: 'services.specialties', value: specialtyFilter })
    }

    if (cityFilter) {
      filters.push({ id: 'businessInfo.businessAddress.city', value: cityFilter })
    }

    return filters
  }, [verificationFilter, specialtyFilter, cityFilter])

  // Query
  const {
    data: result,
    isLoading,
    error,
  } = useProfessionalsTableQuery(
    { pagination, sorting, columnFilters: [...columnFilters, ...filterOptions] },
    { verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined }
  )

  // Mutations
  const updateMutation = useTableMutation<Professional>('professionals', true)

  // Handle verification
  const handleVerification = async (professionalId: string, action: 'verify' | 'reject', notes?: string) => {
    try {
      if (onVerificationAction) {
        await onVerificationAction(professionalId, action, notes)
      } else {
        // Default implementation
        await updateMutation.mutateAsync({
          action: 'update',
          id: professionalId,
          data: {
            'professionalInfo.verificationStatus': action === 'verify' ? 'verified' : 'rejected',
            'professionalInfo.isVerified': action === 'verify',
            'professionalInfo.verificationDate': new Date(),
            'professionalInfo.verificationNotes': notes,
          }
        })
      }
    } catch (error) {
      console.error('Verification failed:', error)
    }
  }

  // Column definitions
  const columns = useMemo<ColumnDef<Professional>[]>(() => [
    {
      id: 'professional',
      header: 'Professional',
      cell: ({ row }) => {
        const professional = row.original
        const fullName = `${professional.personalInfo.firstName} ${professional.personalInfo.lastName}`
        const initials = `${professional.personalInfo.firstName.charAt(0)}${professional.personalInfo.lastName.charAt(0)}`

        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage
                src={professional.profile?.profilePhoto}
                alt={fullName}
              />
              <AvatarFallback className="text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                Dr. {fullName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{professional.businessInfo.businessName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  {professional.businessInfo.businessAddress.city}
                </span>
              </div>
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      id: 'verification',
      header: 'Status',
      accessorKey: 'professionalInfo.verificationStatus',
      cell: ({ row }) => {
        const status = row.original.professionalInfo.verificationStatus
        return (
          <div className="flex flex-col gap-1">
            {getVerificationStatusBadge(status)}
            {row.original.professionalInfo.verificationDate && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(row.original.professionalInfo.verificationDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        )
      },
      size: 120,
    },
    {
      id: 'credentials',
      header: 'Credentials',
      cell: ({ row }) => {
        const professional = row.original
        const licenseExpiry = new Date(professional.professionalInfo.licenseExpiry)
        const isExpiringSoon = licenseExpiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <AwardIcon className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-xs">
                {professional.professionalInfo.licenseNumber}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span className={isExpiringSoon ? 'text-red-600 font-medium' : ''}>
                Exp: {format(licenseExpiry, 'MMM yyyy')}
              </span>
              {isExpiringSoon && <AlertTriangleIcon className="h-3 w-3 text-red-600" />}
            </div>
            <div className="text-xs text-muted-foreground">
              {professional.professionalInfo.orderMembership.orderName}
            </div>
          </div>
        )
      },
      size: 180,
    },
    {
      id: 'specialties',
      header: 'Specialties',
      cell: ({ row }) => {
        const specialties = row.original.services.specialties || []
        return getSpecialtiesBadges(specialties)
      },
      size: 200,
    },
    {
      id: 'clients',
      header: 'Clients',
      cell: ({ row }) => {
        const professional = row.original
        const isAccepting = professional.status.currentlyAcceptingClients

        return (
          <div className="text-center space-y-1">
            <div className="text-sm font-medium">
              {professional.metrics.totalSessions || 0}
            </div>
            <Badge
              variant={isAccepting ? 'success' : 'secondary'}
              className="text-xs"
            >
              {isAccepting ? 'Accepting' : 'Full'}
            </Badge>
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: ({ row }) => {
        const rating = row.original.metrics.rating
        const reviewCount = row.original.metrics.reviewCount

        return (
          <div className="text-center space-y-1">
            <div className="text-sm font-medium">
              {rating ? `⭐ ${rating.toFixed(1)}` : '—'}
            </div>
            <div className="text-xs text-muted-foreground">
              {reviewCount ? `${reviewCount} reviews` : 'No reviews'}
            </div>
          </div>
        )
      },
      size: 100,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const professional = row.original
        const isPending = professional.professionalInfo.verificationStatus === 'pending'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile?.(professional)}>
                View Profile
              </DropdownMenuItem>
              {enableVerificationActions && isPending && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleVerification(professional.id, 'verify')}
                    className="text-green-600"
                  >
                    <UserCheckIcon className="h-4 w-4 mr-2" />
                    Verify Professional
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleVerification(professional.id, 'reject')}
                    className="text-red-600"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject Application
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 60,
    },
  ], [enableVerificationActions, onViewProfile, updateMutation])

  // Audit function for Quebec Law 25 & PIPEDA compliance
  const auditTableAccess = (action: string, filters?: any) => {
    console.log('[AUDIT - Professionals Table]', {
      action,
      timestamp: new Date().toISOString(),
      containsPersonalInfo: true,
      jurisdiction: 'Quebec, Canada',
      compliance: ['PIPEDA', 'Law25'],
      professionalDataAccess: {
        verificationFilter,
        specialtyFilter,
        cityFilter,
      },
      ...filters,
    })
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Professionals</h3>
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
            <UserCheckIcon className="h-5 w-5" />
            Healthcare Professionals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verification-filter">Verification Status</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty-filter">Specialty</Label>
              <Input
                id="specialty-filter"
                placeholder="Filter by specialty..."
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city-filter">City</Label>
              <Input
                id="city-filter"
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result?.data.filter(p => p.professionalInfo.verificationStatus === 'verified').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {result?.data.filter(p => p.professionalInfo.verificationStatus === 'pending').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result?.data.filter(p => p.status.currentlyAcceptingClients).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Accepting Clients</div>
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
        searchPlaceholder="Search professionals by name, business, or license..."
        exportFilename="professionals"
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

export default ProfessionalsTable