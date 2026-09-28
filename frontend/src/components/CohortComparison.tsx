import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CohortMetric } from '../types/index'

interface CohortComparisonProps {
  data: CohortMetric[]
  percentile: number
}

/**
 * CohortComparison component with React.memo optimization
 * Prevents re-renders when props haven't changed
 */
export const CohortComparison = React.memo<CohortComparisonProps>(({ data, percentile }) => {
  return (
    <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cohort Comparison
        </h3>
        <div className="mt-2 flex items-center gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Percentile Rank</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {Math.round(percentile)}
              <span className="text-lg font-normal">%</span>
            </div>
          </div>
          <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
            <p>You're performing better than {Math.round(percentile)}% of your cohort</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 12 }}
            stroke="#cbd5e1"
          />
          <YAxis
            domain={[0, 5]}
            label={{ value: 'Score (0-5)', angle: -90, position: 'insideLeft' }}
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
            formatter={(value: any) => `${(value as number).toFixed(2)}/5`}
          />
          <Legend />
          <Bar dataKey="userScore" fill="#3b82f6" name="Your Score" radius={[8, 8, 0, 0]} />
          <Bar dataKey="cohortAverage" fill="#e5e7eb" name="Cohort Average" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Comparison Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {data.map((metric) => {
            const difference = metric.userScore - metric.cohortAverage
            const isAboveAverage = difference > 0
            return (
              <div key={metric.label} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    You: <span className="font-semibold text-gray-900 dark:text-white">{metric.userScore.toFixed(1)}</span> vs{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">{metric.cohortAverage.toFixed(1)}</span> avg
                  </span>
                  <span className={`text-sm font-semibold ${
                    isAboveAverage
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {isAboveAverage ? '+' : ''}{difference.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
