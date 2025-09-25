/**
 * PatientAppointmentHistory Component
 *
 * Comprehensive appointment history timeline for patients with WCAG AAA
 * accessibility and Quebec healthcare compliance features.
 */

import React, { useState, useMemo } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Badge,
  Button,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Tooltip,
  Divider,
  Select,
  SelectItem,
  DatePicker,
  Input
} from '@/components/ui/nextui'
import { HealthcareButton } from '@/components/ui/nextui'
import { Appointment, AppointmentStatus, AppointmentType, Client } from '@/types'
import { formatDate, formatTime } from '@/lib/utils'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  FileText,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  RotateCcw,
  XCircle,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Activity,
  TrendingUp,
  BarChart3,
  Download,
  Plus
} from 'lucide-react'

interface PatientAppointmentHistoryProps {
  patient: Client
  appointments: Appointment[]
  canEdit?: boolean
  canSchedule?: boolean
  onViewAppointment?: (appointment: Appointment) => void
  onEditAppointment?: (appointment: Appointment) => void
  onRescheduleAppointment?: (appointment: Appointment) => void
  onCancelAppointment?: (appointment: Appointment) => void
  onScheduleNew?: () => void
  onExportHistory?: () => void
  className?: string
}

interface FilterOptions {
  status: AppointmentStatus | 'all'
  type: AppointmentType | 'all'
  dateRange: {
    start: Date | null
    end: Date | null
  }
  search: string
}

interface AppointmentStats {
  total: number
  completed: number
  cancelled: number
  noShow: number
  upcoming: number
  completionRate: number
  averageDuration: number
}

export function PatientAppointmentHistory({
  patient,
  appointments,
  canEdit = false,
  canSchedule = false,
  onViewAppointment,
  onEditAppointment,
  onRescheduleAppointment,
  onCancelAppointment,
  onScheduleNew,
  onExportHistory,
  className
}: PatientAppointmentHistoryProps) {
  const [selectedTab, setSelectedTab] = useState<string>('timeline')
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
    dateRange: {
      start: null,
      end: null
    },
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Calculate appointment statistics
  const stats: AppointmentStats = useMemo(() => {
    const now = new Date()
    const completed = appointments.filter(apt => apt.status === 'completed').length
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
    const noShow = appointments.filter(apt => apt.status === 'no_show').length
    const upcoming = appointments.filter(apt =>
      apt.status === 'scheduled' && new Date(apt.scheduledDate) > now
    ).length

    const totalDuration = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + apt.duration, 0)
    const averageDuration = completed > 0 ? Math.round(totalDuration / completed) : 0

    return {
      total: appointments.length,
      completed,
      cancelled,
      noShow,
      upcoming,
      completionRate: appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 0,
      averageDuration
    }
  }, [appointments])

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Status filter
      if (filters.status !== 'all' && appointment.status !== filters.status) {
        return false
      }

      // Type filter
      if (filters.type !== 'all' && appointment.type !== filters.type) {
        return false
      }

      // Date range filter
      const appointmentDate = new Date(appointment.scheduledDate)
      if (filters.dateRange.start && appointmentDate < filters.dateRange.start) {
        return false
      }
      if (filters.dateRange.end && appointmentDate > filters.dateRange.end) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchFields = [
          appointment.type,
          appointment.status,
          appointment.location.type,
          appointment.professional.user.profile?.fullName || '',
          appointment.notes?.map(note => note.content).join(' ') || ''
        ].join(' ').toLowerCase()

        if (!searchFields.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [appointments, filters])

  // Sort appointments by date (newest first)
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) =>
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    )
  }, [filteredAppointments])

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'primary'
      case 'in_progress':
        return 'secondary'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'warning'
      case 'no_show':
        return 'danger'
      case 'rescheduled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Calendar className="h-4 w-4" />
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />
      case 'rescheduled':
        return <RotateCcw className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'video_call':
        return <Video className="h-4 w-4" />
      case 'phone_call':
        return <Phone className="h-4 w-4" />
      case 'in_person':
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const toggleCardExpansion = (appointmentId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId)
      } else {
        newSet.add(appointmentId)
      }
      return newSet
    })
  }

  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      dateRange: { start: null, end: null },
      search: ''
    })
  }

  if (appointments.length === 0) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-12">
          <Calendar className="h-16 w-16 text-default-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-default-600 mb-2">
            No Appointment History
          </h3>
          <p className="text-default-500 mb-6">
            This patient has no appointment history yet.
          </p>
          {canSchedule && (
            <HealthcareButton
              variant="primary"
              onClick={onScheduleNew}
              auditAction="schedule_appointment"
              complianceLevel="HIPAA"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule First Appointment
            </HealthcareButton>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header with Stats and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold">Appointment History</h2>
                <p className="text-sm text-default-600">
                  {stats.total} total appointments • {stats.completionRate}% completion rate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="light"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>

              {onExportHistory && (
                <HealthcareButton
                  size="sm"
                  variant="secondary"
                  onClick={onExportHistory}
                  auditAction="export_appointment_history"
                  complianceLevel="HIPAA"
                >
                  <Download className="h-4 w-4" />
                </HealthcareButton>
              )}

              {canSchedule && onScheduleNew && (
                <HealthcareButton
                  size="sm"
                  variant="primary"
                  onClick={onScheduleNew}
                  auditAction="schedule_appointment"
                  complianceLevel="HIPAA"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule
                </HealthcareButton>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <Card className="bg-primary-50 border border-primary-200">
              <CardBody className="text-center py-3">
                <p className="text-xl font-bold text-primary-600">{stats.upcoming}</p>
                <p className="text-xs text-primary-700">Upcoming</p>
              </CardBody>
            </Card>

            <Card className="bg-success-50 border border-success-200">
              <CardBody className="text-center py-3">
                <p className="text-xl font-bold text-success-600">{stats.completed}</p>
                <p className="text-xs text-success-700">Completed</p>
              </CardBody>
            </Card>

            <Card className="bg-warning-50 border border-warning-200">
              <CardBody className="text-center py-3">
                <p className="text-xl font-bold text-warning-600">{stats.cancelled}</p>
                <p className="text-xs text-warning-700">Cancelled</p>
              </CardBody>
            </Card>

            <Card className="bg-danger-50 border border-danger-200">
              <CardBody className="text-center py-3">
                <p className="text-xl font-bold text-danger-600">{stats.noShow}</p>
                <p className="text-xs text-danger-700">No Show</p>
              </CardBody>
            </Card>

            <Card className="bg-secondary-50 border border-secondary-200">
              <CardBody className="text-center py-3">
                <p className="text-xl font-bold text-secondary-600">{stats.averageDuration}</p>
                <p className="text-xs text-secondary-700">Avg Duration (min)</p>
              </CardBody>
            </Card>
          </div>
        </CardHeader>

        {/* Filters Panel */}
        {showFilters && (
          <CardBody className="border-t border-divider">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Status"
                placeholder="All statuses"
                selectedKeys={[filters.status]}
                onSelectionChange={(keys) => {
                  const status = Array.from(keys)[0] as AppointmentStatus | 'all'
                  setFilters(prev => ({ ...prev, status }))
                }}
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="scheduled">Scheduled</SelectItem>
                <SelectItem key="confirmed">Confirmed</SelectItem>
                <SelectItem key="in_progress">In Progress</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="cancelled">Cancelled</SelectItem>
                <SelectItem key="no_show">No Show</SelectItem>
                <SelectItem key="rescheduled">Rescheduled</SelectItem>
              </Select>

              <Select
                label="Type"
                placeholder="All types"
                selectedKeys={[filters.type]}
                onSelectionChange={(keys) => {
                  const type = Array.from(keys)[0] as AppointmentType | 'all'
                  setFilters(prev => ({ ...prev, type }))
                }}
              >
                <SelectItem key="all">All Types</SelectItem>
                <SelectItem key="initial_consultation">Initial Consultation</SelectItem>
                <SelectItem key="therapy_session">Therapy Session</SelectItem>
                <SelectItem key="assessment">Assessment</SelectItem>
                <SelectItem key="follow_up">Follow Up</SelectItem>
                <SelectItem key="group_session">Group Session</SelectItem>
                <SelectItem key="emergency">Emergency</SelectItem>
              </Select>

              <Input
                label="Search"
                placeholder="Search appointments..."
                value={filters.search}
                onValueChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                startContent={<Search className="h-4 w-4 text-default-400" />}
              />

              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  variant="light"
                  onClick={resetFilters}
                  aria-label="Reset filters"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        aria-label="Appointment history views"
        classNames={{
          tabList: "w-full",
          cursor: "w-full bg-primary-500",
          tab: "max-w-fit px-4 h-12",
          tabContent: "group-data-[selected=true]:text-white"
        }}
      >
        <Tab
          key="timeline"
          title={
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </div>
          }
        >
          {/* Timeline View */}
          <div className="space-y-4">
            {sortedAppointments.map((appointment, index) => {
              const isExpanded = expandedCards.has(appointment.id)
              const appointmentDate = new Date(appointment.scheduledDate)
              const isUpcoming = appointmentDate > new Date()

              return (
                <Card
                  key={appointment.id}
                  className={`relative ${isUpcoming ? 'border-primary-200 bg-primary-50' : ''}`}
                >
                  {/* Timeline connector */}
                  {index < sortedAppointments.length - 1 && (
                    <div className="absolute left-8 top-16 w-0.5 h-8 bg-default-200" />
                  )}

                  <CardBody>
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-full bg-${getStatusColor(appointment.status)}-100 border-2 border-${getStatusColor(appointment.status)}-300 flex-shrink-0`}>
                        {getStatusIcon(appointment.status)}
                      </div>

                      {/* Appointment Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {appointment.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </h3>
                              <Chip
                                size="sm"
                                color={getStatusColor(appointment.status) as any}
                                variant="flat"
                                startContent={getStatusIcon(appointment.status)}
                              >
                                {appointment.status.replace('_', ' ')}
                              </Chip>
                              {isUpcoming && (
                                <Badge color="primary" variant="flat">Upcoming</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-default-600" />
                                <span>
                                  {formatDate(appointment.scheduledDate, {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-default-600" />
                                <span>
                                  {formatTime(appointment.scheduledDate)} ({appointment.duration} min)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {getLocationIcon(appointment.location.type)}
                                <span className="capitalize">
                                  {appointment.location.type.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <User className="h-4 w-4 text-default-600" />
                              <span>
                                Dr. {appointment.professional.user.profile?.lastName || 'Unknown'}
                              </span>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-default-200">
                                {appointment.notes && appointment.notes.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-medium text-sm mb-2">Notes:</h4>
                                    <div className="space-y-2">
                                      {appointment.notes.map((note) => (
                                        <div key={note.id} className="bg-default-100 p-3 rounded-lg">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-default-600">
                                              {note.type} • {formatDate(note.createdAt)}
                                            </span>
                                            {note.isPrivate && (
                                              <Badge size="sm" color="warning" variant="flat">
                                                Private
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm">{note.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {appointment.sessionSummary && (
                                  <div className="mb-4">
                                    <h4 className="font-medium text-sm mb-2">Session Summary:</h4>
                                    <div className="bg-success-50 p-3 rounded-lg border border-success-200">
                                      <p className="text-sm text-success-800">
                                        {appointment.sessionSummary.clientProgress}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {appointment.location.instructions && (
                                  <div className="mb-4">
                                    <h4 className="font-medium text-sm mb-2">Location Instructions:</h4>
                                    <p className="text-sm text-default-700 bg-default-100 p-3 rounded-lg">
                                      {appointment.location.instructions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => toggleCardExpansion(appointment.id)}
                              aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            <Button
                              size="sm"
                              variant="light"
                              onClick={() => onViewAppointment?.(appointment)}
                              aria-label="View appointment details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {canEdit && isUpcoming && (
                              <>
                                <Button
                                  size="sm"
                                  variant="light"
                                  onClick={() => onEditAppointment?.(appointment)}
                                  aria-label="Edit appointment"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="light"
                                  onClick={() => onRescheduleAppointment?.(appointment)}
                                  aria-label="Reschedule appointment"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  onClick={() => onCancelAppointment?.(appointment)}
                                  aria-label="Cancel appointment"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}

            {filteredAppointments.length === 0 && (
              <Card>
                <CardBody className="text-center py-8">
                  <Search className="h-12 w-12 text-default-300 mx-auto mb-4" />
                  <p className="text-default-600">No appointments match your current filters.</p>
                  <Button
                    variant="light"
                    onClick={resetFilters}
                    className="mt-2"
                  >
                    Reset Filters
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>

        <Tab
          key="analytics"
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </div>
          }
        >
          {/* Analytics View */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Appointment Patterns</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Completion Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm text-default-600">{stats.completionRate}%</span>
                    </div>
                    <Progress
                      value={stats.completionRate}
                      color="success"
                      className="mb-2"
                    />
                    <p className="text-xs text-default-600">
                      {stats.completed} of {stats.total} appointments completed
                    </p>
                  </div>

                  {/* No Show Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">No Show Rate</span>
                      <span className="text-sm text-default-600">
                        {stats.total > 0 ? Math.round((stats.noShow / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.total > 0 ? (stats.noShow / stats.total) * 100 : 0}
                      color="danger"
                      className="mb-2"
                    />
                    <p className="text-xs text-default-600">
                      {stats.noShow} no-show appointments
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Additional analytics cards can be added here */}
            <Card>
              <CardBody className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-default-300 mx-auto mb-4" />
                <p className="text-default-600">
                  Advanced analytics features coming soon
                </p>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}

// Export with display name for debugging
PatientAppointmentHistory.displayName = 'PatientAppointmentHistory'