/**
 * UsersTable - Specialized table for managing platform users
 *
 * Features:
 * - User role and type management
 * - Account status (active/blocked) controls
 * - Last login tracking
 * - User type filtering (Admin/Professional/Client)
 * - PIPEDA + Law 25 compliance
 *
 * @compliance PIPEDA + Quebec Law 25 - User data contains personal information
 * @audit-level high
 */

import React, { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from './DataTable'
import { useUsersTableQuery, useTableMutation } from '@/hooks/useTableQuery'
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
import { Switch } from '@/components/ui/switch'
import {
  UsersIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  MoreHorizontalIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CrownIcon,
  UserCogIcon,
} from 'lucide-react'
import { type User, type UserType, type UserRole, type UserStatus } from '@/types/user'
import { format, formatDistanceToNow } from 'date-fns'

interface UsersTableProps {
  onUserStatusChange?: (userId: string, isBlocked: boolean) => Promise<void>
  onViewProfile?: (user: User) => void
  enableUserActions?: boolean
  className?: string
}

const getUserTypeBadge = (userType: UserType) => {
  const typeConfig = {
    [UserType.ADMIN]: {
      variant: 'destructive' as const,
      label: 'Admin',
      icon: CrownIcon,
      color: 'bg-red-100 text-red-800'
    },
    [UserType.PROFESSIONAL]: {
      variant: 'default' as const,
      label: 'Professional',
      icon: UserCogIcon,
      color: 'bg-blue-100 text-blue-800'
    },
    [UserType.CLIENT]: {
      variant: 'secondary' as const,
      label: 'Client',
      icon: UserIcon,
      color: 'bg-green-100 text-green-800'
    },
  }

  const config = typeConfig[userType] || typeConfig[UserType.CLIENT]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

const getStatusBadge = (user: User) => {
  if (user.isBlocked) {
    return (
      <Badge variant="destructive" className="gap-1">
        <ShieldXIcon className="h-3 w-3" />
        Blocked
      </Badge>
    )
  }

  if (!user.isActive) {
    return (
      <Badge variant="secondary" className="gap-1">
        <ClockIcon className="h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  return (
    <Badge variant="success" className="gap-1 bg-green-100 text-green-800">
      <CheckCircleIcon className="h-3 w-3" />
      Active
    </Badge>
  )
}

export const UsersTable: React.FC<UsersTableProps> = ({
  onUserStatusChange,
  onViewProfile,
  enableUserActions = true,
  className,
}) => {
  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }])
  const [columnFilters, setColumnFilters] = useState([])

  // Filters
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all')

  // Build filter options
  const filterOptions = useMemo(() => {
    const filters = []

    if (userTypeFilter !== 'all') {
      filters.push({ id: 'userType', value: parseInt(userTypeFilter) })
    }

    if (statusFilter === 'active') {
      filters.push({ id: 'isActive', value: true })
      filters.push({ id: 'isBlocked', value: false })
    } else if (statusFilter === 'blocked') {
      filters.push({ id: 'isBlocked', value: true })
    } else if (statusFilter === 'inactive') {
      filters.push({ id: 'isActive', value: false })
    }

    if (onboardingFilter === 'complete') {
      filters.push({ id: 'onboardingComplete', value: true })
    } else if (onboardingFilter === 'incomplete') {
      filters.push({ id: 'onboardingComplete', value: false })
    }

    return filters
  }, [userTypeFilter, statusFilter, onboardingFilter])

  // Query
  const {
    data: result,
    isLoading,
    error,
  } = useUsersTableQuery(
    { pagination, sorting, columnFilters: [...columnFilters, ...filterOptions] },
    { userType: userTypeFilter !== 'all' ? parseInt(userTypeFilter) : undefined }
  )

  // Mutations
  const updateMutation = useTableMutation<User>('users', true)

  // Handle user status change
  const handleStatusChange = async (userId: string, isBlocked: boolean) => {
    try {
      if (onUserStatusChange) {
        await onUserStatusChange(userId, isBlocked)
      } else {
        await updateMutation.mutateAsync({
          action: 'update',
          id: userId,
          data: {
            isBlocked,
            updatedAt: new Date(),
          }
        })
      }
    } catch (error) {
      console.error('Status change failed:', error)
    }
  }

  // Column definitions
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original
        const initials = user.email
          .split('@')[0]
          .substring(0, 2)
          .toUpperCase()

        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {user.uid.substring(0, 8)}...
              </p>
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      id: 'userType',
      header: 'Type',
      accessorKey: 'userType',
      cell: ({ row }) => {
        const userType = row.original.userType
        return getUserTypeBadge(userType)
      },
      size: 120,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex flex-col gap-1">
            {getStatusBadge(user)}
            {user.lastLogin && (
              <span className="text-xs text-muted-foreground">
                Last: {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
              </span>
            )}
          </div>
        )
      },
      size: 140,
    },
    {
      id: 'onboarding',
      header: 'Onboarding',
      accessorKey: 'onboardingComplete',
      cell: ({ row }) => {
        const isComplete = row.original.onboardingComplete

        return (
          <Badge
            variant={isComplete ? 'success' : 'secondary'}
            className={isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
          >
            {isComplete ? 'Complete' : 'Pending'}
          </Badge>
        )
      },
      size: 100,
    },
    {
      id: 'preferences',
      header: 'Preferences',
      cell: ({ row }) => {
        const user = row.original
        const notifications = user.preferences?.notifications
        const theme = user.preferences?.theme
        const language = user.preferences?.language || 'en'

        return (
          <div className="space-y-1">
            <div className="text-xs">
              <span className="font-medium">Lang:</span> {language.toUpperCase()}
            </div>
            <div className="text-xs">
              <span className="font-medium">Theme:</span> {theme || 'auto'}
            </div>
            {notifications && (
              <div className="text-xs flex gap-1">
                {notifications.email && <Badge variant="outline" className="text-xs px-1">📧</Badge>}
                {notifications.push && <Badge variant="outline" className="text-xs px-1">📱</Badge>}
                {notifications.sms && <Badge variant="outline" className="text-xs px-1">💬</Badge>}
              </div>
            )}
          </div>
        )
      },
      size: 150,
    },
    {
      id: 'created',
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => {
        const createdAt = row.original.createdAt

        return (
          <div className="text-sm">
            <div>{format(new Date(createdAt), 'MMM d, yyyy')}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(createdAt), 'h:mm a')}
            </div>
          </div>
        )
      },
      size: 110,
    },
    {
      id: 'devices',
      header: 'Devices',
      cell: ({ row }) => {
        const deviceTokens = row.original.deviceTokens || []
        const deviceCount = deviceTokens.length

        return (
          <div className="text-center">
            <div className="text-sm font-medium">
              {deviceCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {deviceCount === 1 ? 'device' : 'devices'}
            </div>
          </div>
        )
      },
      size: 80,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original
        const isBlocked = user.isBlocked

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile?.(user)}>
                View Profile
              </DropdownMenuItem>
              {enableUserActions && (
                <>
                  {isBlocked ? (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(user.uid, false)}
                      className="text-green-600"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Unblock User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(user.uid, true)}
                      className="text-red-600"
                    >
                      <ShieldXIcon className="h-4 w-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 60,
    },
  ], [enableUserActions, onViewProfile, updateMutation])

  // Audit function for Quebec Law 25 & PIPEDA compliance
  const auditTableAccess = (action: string, filters?: any) => {
    console.log('[AUDIT - Users Table]', {
      action,
      timestamp: new Date().toISOString(),
      containsPersonalInfo: true,
      jurisdiction: 'Quebec, Canada',
      compliance: ['PIPEDA', 'Law25'],
      userDataAccess: {
        userTypeFilter,
        statusFilter,
        onboardingFilter,
      },
      ...filters,
    })
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error Loading Users</h3>
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
            <UsersIcon className="h-5 w-5" />
            Platform Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usertype-filter">User Type</Label>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={UserType.ADMIN.toString()}>Admin</SelectItem>
                  <SelectItem value={UserType.PROFESSIONAL.toString()}>Professional</SelectItem>
                  <SelectItem value={UserType.CLIENT.toString()}>Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="onboarding-filter">Onboarding</Label>
              <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {result?.data.filter(u => u.userType === UserType.ADMIN).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result?.data.filter(u => u.userType === UserType.PROFESSIONAL).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result?.data.filter(u => u.userType === UserType.CLIENT).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {result?.data.filter(u => u.isBlocked).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Blocked</div>
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
        searchPlaceholder="Search users by email or ID..."
        exportFilename="users"
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

export default UsersTable