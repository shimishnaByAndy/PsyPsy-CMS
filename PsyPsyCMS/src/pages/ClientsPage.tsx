import React, { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  lastVisit: string
  nextAppointment?: string
  status: 'active' | 'inactive' | 'pending'
  totalSessions: number
  notes: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

const ClientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  // Mock client data
  const clients: Client[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      address: '123 Main St, Montreal, QC H3B 1A1',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25 14:00',
      status: 'active',
      totalSessions: 12,
      notes: 'Anxiety and stress management sessions. Making good progress.',
      emergencyContact: {
        name: 'John Johnson',
        phone: '+1 (555) 987-6543',
        relationship: 'Spouse'
      }
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '1992-07-22',
      address: '456 Oak Ave, Montreal, QC H2Y 2Z3',
      lastVisit: '2024-01-08',
      nextAppointment: '2024-01-28 10:00',
      status: 'active',
      totalSessions: 8,
      notes: 'Initial consultation completed. Developing treatment plan.',
      emergencyContact: {
        name: 'Lisa Chen',
        phone: '+1 (555) 876-5432',
        relationship: 'Sister'
      }
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+1 (555) 345-6789',
      dateOfBirth: '1978-11-08',
      address: '789 Pine St, Montreal, QC H1A 0A6',
      lastVisit: '2024-01-05',
      status: 'inactive',
      totalSessions: 24,
      notes: 'Completed therapy sessions. Follow-up in 6 months.',
      emergencyContact: {
        name: 'Robert Davis',
        phone: '+1 (555) 765-4321',
        relationship: 'Husband'
      }
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      phone: '+1 (555) 456-7890',
      dateOfBirth: '1990-05-14',
      address: '321 Elm Dr, Montreal, QC H4B 2M8',
      lastVisit: '2023-12-28',
      nextAppointment: '2024-01-30 16:00',
      status: 'pending',
      totalSessions: 3,
      notes: 'New client. Assessment phase ongoing.',
      emergencyContact: {
        name: 'Mary Wilson',
        phone: '+1 (555) 654-3210',
        relationship: 'Mother'
      }
    },
    {
      id: '5',
      name: 'Anna Martinez',
      email: 'anna.martinez@email.com',
      phone: '+1 (555) 567-8901',
      dateOfBirth: '1988-12-03',
      address: '654 Maple Ln, Montreal, QC H3G 1M5',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-26 11:30',
      status: 'active',
      totalSessions: 16,
      notes: 'Group therapy participant. Excellent progress with social anxiety.',
      emergencyContact: {
        name: 'Carlos Martinez',
        phone: '+1 (555) 543-2109',
        relationship: 'Brother'
      }
    }
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.phone.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-900 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-900 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-900 border-yellow-200'
      default: return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const ClientCard = ({ client }: { client: Client }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedClients.includes(client.id)}
            onChange={() => handleSelectClient(client.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-600">ID: {client.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(client.status)}`}>
            {getStatusIcon(client.status)}
            <span className="ml-1">{client.status}</span>
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
            <span>{client.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{client.address}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Born: {new Date(client.dateOfBirth).toLocaleDateString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            <strong>Last Visit:</strong> {new Date(client.lastVisit).toLocaleDateString()}
          </div>
          {client.nextAppointment && (
            <div className="text-sm text-gray-600">
              <strong>Next:</strong> {new Date(client.nextAppointment).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Sessions: {client.totalSessions}</span>
          <span className="text-sm text-gray-600">Emergency: {client.emergencyContact.name}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{client.notes}</p>
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
              <p className="text-2xl font-bold text-gray-900">{clients.filter(c => c.status === 'active').length}</p>
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
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
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
