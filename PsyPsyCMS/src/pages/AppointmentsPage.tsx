import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Video,
  MapPin,
  Edit3,
  CalendarDays,
  Timer,
  TrendingUp
} from 'lucide-react'

interface Appointment {
  id: string
  title: string
  client: {
    id: string
    name: string
    email: string
    phone: string
  }
  professional: {
    id: string
    name: string
    title: string
  }
  dateTime: string
  duration: number // in minutes
  type: 'in-person' | 'video' | 'phone'
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  location?: string
  notes: string
  isRecurring: boolean
  recurringPattern?: string
}

const AppointmentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: '1',
      title: 'Therapy Session',
      client: {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567'
      },
      professional: {
        id: '1',
        name: 'Dr. Emily Rodriguez',
        title: 'Clinical Psychologist'
      },
      dateTime: '2024-01-25T14:00:00',
      duration: 60,
      type: 'in-person',
      status: 'confirmed',
      location: 'Room 201',
      notes: 'Regular anxiety management session. Continue with CBT techniques.',
      isRecurring: true,
      recurringPattern: 'Weekly on Thursday'
    },
    {
      id: '2',
      title: 'Initial Consultation',
      client: {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678'
      },
      professional: {
        id: '1',
        name: 'Dr. Emily Rodriguez',
        title: 'Clinical Psychologist'
      },
      dateTime: '2024-01-26T10:00:00',
      duration: 90,
      type: 'video',
      status: 'scheduled',
      notes: 'First session - intake assessment and goal setting.',
      isRecurring: false
    },
    {
      id: '3',
      title: 'Follow-up Session',
      client: {
        id: '3',
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        phone: '+1 (555) 345-6789'
      },
      professional: {
        id: '2',
        name: 'Dr. Michael Thompson',
        title: 'Licensed Therapist'
      },
      dateTime: '2024-01-26T15:30:00',
      duration: 45,
      type: 'phone',
      status: 'completed',
      notes: 'Progress review and medication adjustment discussion.',
      isRecurring: false
    },
    {
      id: '4',
      title: 'Group Therapy Session',
      client: {
        id: '4',
        name: 'James Wilson',
        email: 'james.wilson@email.com',
        phone: '+1 (555) 456-7890'
      },
      professional: {
        id: '2',
        name: 'Dr. Michael Thompson',
        title: 'Licensed Therapist'
      },
      dateTime: '2024-01-27T11:00:00',
      duration: 90,
      type: 'in-person',
      status: 'in-progress',
      location: 'Group Room A',
      notes: 'Social anxiety support group - week 4 of 8.',
      isRecurring: true,
      recurringPattern: 'Weekly on Saturday'
    },
    {
      id: '5',
      title: 'Crisis Session',
      client: {
        id: '5',
        name: 'Anna Martinez',
        email: 'anna.martinez@email.com',
        phone: '+1 (555) 567-8901'
      },
      professional: {
        id: '1',
        name: 'Dr. Emily Rodriguez',
        title: 'Clinical Psychologist'
      },
      dateTime: '2024-01-27T16:00:00',
      duration: 120,
      type: 'video',
      status: 'cancelled',
      notes: 'Emergency session cancelled by client - rescheduled for next week.',
      isRecurring: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-900 border-green-300'
      case 'scheduled': return 'bg-blue-100 text-blue-900 border-blue-300'
      case 'in-progress': return 'bg-purple-100 text-purple-900 border-purple-300'
      case 'completed': return 'bg-gray-100 text-gray-900 border-gray-300'
      case 'cancelled': return 'bg-red-100 text-red-900 border-red-300'
      case 'no-show': return 'bg-orange-100 text-orange-900 border-orange-300'
      default: return 'bg-gray-100 text-gray-900 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'in-progress': return <Timer className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      case 'no-show': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      case 'in-person': return <MapPin className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    const matchesType = filterType === 'all' || appointment.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
          <p className="text-sm text-gray-600">with {appointment.professional.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span className="ml-1 capitalize">{appointment.status.replace('-', ' ')}</span>
          </span>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>{appointment.client.name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{appointment.client.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            {getTypeIcon(appointment.type)}
            <span className="ml-2 capitalize">{appointment.type.replace('-', ' ')}</span>
            {appointment.location && <span className="ml-2">• {appointment.location}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(appointment.dateTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="text-sm text-gray-600">
            <strong>Duration:</strong> {appointment.duration} min
          </div>
        </div>
      </div>

      {appointment.isRecurring && (
        <div className="mb-4 p-2 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            🔄 Recurring: {appointment.recurringPattern}
          </p>
        </div>
      )}

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-4">{appointment.notes}</p>
        <div className="flex justify-end space-x-2">
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </button>
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Edit3 className="w-4 h-4 mr-1" />
            Reschedule
          </button>
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
            <Video className="w-4 h-4 mr-1" />
            Start Session
          </button>
        </div>
      </div>
    </div>
  )

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.dateTime) > new Date() && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your appointment schedule and client sessions</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <CalendarDays className="w-4 h-4 mr-2" />
            View Calendar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt =>
                  new Date(apt.dateTime).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <Timer className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View - Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingAppointments.map(appointment => (
            <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{appointment.client.name}</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{appointment.title}</p>
              <div className="flex items-center text-xs text-gray-500 space-x-3">
                <span>{new Date(appointment.dateTime).toLocaleDateString()}</span>
                <span>{new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="flex items-center">
                  {getTypeIcon(appointment.type)}
                  <span className="ml-1">{appointment.type}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="in-person">In Person</option>
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex rounded-lg border border-gray-300">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm font-medium capitalize ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  } first:rounded-l-md last:rounded-r-md`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          All Appointments ({filteredAppointments.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by scheduling your first appointment.'
            }
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentsPage
