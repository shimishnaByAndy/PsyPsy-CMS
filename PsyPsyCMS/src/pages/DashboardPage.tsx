import React from 'react'
import {
  Users,
  Calendar,
  UserCog,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react'

const DashboardPage: React.FC = () => {
  // Mock data for demonstration
  const stats = {
    totalClients: 142,
    activeClients: 89,
    totalProfessionals: 12,
    activeSessions: 8,
    appointmentsToday: 15,
    completedToday: 9,
    pendingToday: 6,
    monthlyGrowth: 12.5
  }

  const recentAppointments = [
    { id: 1, client: 'Sarah Johnson', time: '2:00 PM', type: 'Therapy Session', status: 'confirmed' },
    { id: 2, client: 'Michael Chen', time: '3:30 PM', type: 'Initial Consultation', status: 'pending' },
    { id: 3, client: 'Emma Davis', time: '4:00 PM', type: 'Follow-up', status: 'confirmed' },
    { id: 4, client: 'James Wilson', time: '5:15 PM', type: 'Group Therapy', status: 'pending' }
  ]

  const activityFeed = [
    { id: 1, action: 'New client registered', client: 'Sarah Johnson', time: '2 hours ago', type: 'registration' },
    { id: 2, action: 'Appointment scheduled', client: 'Michael Chen', time: '3 hours ago', type: 'appointment' },
    { id: 3, action: 'Session completed', client: 'Emma Davis', time: '5 hours ago', type: 'session' },
    { id: 4, action: 'Payment received', client: 'James Wilson', time: '1 day ago', type: 'payment' }
  ]

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  const AppointmentCard = ({ appointment }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <div>
          <p className="font-medium text-gray-900">{appointment.client}</p>
          <p className="text-sm text-gray-500">{appointment.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">{appointment.time}</p>
        <p className={`text-sm capitalize ${appointment.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}`}>
          {appointment.status}
        </p>
      </div>
    </div>
  )

  const ActivityItem = ({ item }: any) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${
        item.type === 'registration' ? 'bg-blue-500' :
        item.type === 'appointment' ? 'bg-green-500' :
        item.type === 'session' ? 'bg-purple-500' : 'bg-orange-500'
      }`} />
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{item.action}</span>
          {item.client && <span className="text-gray-600"> - {item.client}</span>}
        </p>
        <p className="text-xs text-gray-500 mt-1">{item.time}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your practice.</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <Users className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          trend="up"
          trendValue="12.5"
          color="blue"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Professionals"
          value={stats.totalProfessionals}
          icon={UserCog}
          color="purple"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.appointmentsToday}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
                  <p className="text-sm text-gray-500 mt-1">{stats.completedToday} completed, {stats.pendingToday} pending</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6 space-y-1">
            {activityFeed.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 text-center rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <Users className="w-8 h-8 text-gray-600 group-hover:text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Add New Client</span>
          </button>
          <button className="flex flex-col items-center p-4 text-center rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
            <Calendar className="w-8 h-8 text-gray-600 group-hover:text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Schedule Appointment</span>
          </button>
          <button className="flex flex-col items-center p-4 text-center rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
            <Clock className="w-8 h-8 text-gray-600 group-hover:text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">View Schedule</span>
          </button>
          <button className="flex flex-col items-center p-4 text-center rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
            <UserCog className="w-8 h-8 text-gray-600 group-hover:text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Manage Staff</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage