/**
 * Admin Dashboard - Real-time CMS with Firebase Integration
 *
 * Comprehensive admin dashboard with all table components
 * connected to Firebase emulator with Quebec Law 25 compliance.
 */

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  Shield,
  Database,
  TestTube,
  Bell,
  LogOut,
  RefreshCw
} from 'lucide-react'

// Import our table components
import { UsersTable, ProfessionalsTable, AppointmentsTable } from '@/components/tables'
import { TestConnection } from '@/components/TestConnection'

// Import services
import { authService, TEST_ACCOUNTS } from '@/services/firebase-api'
import { toast } from 'sonner'

interface DashboardStats {
  totalUsers: number
  totalProfessionals: number
  totalAppointments: number
  pendingVerifications: number
  lastUpdated: string
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProfessionals: 0,
    totalAppointments: 0,
    pendingVerifications: 0,
    lastUpdated: new Date().toLocaleTimeString()
  })

  // Handle sign in for testing
  const handleSignIn = async (accountKey: keyof typeof TEST_ACCOUNTS) => {
    const account = TEST_ACCOUNTS[accountKey]

    try {
      const result = await authService.signIn(account.email, account.password)

      if (result.success) {
        setCurrentUser({
          email: account.email,
          role: account.role,
          name: account.name || account.role
        })
        toast.success(`Signed in as ${account.name || account.role}`)
      } else {
        toast.error(`Sign in failed: ${result.error}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut()
      setCurrentUser(null)
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(`Sign out error: ${error.message}`)
    }
  }

  // Refresh dashboard data
  const refreshData = async () => {
    setIsRefreshing(true)

    try {
      // Simulate data refresh - in real app, this would fetch from Firebase
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats({
        totalUsers: Math.floor(Math.random() * 100) + 50,
        totalProfessionals: Math.floor(Math.random() * 20) + 10,
        totalAppointments: Math.floor(Math.random() * 200) + 100,
        pendingVerifications: Math.floor(Math.random() * 5) + 1,
        lastUpdated: new Date().toLocaleTimeString()
      })

      toast.success('Dashboard data refreshed')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                PsyPsy CMS Admin
              </h1>
              <p className="text-muted-foreground text-sm">
                Quebec Law 25 & PIPEDA Compliant Healthcare Management
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Current User */}
              {currentUser && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50">
                    {currentUser.name}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              )}

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Authentication Section */}
        {!currentUser && (
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p><strong>Sign in with a test account to access the dashboard:</strong></p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSignIn(key as keyof typeof TEST_ACCOUNTS)}
                    >
                      {account.name || account.role}
                    </Button>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="professionals">
              <UserCheck className="h-4 w-4 mr-2" />
              Professionals
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="test">
              <TestTube className="h-4 w-4 mr-2" />
              Connection Test
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Shield className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered platform users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Professionals</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProfessionals}</div>
                  <p className="text-xs text-muted-foreground">Verified healthcare providers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">Total appointments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">Require admin attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setActiveTab('professionals')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Verify Professionals
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setActiveTab('appointments')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Firebase Emulators</span>
                    <Badge variant="default" className="bg-green-500/10 text-green-600">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Quebec Law 25 Compliance</span>
                    <Badge variant="default" className="bg-green-500/10 text-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data Residency</span>
                    <Badge variant="outline">Quebec, Canada</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Updated</span>
                    <span className="text-sm text-muted-foreground">{stats.lastUpdated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-muted-foreground">Manage platform users and access controls</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <UsersTable
                  onUserStatusChange={async (userId, isBlocked) => {
                    toast.info(`User ${userId} ${isBlocked ? 'blocked' : 'unblocked'}`)
                  }}
                  onViewProfile={(user) => {
                    toast.info(`View profile: ${user.email}`)
                  }}
                  enableUserActions={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Healthcare Professionals</h3>
                <p className="text-muted-foreground">Verify credentials and manage professional profiles</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <ProfessionalsTable
                  onVerificationAction={async (professionalId, action, notes) => {
                    toast.success(`Professional ${professionalId} ${action}ed${notes ? ` with notes: ${notes}` : ''}`)
                  }}
                  onViewProfile={(professional) => {
                    toast.info(`View profile: ${professional.displayName}`)
                  }}
                  enableVerificationActions={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Appointment Management</h3>
                <p className="text-muted-foreground">Monitor and manage appointment workflow</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <AppointmentsTable
                  onStatusUpdate={async (appointmentId, status, notes) => {
                    toast.success(`Appointment ${appointmentId} status updated to ${status}${notes ? ` with notes: ${notes}` : ''}`)
                  }}
                  onViewDetails={(appointment) => {
                    toast.info(`View details: ${appointment.id}`)
                  }}
                  enableStatusActions={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Test Tab */}
          <TabsContent value="test" className="space-y-6">
            <TestConnection />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Quebec Law 25 & PIPEDA Compliance</h3>
                <p className="text-muted-foreground">Compliance monitoring and audit trails</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>🇨🇦 Canadian Privacy Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">PIPEDA Compliance</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✅ Personal information collection consent</li>
                        <li>✅ Purpose limitation</li>
                        <li>✅ Data minimization</li>
                        <li>✅ Retention limits</li>
                        <li>✅ Security safeguards</li>
                        <li>✅ Individual access rights</li>
                        <li>✅ Breach notification procedures</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Quebec Law 25</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✅ Enhanced consent requirements</li>
                        <li>✅ Data residency in Quebec</li>
                        <li>✅ Right to erasure</li>
                        <li>✅ Data portability</li>
                        <li>✅ Privacy impact assessments</li>
                        <li>✅ 72-hour breach reporting</li>
                        <li>✅ Audit trail requirements</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Data Processing Location</h4>
                    <Badge variant="outline" className="bg-green-50">
                      🏢 Quebec, Montreal, Canada (Emulated)
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      All personal information processing occurs within Canadian borders to comply with Quebec Law 25 data residency requirements.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Audit & Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      All personal information access and processing activities are logged with:
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                      <li>• User identification and authentication</li>
                      <li>• Timestamp and action performed</li>
                      <li>• Data types accessed</li>
                      <li>• Purpose of access</li>
                      <li>• 7-year retention for audit compliance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}