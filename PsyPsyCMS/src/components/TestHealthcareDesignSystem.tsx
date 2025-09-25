import React from 'react'
import {
  HealthcareButton,
  HealthcareCard,
  HealthcareInput,
  HealthcareTextarea,
  HealthcareTable,
  HealthcareModal,
  HealthcareNavigation,
  HealthcareDataGrid,
  StatWidget,
  ProgressWidget,
  AlertWidget,
  TeamWidget,
  AppointmentWidget,
  ProgressRing,
  SimpleBarChart,
  TimeSeriesChart,
  MetricCard,
  AdvancedSearch,
  QuickSearch,
  SmartSuggestions,
  HealthcareButtonPresets,
  HealthcareCardPresets,
  HealthcareInputPresets,
  HealthcareTablePresets,
  HealthcareModalPresets,
  HealthcareNavigationPresets,
  useDisclosure,
  Tabs,
  Tab,
  Card,
  CardBody,
  Divider
} from '@/components/ui/nextui'
import { Users, Calendar, FileText, Shield, Activity, Heart, Bell, TrendingUp, AlertTriangle, Settings, Search, Filter } from 'lucide-react'

/**
 * Comprehensive test component for the Healthcare Design System
 * Demonstrates all healthcare components with PHI compliance and HIPAA features
 */
export function TestHealthcareDesignSystem() {
  const { isOpen: isPatientModalOpen, onOpen: onPatientModalOpen, onClose: onPatientModalClose } = useDisclosure()
  const { isOpen: isEmergencyModalOpen, onOpen: onEmergencyModalOpen, onClose: onEmergencyModalClose } = useDisclosure()

  // Sample data for advanced components
  const sampleChartData = [
    { label: 'Mon', value: 65 },
    { label: 'Tue', value: 78 },
    { label: 'Wed', value: 52 },
    { label: 'Thu', value: 91 },
    { label: 'Fri', value: 73 },
  ]

  const sampleTimeSeriesData = [
    { date: '2025-01-15', value: 85 },
    { date: '2025-01-16', value: 78 },
    { date: '2025-01-17', value: 92 },
    { date: '2025-01-18', value: 88 },
    { date: '2025-01-19', value: 95 },
  ]

  const sampleAlerts = [
    {
      id: '1',
      type: 'emergency' as const,
      message: 'Patient vital signs critical - immediate attention required',
      timestamp: '2025-01-20T10:30:00Z',
      patient: 'John Doe',
      action: () => console.log('Emergency response initiated')
    },
    {
      id: '2',
      type: 'warning' as const,
      message: 'Medication refill due for Patient PAT-002',
      timestamp: '2025-01-20T09:15:00Z',
      patient: 'Jane Smith'
    }
  ]

  const sampleTeam = [
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      role: 'Clinical Psychologist',
      status: 'available' as const,
      patients: 12
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      role: 'Psychiatrist',
      status: 'busy' as const,
      patients: 8
    }
  ]

  const sampleAppointments = [
    {
      id: '1',
      time: '09:00',
      patient: 'John Doe',
      type: 'Therapy Session',
      status: 'confirmed' as const,
      duration: 50
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Jane Smith',
      type: 'Initial Consultation',
      status: 'scheduled' as const,
      duration: 60
    }
  ]

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'dateRange' as const
    }
  ]

  const quickSearchQueries = [
    {
      label: 'Emergency Patients',
      query: 'status:emergency',
      icon: <AlertTriangle className="h-4 w-4" />,
      count: 3
    },
    {
      label: "Today's Appointments",
      query: 'appointments:today',
      icon: <Calendar className="h-4 w-4" />,
      count: 12
    }
  ]

  // Sample patient data for table
  const patientData = [
    {
      id: 'PAT-001',
      name: 'Jean Martin',
      dateOfBirth: '1985-03-15',
      status: 'Active',
      lastVisit: '2025-01-15',
      diagnosis: 'Anxiety Disorder',
    },
    {
      id: 'PAT-002',
      name: 'Sarah Chen',
      dateOfBirth: '1992-07-22',
      status: 'Active',
      lastVisit: '2025-01-14',
      diagnosis: 'PTSD Treatment',
    },
    {
      id: 'PAT-003',
      name: 'Michael Rodriguez',
      dateOfBirth: '1978-11-08',
      status: 'Inactive',
      lastVisit: '2024-12-20',
      diagnosis: 'Depression',
    },
  ]

  const handlePatientView = (patient: any) => {
    console.log('Viewing patient:', patient)
    onPatientModalOpen()
  }

  const handleEmergencyProtocol = () => {
    console.log('Emergency protocol activated')
    onEmergencyModalOpen()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-primary">Healthcare Design System</h1>
        <p className="text-lg text-gray-600">
          Complete NextUI-based healthcare component library with HIPAA compliance and Quebec Law 25 support
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">✓ HIPAA Compliant</span>
          <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">✓ Quebec Law 25</span>
          <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">✓ PHI Protected</span>
          <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm">✓ Accessibility Ready</span>
        </div>
      </div>

      <Tabs aria-label="Healthcare Design System Components" className="w-full">
        <Tab key="core" title="Core Components">
          <div className="space-y-8 mt-6">

      {/* Healthcare Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Healthcare Buttons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <HealthcareButton
            {...HealthcareButtonPresets.scheduleAppointment}
            onClick={() => console.log('Schedule appointment')}
          >
            Schedule Appointment
          </HealthcareButton>

          <HealthcareButton
            {...HealthcareButtonPresets.viewMedicalRecord}
            onClick={handlePatientView}
          >
            View Medical Record
          </HealthcareButton>

          <HealthcareButton
            {...HealthcareButtonPresets.emergencyProtocol}
            onClick={handleEmergencyProtocol}
          >
            Emergency Protocol
          </HealthcareButton>

          <HealthcareButton
            {...HealthcareButtonPresets.consentManagement}
            onClick={() => console.log('Consent management')}
          >
            Manage Consent
          </HealthcareButton>

          <HealthcareButton
            {...HealthcareButtonPresets.signDocument}
            onClick={() => console.log('Sign document')}
          >
            Sign Document
          </HealthcareButton>

          <HealthcareButton
            {...HealthcareButtonPresets.reviewRequired}
            onClick={() => console.log('Review required')}
          >
            Review Required
          </HealthcareButton>
        </div>
      </section>

      {/* Healthcare Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Healthcare Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HealthcareCard
            {...HealthcareCardPresets.patientActive}
            title="Jean Martin"
            subtitle="Patient ID: PAT-001"
            avatar={{
              name: "Jean Martin",
              color: "primary"
            }}
            actions={
              <HealthcareButton size="compact" variant="primary">
                View Details
              </HealthcareButton>
            }
            onCardClick={(auditData) => console.log('Patient card clicked:', auditData)}
          >
            <p className="text-sm">Next appointment: Jan 21, 2025 at 2:00 PM</p>
            <p className="text-sm text-gray-600">Anxiety Treatment Program</p>
          </HealthcareCard>

          <HealthcareCard
            {...HealthcareCardPresets.professionalActive}
            title="Dr. Sarah Chen"
            subtitle="Clinical Psychologist"
            avatar={{
              name: "Dr. Sarah Chen",
              color: "success"
            }}
            actions={
              <HealthcareButton size="compact" variant="success">
                Book Appointment
              </HealthcareButton>
            }
          >
            <p className="text-sm">Specializing in trauma therapy and PTSD treatment</p>
            <p className="text-sm text-gray-600">Available for new patients</p>
          </HealthcareCard>

          <HealthcareCard
            {...HealthcareCardPresets.emergencyAlert}
            title="Emergency Protocol"
            subtitle="Critical Alert Active"
            actions={
              <HealthcareButton size="compact" variant="danger">
                Respond Now
              </HealthcareButton>
            }
          >
            <p className="text-sm font-medium text-red-600">
              Patient requires immediate attention
            </p>
            <p className="text-sm text-gray-600">Triggered: 5 minutes ago</p>
          </HealthcareCard>
        </div>
      </section>

      {/* Healthcare Input Forms Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Healthcare Forms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Patient Information</h3>
            <HealthcareInput
              {...HealthcareInputPresets.patientName}
              label="Patient Name"
              placeholder="Enter patient full name"
              auditAction="enter_patient_name"
            />
            <HealthcareInput
              {...HealthcareInputPresets.patientPhone}
              label="Phone Number"
              placeholder="(555) 123-4567"
              auditAction="enter_patient_phone"
            />
            <HealthcareInput
              {...HealthcareInputPresets.medicalRecordNumber}
              label="Medical Record Number"
              placeholder="MRN-12345"
              auditAction="enter_mrn"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Clinical Notes</h3>
            <HealthcareTextarea
              {...HealthcareInputPresets.clinicalNotes}
              label="Clinical Observations"
              placeholder="Enter clinical notes and observations..."
              auditAction="enter_clinical_notes"
            />
            <HealthcareInput
              {...HealthcareInputPresets.licenseNumber}
              label="Professional License"
              placeholder="LIC-123456"
              auditAction="enter_license"
            />
          </div>
        </div>
      </section>

      {/* Healthcare Table Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Patient Records Table
        </h2>
        <HealthcareTable
          {...HealthcareTablePresets.patientTable}
          data={patientData}
          userAccessLevel="confidential"
          auditAction="view_patient_table"
          onRowClick={handlePatientView}
          rowActions={[
            {
              key: 'view',
              label: 'View Details',
              icon: <Users className="h-4 w-4" />,
              action: handlePatientView,
              requiresPHI: true,
              accessLevel: 'confidential',
            },
            {
              key: 'edit',
              label: 'Edit Information',
              icon: <FileText className="h-4 w-4" />,
              action: (patient) => console.log('Edit patient:', patient),
              requiresPHI: true,
              accessLevel: 'confidential',
            },
          ]}
          tableActions={
            <>
              <HealthcareButton size="compact" variant="primary">
                Add Patient
              </HealthcareButton>
              <HealthcareButton size="compact" variant="secondary">
                Export Data
              </HealthcareButton>
            </>
          }
        />
      </section>

      {/* Patient Details Modal */}
      <HealthcareModal
        {...HealthcareModalPresets.patientDetails}
        isOpen={isPatientModalOpen}
        onClose={onPatientModalClose}
        title="Patient Details - Jean Martin"
        description="Viewing protected health information"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Patient ID</p>
              <p className="text-sm text-gray-600">PAT-001</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-gray-600">March 15, 1985</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Visit</p>
              <p className="text-sm text-gray-600">January 15, 2025</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Current Treatment</p>
            <p className="text-sm text-gray-600">
              Patient is undergoing cognitive behavioral therapy for anxiety disorder.
              Progress has been positive with decreased anxiety symptoms over the past month.
            </p>
          </div>
        </div>
      </HealthcareModal>

      {/* Emergency Protocol Modal */}
      <HealthcareModal
        {...HealthcareModalPresets.emergencyAlert}
        isOpen={isEmergencyModalOpen}
        onClose={onEmergencyModalClose}
        title="Emergency Protocol Activated"
        description="Immediate response required"
        footerConfig={{
          confirmText: "Respond to Emergency",
          confirmVariant: "danger",
          cancelText: "Dismiss Alert"
        }}
        onConfirm={() => {
          console.log('Emergency response initiated')
          onEmergencyModalClose()
        }}
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">
              Critical Alert: Patient requires immediate medical attention
            </p>
            <p className="text-red-700 text-sm mt-1">
              Emergency protocol has been automatically triggered based on patient vitals.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommended Actions:</p>
            <ul className="text-sm text-default-600 space-y-1 ml-4">
              <li>• Contact emergency medical services</li>
              <li>• Notify patient's primary physician</li>
              <li>• Document emergency response</li>
              <li>• Update patient status in system</li>
            </ul>
          </div>
        </div>
      </HealthcareModal>

      {/* Compliance Information */}
      <section className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          HIPAA & Quebec Law 25 Compliance
        </h3>
        <p className="text-purple-700 text-sm">
          All healthcare components include automatic audit logging, PHI data protection,
          and compliance monitoring. All interactions with protected health information
          are logged according to HIPAA and Quebec Law 25 requirements.
        </p>
      </section>
          </div>
        </Tab>

        <Tab key="widgets" title="Dashboard Widgets">
          <div className="space-y-8 mt-6">

            {/* Dashboard Widgets Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Dashboard Widgets
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatWidget
                  title="Active Patients"
                  value="127"
                  change={8.2}
                  trend="up"
                  icon={<Users className="h-5 w-5" />}
                  description="Patients with active treatment plans"
                />

                <StatWidget
                  title="Today's Appointments"
                  value="12"
                  change={-2.1}
                  trend="down"
                  icon={<Calendar className="h-5 w-5" />}
                  description="Scheduled appointments for today"
                />

                <StatWidget
                  title="Compliance Score"
                  value="98.5%"
                  change={1.2}
                  trend="up"
                  icon={<Shield className="h-5 w-5" />}
                  description="HIPAA compliance rating"
                />

                <StatWidget
                  title="Emergency Alerts"
                  value="3"
                  change={0}
                  trend="neutral"
                  icon={<AlertTriangle className="h-5 w-5" />}
                  description="Active critical alerts"
                  variant="warning"
                />
              </div>
            </section>

            {/* Progress Widgets */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Progress Tracking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProgressWidget
                  title="Treatment Progress"
                  progress={75}
                  target={100}
                  description="Overall patient treatment completion rate"
                  variant="success"
                />

                <ProgressWidget
                  title="Documentation"
                  progress={92}
                  target={100}
                  description="Required documentation completion"
                  variant="primary"
                />
              </div>
            </section>

            {/* Alert Widgets */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Alert Management</h3>
              <AlertWidget alerts={sampleAlerts} maxVisible={3} />
            </section>

            {/* Team and Appointments */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Team & Schedule</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamWidget
                  team={sampleTeam}
                  showStatus={true}
                  onMemberClick={(member) => console.log('Team member:', member)}
                />

                <AppointmentWidget
                  appointments={sampleAppointments}
                  timeFormat="24h"
                  onAppointmentClick={(appointment) => console.log('Appointment:', appointment)}
                />
              </div>
            </section>

          </div>
        </Tab>

        <Tab key="charts" title="Data Visualization">
          <div className="space-y-8 mt-6">

            {/* Chart Components Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Data Visualization
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Patient Satisfaction</h3>
                  <ProgressRing
                    value={87}
                    size="large"
                    color="success"
                    showValue={true}
                    label="Satisfaction Rate"
                  />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Weekly Appointments</h3>
                  <SimpleBarChart
                    data={sampleChartData}
                    height={200}
                    color="primary"
                    showGrid={true}
                  />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Treatment Outcomes</h3>
                  <TimeSeriesChart
                    data={sampleTimeSeriesData}
                    height={200}
                    color="success"
                    showArea={true}
                  />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                    <MetricCard
                      title="Response Time"
                      value="2.3 min"
                      change={-12.5}
                      trend="down"
                      description="Average emergency response time"
                    />
                    <MetricCard
                      title="Patient Retention"
                      value="94.2%"
                      change={3.1}
                      trend="up"
                      description="Patient retention rate this quarter"
                    />
                  </div>
                </Card>
              </div>
            </section>

          </div>
        </Tab>

        <Tab key="search" title="Search & Navigation">
          <div className="space-y-8 mt-6">

            {/* Advanced Search Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Search className="h-6 w-6 text-primary" />
                Search Components
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Advanced Search</h3>
                  <AdvancedSearch
                    placeholder="Search patients, appointments, or medical records..."
                    filters={searchFilters}
                    onSearch={(query, filters) => console.log('Search:', query, filters)}
                    onFiltersChange={(filters) => console.log('Filters:', filters)}
                  />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Search</h3>
                  <QuickSearch
                    queries={quickSearchQueries}
                    onQuerySelect={(query) => console.log('Quick search:', query)}
                  />
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Smart Suggestions</h3>
                  <SmartSuggestions
                    onSuggestionSelect={(suggestion) => console.log('Suggestion:', suggestion)}
                    context="healthcare"
                  />
                </Card>
              </div>
            </section>

            {/* Navigation Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Navigation Components
              </h2>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Healthcare Navigation</h3>
                <HealthcareNavigation
                  {...HealthcareNavigationPresets.primaryNavigation}
                  currentPath="/dashboard"
                  onNavigate={(path) => console.log('Navigate to:', path)}
                  showComplianceIndicator={true}
                  emergencyAlertCount={2}
                />
              </Card>
            </section>

          </div>
        </Tab>
      </Tabs>

      {/* Tauri Desktop Application Notice */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Tauri Desktop Application
        </h3>
        <p className="text-blue-700 text-sm">
          PsyPsy CMS is built as a secure Tauri desktop application with Rust backend,
          providing enhanced security, offline capabilities, and native desktop integration
          for healthcare professionals. All components are optimized for desktop workflows
          and compliance requirements.
        </p>
      </section>
    </div>
  )
}