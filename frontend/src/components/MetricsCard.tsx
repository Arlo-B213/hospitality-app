import React from 'react'

interface MetricsCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
  green: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
  purple: 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700',
  orange: 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700',
}

const textColorClasses = {
  blue: 'text-blue-900 dark:text-blue-100',
  green: 'text-green-900 dark:text-green-100',
  purple: 'text-purple-900 dark:text-purple-100',
  orange: 'text-orange-900 dark:text-orange-100',
}

const iconColorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend,
  trendValue,
  color = 'blue',
}) => {
  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${textColorClasses[color]}`}>{value}</p>
            {unit && <p className={`text-sm font-medium ${textColorClasses[color]}`}>{unit}</p>}
          </div>
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm font-medium ${
                trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : trend === 'down'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
              }`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && <div className={`text-3xl ${iconColorClasses[color]}`}>{icon}</div>}
      </div>
    </div>
  )
}
