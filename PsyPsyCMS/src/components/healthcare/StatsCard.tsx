import React from 'react'
import { HealthcareCard, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  Clock,
  Heart,
  AlertCircle,
  CheckCircle,
  LucideIcon
} from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    period: string
    isPositive?: boolean
  }
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  format?: 'number' | 'currency' | 'percentage' | 'time'
  loading?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  format = 'number',
  loading = false,
  className
}: StatsCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val}%`
      case 'time':
        return `${val} min`
      case 'number':
      default:
        return val.toLocaleString()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
      case 'info':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
      default:
        return 'border-l-psypsy-primary bg-green-50/30 dark:bg-green-950/10'
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'info':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-psypsy-primary dark:text-psypsy-primary-light'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp className="h-3 w-3" />
    } else if (trend.value < 0) {
      return <TrendingDown className="h-3 w-3" />
    } else {
      return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    
    if (trend.isPositive === undefined) {
      // Auto-determine if positive trend is good
      return trend.value >= 0 ? 'text-green-600' : 'text-red-600'
    }
    
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <HealthcareCard variant="stat" className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </HealthcareCard>
    )
  }

  return (
    <HealthcareCard 
      variant="stat" 
      className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-lg",
        getVariantStyles(),
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="healthcare-label text-sm font-medium text-muted-foreground">
                {title}
              </h3>
              {Icon && (
                <Icon className={cn("h-5 w-5", getIconColor())} />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {formatValue(value)}
              </p>
              
              {subtitle && (
                <p className="healthcare-text text-sm">
                  {subtitle}
                </p>
              )}
            </div>
            
            {trend && (
              <div className="flex items-center space-x-1">
                <div className={cn("flex items-center space-x-1 text-sm", getTrendColor())}>
                  {getTrendIcon()}
                  <span className="font-medium">
                    {Math.abs(trend.value)}%
                  </span>
                </div>
                <span className="healthcare-text text-sm">
                  vs {trend.period}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </HealthcareCard>
  )
}

// Pre-configured stats cards for common healthcare metrics
export function ClientStatsCard({ 
  totalClients, 
  activeClients, 
  trend, 
  ...props 
}: { 
  totalClients: number
  activeClients: number
  trend?: StatsCardProps['trend']
} & Omit<StatsCardProps, 'title' | 'value' | 'subtitle' | 'icon'>) {
  return (
    <StatsCard
      title="Total Clients"
      value={totalClients}
      subtitle={`${activeClients} active clients`}
      icon={Users}
      trend={trend}
      variant="info"
      {...props}
    />
  )
}

export function AppointmentStatsCard({ 
  todayCount, 
  weekCount, 
  trend, 
  ...props 
}: { 
  todayCount: number
  weekCount: number
  trend?: StatsCardProps['trend']
} & Omit<StatsCardProps, 'title' | 'value' | 'subtitle' | 'icon'>) {
  return (
    <StatsCard
      title="Appointments Today"
      value={todayCount}
      subtitle={`${weekCount} this week`}
      icon={Calendar}
      trend={trend}
      variant="success"
      {...props}
    />
  )
}

export function RevenueStatsCard({ 
  dailyRevenue, 
  monthlyRevenue, 
  trend, 
  ...props 
}: { 
  dailyRevenue: number
  monthlyRevenue: number
  trend?: StatsCardProps['trend']
} & Omit<StatsCardProps, 'title' | 'value' | 'subtitle' | 'icon'>) {
  return (
    <StatsCard
      title="Daily Revenue"
      value={dailyRevenue}
      subtitle={`$${monthlyRevenue.toLocaleString()} this month`}
      icon={DollarSign}
      trend={trend}
      variant="default"
      format="currency"
      {...props}
    />
  )
}

export function UtilizationStatsCard({ 
  utilizationRate, 
  avgSessionLength, 
  trend, 
  ...props 
}: { 
  utilizationRate: number
  avgSessionLength: number
  trend?: StatsCardProps['trend']
} & Omit<StatsCardProps, 'title' | 'value' | 'subtitle' | 'icon'>) {
  return (
    <StatsCard
      title="Utilization Rate"
      value={utilizationRate}
      subtitle={`${avgSessionLength} min avg session`}
      icon={Activity}
      trend={trend}
      variant={utilizationRate >= 80 ? 'success' : utilizationRate >= 60 ? 'warning' : 'error'}
      format="percentage"
      {...props}
    />
  )
}

// Export all components
export {
  StatsCard as default,
  StatsCard,
  ClientStatsCard,
  AppointmentStatsCard,  
  RevenueStatsCard,
  UtilizationStatsCard
}