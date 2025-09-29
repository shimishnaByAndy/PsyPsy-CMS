import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  MoreVertical,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { healthcareAPI } from '@/services/tauri-api'
import type { ClientResponse } from '@/services/tauri-api'

// Use the ClientResponse type from our API
type Client = ClientResponse

const ClientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  // Fetch clients using TanStack Query
  const {
    data: clients = [],
    isPending,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients'],
    queryFn: () => healthcareAPI.client.getAllClients(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const filteredClients = clients.filter(client => {
    const displayName = client.displayName || `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim()
    const email = client.user?.email || ''
    const phone = client.user?.phone || ''

    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         phone.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && client.isActive) ||
                         (filterStatus === 'inactive' && !client.isActive) ||
                         client.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(filteredClients.map(client => client.id))
    }
  }

  const getStatusColor = (client: Client) => {
    if (client.isActive) return 'bg-green-100 text-green-900 border-green-200'
    if (client.status === 'pending') return 'bg-yellow-100 text-yellow-900 border-yellow-200'
    return 'bg-gray-100 text-gray-900 border-gray-200'
  }

  const getStatusIcon = (client: Client) => {
    if (client.isActive) return <CheckCircle className="w-4 h-4" />
    if (client.status === 'pending') return <AlertCircle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  const getStatusLabel = (client: Client) => {
    if (client.isActive) return 'active'
    if (client.status === 'pending') return 'pending'
    return 'inactive'
  }

  const ClientCard = ({ client }: { client: Client }) => {
    const displayName = client.displayName || `${client.user?.firstName || ''} ${client.user?.lastName || ''}`.trim()
    const email = client.user?.email || 'No email'
    const phone = client.user?.phone || 'No phone'
    const dateOfBirth = client.user?.dateOfBirth || null
    const address = client.user?.address ?
      `${client.user.address.street}, ${client.user.address.city}, ${client.user.address.state} ${client.user.address.zipCode}` :
      'No address'
    const emergencyContact = client.emergencyContact?.[0] || null

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedClients.includes(client.objectId)}
              onChange={() => handleSelectClient(client.objectId)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
              <p className="text-sm text-gray-600">ID: {client.clientId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(client)}`}>
              {getStatusIcon(client)}
              <span className="ml-1">{getStatusLabel(client)}</span>
            </span>
            <button className="text-gray-600 hover:text-gray-700">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span>{email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{address}</span>
            </div>
          </div>
          <div className="space-y-2">
            {dateOfBirth && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Born: {new Date(dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              <strong>Total Appointments:</strong> {client.totalAppointments}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Completed:</strong> {client.completedAppointments}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Cancelled: {client.cancelledAppointments}
            </span>
            {emergencyContact && (
              <span className="text-sm text-gray-600">
                Emergency: {emergencyContact.name}
              </span>
            )}
          </div>
          {client.notes && client.notes.length > 0 && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {client.notes[0]?.content || 'No notes available'}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <FileText className="w-4 h-4 mr-1" />
            Notes
          </button>
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <Calendar className="w-4 h-4 mr-1" />
            Schedule
          </button>
          <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading clients...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading clients</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client information and appointments</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-50">
              <UserPlus className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => !c.isActive && c.status !== 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search clients..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
            {selectedClients.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedClients.length} selected</span>
                <button className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-600">
            Select All ({filteredClients.length})
          </label>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first client.'
            }
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientsPage
