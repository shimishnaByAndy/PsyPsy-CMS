import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Badge,
  Progress,
  Button,
  Avatar,
  AvatarGroup,
  Tooltip,
  Divider,
  Skeleton
} from '@/components/ui/nextui'
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  Brain,
  Shield,
  FileText,
  Bell,
  UserCheck,
  Timer,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BaseWidgetProps {
  className?: string
  isLoading?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
}

interface StatWidgetProps extends BaseWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  actions?: React.ReactNode
}

interface ProgressWidgetProps extends BaseWidgetProps {
  title: string
  description?: string
  progress: number
  target?: number
  color?: 'primary' | 'success' | 'warning' | 'danger'
  showPercentage?: boolean
  details?: Array<{
    label: string
    value: number
    color?: string
  }>
}

interface AlertWidgetProps extends BaseWidgetProps {
  title: string
  alerts: Array<{
    id: string
    type: 'emergency' | 'warning' | 'info'
    message: string
    timestamp: string
    patient?: string
    action?: () => void
  }>
  maxVisible?: number
  onViewAll?: () => void
}

interface TeamWidgetProps extends BaseWidgetProps {
  title: string
  team: Array<{
    id: string
    name: string
    role: string
    avatar?: string
    status: 'available' | 'busy' | 'away' | 'offline'
    patients?: number
  }>
  maxVisible?: number
  onViewAll?: () => void
}

interface AppointmentWidgetProps extends BaseWidgetProps {
  title: string
  appointments: Array<{
    id: string
    time: string
    patient: string
    type: string
    status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
    duration?: number
  }>
  maxVisible?: number
  onViewAll?: () => void
}

/**
 * StatWidget - Display key statistics with trends
 */
export function StatWidget({
  title,
  value,
  subtitle,
  icon,
  trend,
  actions,
  variant = 'default',
  isLoading = false,
  className
}: StatWidgetProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          cardClass: 'border-success-200 bg-success-50',
          iconClass: 'text-success-600',
          valueClass: 'text-success-900'
        }
      case 'warning':
        return {
          cardClass: 'border-warning-200 bg-warning-50',
          iconClass: 'text-warning-600',
          valueClass: 'text-warning-900'
        }
      case 'danger':
        return {
          cardClass: 'border-danger-200 bg-danger-50',
          iconClass: 'text-danger-600',
          valueClass: 'text-danger-900'
        }
      case 'primary':
        return {
          cardClass: 'border-primary-200 bg-primary-50',
          iconClass: 'text-primary-600',
          valueClass: 'text-primary-900'
        }
      default:
        return {
          cardClass: 'border-default-200',
          iconClass: 'text-default-600',
          valueClass: 'text-default-900'
        }
    }
  }

  const styles = getVariantStyles()

  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <Skeleton className="w-full h-24" />
      </Card>
    )
  }

  return (
    <Card className={cn(styles.cardClass, className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <div className={cn('p-2 rounded-lg bg-white/50', styles.iconClass)}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-default-600">{title}</p>
            {subtitle && (
              <p className="text-xs text-default-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actions}
      </CardHeader>

      <CardBody className="pt-0">
        <div className="flex items-baseline space-x-2">
          <span className={cn('text-2xl font-bold', styles.valueClass)}>
            {value}
          </span>
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-500" />
              )}
              <span className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-success-600' : 'text-danger-600'
              )}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-default-500">
                {trend.period}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * ProgressWidget - Display progress towards goals
 */
export function ProgressWidget({
  title,
  description,
  progress,
  target,
  color = 'primary',
  showPercentage = true,
  details,
  isLoading = false,
  className
}: ProgressWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <Skeleton className="w-full h-32" />
      </Card>
    )
  }

  const percentage = target ? Math.round((progress / target) * 100) : progress

  return (
    <Card className={className}>
      <CardHeader>
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {showPercentage && (
              <span className="text-2xl font-bold text-primary-600">
                {percentage}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-default-600">{description}</p>
          )}
        </div>
      </CardHeader>

      <CardBody>
        <Progress
          value={percentage}
          color={color}
          className="mb-4"
          size="md"
        />

        {target && (
          <div className="flex justify-between text-sm text-default-600 mb-4">
            <span>Current: {progress}</span>
            <span>Target: {target}</span>
          </div>
        )}

        {details && details.length > 0 && (
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {detail.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: detail.color }}
                    />
                  )}
                  <span className="text-sm">{detail.label}</span>
                </div>
                <span className="text-sm font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * AlertWidget - Display critical alerts and notifications
 */
export function AlertWidget({
  title,
  alerts,
  maxVisible = 3,
  onViewAll,
  isLoading = false,
  className
}: AlertWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <Skeleton className="w-full h-40" />
      </Card>
    )
  }

  const visibleAlerts = alerts.slice(0, maxVisible)
  const hasMoreAlerts = alerts.length > maxVisible

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />
      case 'warning':
        return <Bell className="h-4 w-4" />
      case 'info':
        return <Activity className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {alerts.length > 0 && (
            <Badge color="danger" content={alerts.length}>
              <Bell className="h-5 w-5" />
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {alerts.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-success-500 mx-auto mb-2" />
            <p className="text-sm text-default-600">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-default-200"
              >
                <div className={cn('mt-0.5', `text-${getAlertColor(alert.type)}-500`)}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Chip
                      size="sm"
                      color={getAlertColor(alert.type) as any}
                      variant="flat"
                    >
                      {alert.type.toUpperCase()}
                    </Chip>
                    {alert.patient && (
                      <span className="text-xs text-default-500">
                        Patient: {alert.patient}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-default-700">
                    {alert.message}
                  </p>
                  <p className="text-xs text-default-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {alert.action && (
                  <Button
                    size="sm"
                    color={getAlertColor(alert.type) as any}
                    variant="flat"
                    onClick={alert.action}
                  >
                    Act
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {hasMoreAlerts && (
        <CardFooter>
          <Button
            variant="light"
            size="sm"
            onClick={onViewAll}
            className="w-full"
          >
            View all {alerts.length} alerts
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

/**
 * TeamWidget - Display team member status and availability
 */
export function TeamWidget({
  title,
  team,
  maxVisible = 4,
  onViewAll,
  isLoading = false,
  className
}: TeamWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <Skeleton className="w-full h-48" />
      </Card>
    )
  }

  const visibleTeam = team.slice(0, maxVisible)
  const hasMoreMembers = team.length > maxVisible

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'busy':
        return 'warning'
      case 'away':
        return 'secondary'
      case 'offline':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <AvatarGroup max={3}>
            {team.slice(0, 3).map((member) => (
              <Avatar
                key={member.id}
                src={member.avatar}
                name={member.name}
                size="sm"
              />
            ))}
          </AvatarGroup>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-3">
          {visibleTeam.map((member) => (
            <div key={member.id} className="flex items-center space-x-3">
              <Avatar
                src={member.avatar}
                name={member.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium truncate">
                    {member.name}
                  </p>
                  <Chip
                    size="sm"
                    color={getStatusColor(member.status) as any}
                    variant="dot"
                  >
                    {member.status}
                  </Chip>
                </div>
                <div className="flex items-center space-x-2 text-xs text-default-500">
                  <span>{member.role}</span>
                  {member.patients !== undefined && (
                    <>
                      <span>•</span>
                      <span>{member.patients} patients</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>

      {hasMoreMembers && (
        <CardFooter>
          <Button
            variant="light"
            size="sm"
            onClick={onViewAll}
            className="w-full"
          >
            View all {team.length} team members
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

/**
 * AppointmentWidget - Display upcoming appointments
 */
export function AppointmentWidget({
  title,
  appointments,
  maxVisible = 5,
  onViewAll,
  isLoading = false,
  className
}: AppointmentWidgetProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-4', className)}>
        <Skeleton className="w-full h-56" />
      </Card>
    )
  }

  const visibleAppointments = appointments.slice(0, maxVisible)
  const hasMoreAppointments = appointments.length > maxVisible

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'scheduled':
        return 'primary'
      case 'in-progress':
        return 'warning'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Chip color="primary" variant="flat">
            {appointments.length}
          </Chip>
        </div>
      </CardHeader>

      <CardBody>
        {appointments.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 text-default-400 mx-auto mb-2" />
            <p className="text-sm text-default-600">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center space-x-3 p-3 rounded-lg border border-default-200"
              >
                <div className="flex flex-col items-center">
                  <Clock className="h-4 w-4 text-default-500 mb-1" />
                  <span className="text-xs font-mono text-default-600">
                    {appointment.time}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {appointment.patient}
                    </p>
                    <Chip
                      size="sm"
                      color={getStatusColor(appointment.status) as any}
                      variant="flat"
                    >
                      {appointment.status}
                    </Chip>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-default-500">
                    <span>{appointment.type}</span>
                    {appointment.duration && (
                      <>
                        <span>•</span>
                        <span>{appointment.duration} min</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>

      {hasMoreAppointments && (
        <CardFooter>
          <Button
            variant="light"
            size="sm"
            onClick={onViewAll}
            className="w-full"
          >
            View all {appointments.length} appointments
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// Predefined widget configurations
export const HealthcareDashboardPresets = {
  patientStats: {
    title: 'Total Patients',
    icon: <Users className="h-5 w-5" />,
    variant: 'primary' as const,
  },

  appointmentStats: {
    title: "Today's Appointments",
    icon: <Calendar className="h-5 w-5" />,
    variant: 'success' as const,
  },

  emergencyAlerts: {
    title: 'Emergency Alerts',
    icon: <AlertTriangle className="h-5 w-5" />,
    variant: 'danger' as const,
  },

  complianceProgress: {
    title: 'HIPAA Compliance',
    description: 'Monthly compliance training completion',
    color: 'success' as const,
    showPercentage: true,
  },

  teamAvailability: {
    title: 'Team Availability',
  },

  upcomingAppointments: {
    title: 'Upcoming Appointments',
  },
} as const