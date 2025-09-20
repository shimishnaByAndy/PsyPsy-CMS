/**
 * Tables Usage Examples - PsyPsy CMS
 *
 * This file demonstrates how to use the table components in your CMS.
 * Shows integration with Quebec Law 25 & PIPEDA compliance.
 */

import React from 'react'
import { UsersTable, ProfessionalsTable, AppointmentsTable, DataTable } from '@/components/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Example of using the specialized table components
export const TablesExample: React.FC = () => {
  // Custom handlers for user actions
  const handleUserStatusChange = async (userId: string, isBlocked: boolean) => {
    // Implement your user blocking logic here
    console.log(`User ${userId} ${isBlocked ? 'blocked' : 'unblocked'}`)

    // Example: Call your API
    // await updateUserStatus(userId, { isBlocked })

    // Audit for Quebec Law 25 compliance
    console.log('[AUDIT]', {
      action: 'user_status_change',
      userId,
      isBlocked,
      timestamp: new Date().toISOString(),
      compliance: ['PIPEDA', 'Law25'],
      jurisdiction: 'Quebec, Canada'
    })
  }

  const handleProfessionalVerification = async (
    professionalId: string,
    action: 'verify' | 'reject',
    notes?: string
  ) => {
    console.log(`Professional ${professionalId} ${action}ed`, notes)

    // Example: Call your verification API
    // await updateProfessionalVerification(professionalId, { status: action, notes })

    // Audit for Quebec Law 25 compliance
    console.log('[AUDIT]', {
      action: 'professional_verification',
      professionalId,
      verificationAction: action,
      notes,
      timestamp: new Date().toISOString(),
      compliance: ['PIPEDA', 'Law25'],
      jurisdiction: 'Quebec, Canada'
    })
  }

  const handleAppointmentStatusUpdate = async (
    appointmentId: string,
    status: string,
    notes?: string
  ) => {
    console.log(`Appointment ${appointmentId} status changed to ${status}`, notes)

    // Example: Call your appointment API
    // await updateAppointmentStatus(appointmentId, { status, notes })

    // Audit for Quebec Law 25 compliance
    console.log('[AUDIT]', {
      action: 'appointment_status_change',
      appointmentId,
      newStatus: status,
      notes,
      timestamp: new Date().toISOString(),
      compliance: ['PIPEDA', 'Law25'],
      jurisdiction: 'Quebec, Canada'
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">PsyPsy CMS Tables</h1>
        <p className="text-muted-foreground">
          Advanced table components with Quebec Law 25 & PIPEDA compliance
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="professionals">Professionals</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="custom">Custom Table</TabsTrigger>
        </TabsList>

        {/* Users Table */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable
                onUserStatusChange={handleUserStatusChange}
                onViewProfile={(user) => console.log('View user profile:', user)}
                enableUserActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professionals Table */}
        <TabsContent value="professionals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Professionals</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessionalsTable
                onVerificationAction={handleProfessionalVerification}
                onViewProfile={(professional) => console.log('View professional profile:', professional)}
                enableVerificationActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Table */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments Management</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsTable
                onStatusUpdate={handleAppointmentStatusUpdate}
                onViewDetails={(appointment) => console.log('View appointment details:', appointment)}
                enableStatusActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Table Example */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Table Example</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomTableExample />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Example of creating a custom table using the DataTable component
const CustomTableExample: React.FC = () => {
  // Example data
  const sampleData = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Clinical Psychology',
      location: 'Montreal, QC',
      status: 'verified',
      rating: 4.9,
      sessions: 150,
    },
    {
      id: '2',
      name: 'Dr. Marc Dubois',
      specialty: 'Psychiatry',
      location: 'Quebec City, QC',
      status: 'pending',
      rating: 4.7,
      sessions: 89,
    },
    // Add more sample data...
  ]

  // Define columns
  const columns = [
    {
      id: 'name',
      header: 'Professional',
      accessorKey: 'name',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      id: 'specialty',
      header: 'Specialty',
      accessorKey: 'specialty',
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.original.status === 'verified'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      accessorKey: 'rating',
      cell: ({ row }: any) => (
        <div className="text-center">⭐ {row.original.rating}</div>
      ),
    },
    {
      id: 'sessions',
      header: 'Sessions',
      accessorKey: 'sessions',
      cell: ({ row }: any) => (
        <div className="text-center font-medium">{row.original.sessions}</div>
      ),
    },
  ]

  // Custom audit function for Quebec compliance
  const auditCustomTableAccess = (action: string, filters?: any) => {
    console.log('[AUDIT - Custom Table]', {
      action,
      timestamp: new Date().toISOString(),
      tableName: 'custom_professionals_summary',
      containsPersonalInfo: false, // This example doesn't contain direct personal info
      jurisdiction: 'Quebec, Canada',
      compliance: ['PIPEDA', 'Law25'],
      ...filters,
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        This demonstrates using the base DataTable component with custom data and columns.
        Perfect for creating specialized views or summary tables.
      </div>

      <DataTable
        data={sampleData}
        columns={columns}
        searchPlaceholder="Search professionals..."
        exportFilename="professionals_summary"
        containsPersonalInfo={false}
        auditTableAccess={auditCustomTableAccess}
        enableSorting
        enableFiltering
        enablePagination
        enableExport
        enableColumnVisibility
      />
    </div>
  )
}

// Example integration in your main app
export const AppWithTables: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Your app header/navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">PsyPsy CMS</h1>
        </div>
      </header>

      {/* Main content with tables */}
      <main className="container mx-auto px-4 py-8">
        <TablesExample />
      </main>

      {/* Quebec Law 25 compliance notice */}
      <footer className="mt-16 border-t bg-muted/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            🇨🇦 This system complies with PIPEDA (Personal Information Protection and Electronic Documents Act)
            and Quebec Law 25 (An Act to modernize legislative provisions as regards the protection of personal information).
          </p>
          <p className="mt-2">
            All personal information access is logged and audited. Data residency: Quebec, Canada.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default TablesExample