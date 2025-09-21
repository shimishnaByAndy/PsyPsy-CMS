import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Select,
  SelectItem,
  Skeleton,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@/components/ui/nextui'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Maximize,
  MoreVertical,
  Activity,
  Heart,
  Brain,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

interface TimeSeriesDataPoint {
  date: string
  value: number
  category?: string
}

interface BaseChartProps {
  title: string
  subtitle?: string
  data: ChartDataPoint[] | TimeSeriesDataPoint[]
  isLoading?: boolean
  className?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  onExport?: (format: 'png' | 'svg' | 'pdf') => void
  onRefresh?: () => void
  onFullscreen?: () => void
}

interface ProgressRingProps extends BaseChartProps {
  value: number
  maxValue: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  unit?: string
}

interface BarChartProps extends BaseChartProps {
  orientation?: 'horizontal' | 'vertical'
  stacked?: boolean
  animated?: boolean
  colorScheme?: 'primary' | 'success' | 'warning' | 'danger' | 'healthcare'
}

interface LineChartProps extends BaseChartProps {
  smooth?: boolean
  fill?: boolean
  multiple?: boolean
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y'
  onTimeRangeChange?: (range: string) => void
}

interface PieChartProps extends BaseChartProps {
  donut?: boolean
  centerLabel?: string
  centerValue?: string | number
}

interface MiniChartProps {
  data: number[]
  color?: string
  height?: number
  className?: string
  trend?: 'up' | 'down' | 'neutral'
}

/**
 * ProgressRing - Circular progress indicator for healthcare metrics
 */
