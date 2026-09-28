import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { DailyProgress } from '../types/index'

interface TrendChartProps {
  data: DailyProgress[]
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  // Format data for display
  const chartData = data.map((item) => ({
    ...item,
    // Format date for display (show day number and short date)
    displayDate: `Day ${item.day}`,
    shortDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Weekly Progress Trend
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis
            dataKey="shortDate"
            tick={{ fill: '#64748b', fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <YAxis
            domain={[0, 100]}
            label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#64748b', fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
            }}
            formatter={(value: any) => [`${Math.round(value)}%`, 'Progress']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <ReferenceLine
            y={50}
            stroke="#e5e7eb"
            strokeDasharray="5 5"
            label={{ value: '50% Midpoint', position: 'right', fill: '#6b7280' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="progressPercent"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Progress %"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Trend Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Latest Progress</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {chartData.length > 0 ? `${Math.round(chartData[chartData.length - 1].progressPercent)}%` : 'N/A'}
            </div>
          </div>
          {chartData.length > 1 && (
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Change</div>
              <div className="text-2xl font-bold mt-1">
                <span className={chartData[chartData.length - 1].progressPercent > chartData[0].progressPercent ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                  {((chartData[chartData.length - 1].progressPercent - chartData[0].progressPercent).toFixed(1))}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