export function ProgressRing({
  title,
  subtitle,
  value,
  maxValue,
  color = '#0ea5e9',
  size = 'md',
  showValue = true,
  unit = '',
  isLoading = false,
  className,
  onRefresh
}: ProgressRingProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { radius: 35, strokeWidth: 4, fontSize: '14px' }
      case 'lg':
        return { radius: 60, strokeWidth: 8, fontSize: '24px' }
      default:
        return { radius: 45, strokeWidth: 6, fontSize: '18px' }
    }
  }

  const { radius, strokeWidth, fontSize } = getSizeConfig()
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="flex items-center justify-center p-6">
          <Skeleton className="w-24 h-24 rounded-full" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            {subtitle && (
              <p className="text-xs text-default-500">{subtitle}</p>
            )}
          </div>
          {onRefresh && (
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="flex items-center justify-center py-4">
        <div className="relative">
          <svg
            width={radius * 2 + strokeWidth}
            height={radius * 2 + strokeWidth}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-default-200"
            />
            {/* Progress circle */}
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {showValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-bold text-default-700"
                style={{ fontSize }}
              >
                {value}{unit}
              </span>
              <span className="text-xs text-default-500">
                of {maxValue}{unit}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * SimpleBarChart - Lightweight bar chart for healthcare data
 */
export function SimpleBarChart({
  title,
  subtitle,
  data,
  orientation = 'vertical',
  colorScheme = 'healthcare',
  isLoading = false,
  className,
  height = 200,
  onExport,
  onRefresh
}: BarChartProps) {
  const chartData = data as ChartDataPoint[]
  const maxValue = Math.max(...chartData.map(d => d.value))

  const getColorPalette = () => {
    switch (colorScheme) {
      case 'primary':
        return ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd']
      case 'success':
        return ['#22c55e', '#4ade80', '#86efac', '#bbf7d0']
      case 'warning':
        return ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']
      case 'danger':
        return ['#ef4444', '#f87171', '#fca5a5', '#fecaca']
      case 'healthcare':
        return ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
      default:
        return ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']
    }
  }

  const colors = getColorPalette()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody>
          <Skeleton className="w-full h-48" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-default-500">{subtitle}</p>
            )}
          </div>
          <div className="flex gap-1">
            {onRefresh && (
              <Button size="sm" variant="light" isIconOnly onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Dropdown>
                <DropdownTrigger>
                  <Button size="sm" variant="light" isIconOnly>
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onClick={() => onExport('png')}>PNG</DropdownItem>
                  <DropdownItem onClick={() => onExport('svg')}>SVG</DropdownItem>
                  <DropdownItem onClick={() => onExport('pdf')}>PDF</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="w-full" style={{ height }}>
          {orientation === 'vertical' ? (
            <div className="flex items-end justify-around h-full space-x-2">
              {chartData.map((item, index) => (
                <Tooltip key={index} content={`${item.label}: ${item.value}`}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-full rounded-t transition-all duration-500 ease-out"
                      style={{
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || colors[index % colors.length],
                        minHeight: '4px'
                      }}
                    />
                    <span className="text-xs text-default-600 mt-2 text-center">
                      {item.label}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-around h-full space-y-2">
              {chartData.map((item, index) => (
                <Tooltip key={index} content={`${item.label}: ${item.value}`}>
                  <div className="flex items-center">
                    <span className="text-xs text-default-600 w-20 text-right mr-2">
                      {item.label}
                    </span>
                    <div
                      className="h-6 rounded transition-all duration-500 ease-out"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || colors[index % colors.length],
                        minWidth: '4px'
                      }}
                    />
                    <span className="text-xs text-default-600 ml-2">
                      {item.value}
                    </span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * TimeSeriesChart - Line chart for time-based healthcare data
 */
export function TimeSeriesChart({
  title,
  subtitle,
  data,
  timeRange = '7d',
  smooth = true,
  fill = false,
  isLoading = false,
  className,
  height = 200,
  onTimeRangeChange,
  onExport,
  onRefresh
}: LineChartProps) {
  const chartData = data as TimeSeriesDataPoint[]
  const maxValue = Math.max(...chartData.map(d => d.value))
  const minValue = Math.min(...chartData.map(d => d.value))
  const range = maxValue - minValue

  const generatePath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return ''

    if (smooth) {
      // Simple smooth curve using quadratic bezier
      let path = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const cp1x = prev.x + (curr.x - prev.x) / 3
        const cp1y = prev.y
        const cp2x = curr.x - (curr.x - prev.x) / 3
        const cp2y = curr.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }
      return path
    } else {
      return `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`
    }
  }

  const points = chartData.map((d, index) => ({
    x: (index / (chartData.length - 1)) * 100,
    y: 100 - ((d.value - minValue) / range) * 100
  }))

  const pathData = generatePath(points)
  const areaPath = fill ? `${pathData} L 100 100 L 0 100 Z` : ''

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody>
          <Skeleton className="w-full h-48" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-default-500">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onTimeRangeChange && (
              <Select
                size="sm"
                value={timeRange}
                onChange={(e) => onTimeRangeChange(e.target.value)}
                className="w-20"
              >
                <SelectItem key="24h" value="24h">24h</SelectItem>
                <SelectItem key="7d" value="7d">7d</SelectItem>
                <SelectItem key="30d" value="30d">30d</SelectItem>
                <SelectItem key="90d" value="90d">90d</SelectItem>
                <SelectItem key="1y" value="1y">1y</SelectItem>
              </Select>
            )}
            {onRefresh && (
              <Button size="sm" variant="light" isIconOnly onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button size="sm" variant="light" isIconOnly onClick={() => onExport('png')}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div className="w-full relative" style={{ height }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-default-200" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Area fill */}
            {fill && (
              <path
                d={areaPath}
                fill="url(#gradient)"
                opacity="0.3"
              />
            )}

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill="#8b5cf6"
                className="hover:r-2 transition-all"
              />
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * MiniChart - Compact chart for dashboard widgets
 */
export function MiniChart({
  data,
  color = '#8b5cf6',
  height = 60,
  trend = 'neutral',
  className
}: MiniChartProps) {
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((value - minValue) / range) * 100
  }))

  const pathData = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-danger-500" />
      default:
        return <Activity className="h-3 w-3 text-default-500" />
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative" style={{ width: '60px', height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {getTrendIcon()}
    </div>
  )
}

/**
 * MetricCard - Card displaying a single metric with mini chart
 */
export function MetricCard({
  title,
  value,
  unit = '',
  change,
  data,
  color = '#8b5cf6',
  isLoading = false,
  className
}: {
  title: string
  value: number | string
  unit?: string
  change?: { value: number; isPositive: boolean }
  data?: number[]
  color?: string
  isLoading?: boolean
  className?: string
}) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="p-4">
          <Skeleton className="w-full h-16" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-default-600">{title}</p>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-bold text-default-900">
                {value}
              </span>
              {unit && (
                <span className="text-sm text-default-500">{unit}</span>
              )}
            </div>
            {change && (
              <div className="flex items-center space-x-1 mt-1">
                {change.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-success-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-danger-500" />
                )}
                <span className={cn(
                  'text-xs font-medium',
                  change.isPositive ? 'text-success-600' : 'text-danger-600'
                )}>
                  {Math.abs(change.value)}%
                </span>
              </div>
            )}
          </div>
          {data && (
            <MiniChart
              data={data}
              color={color}
              trend={change?.isPositive ? 'up' : change?.isPositive === false ? 'down' : 'neutral'}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}

// Export all chart components
export const HealthcareCharts = {
  ProgressRing,
  SimpleBarChart,
  TimeSeriesChart,
  MiniChart,
  MetricCard
}