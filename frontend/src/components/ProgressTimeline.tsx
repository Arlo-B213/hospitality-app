import React from 'react'
import { Milestone } from '../types/index'

interface ProgressTimelineProps {
  milestones: Milestone[]
  daysElapsed: number
  daysTotal: number
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  milestones,
  daysElapsed,
  daysTotal,
}) => {
  const progressPercent = (daysElapsed / daysTotal) * 100

  return (
    <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        90-Day Training Progress
      </h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Day {daysElapsed} of {daysTotal}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.completed
          const isCurrent = daysElapsed >= milestone.day && (index === milestones.length - 1 || daysElapsed < milestones[index + 1].day)

          return (
            <div key={milestone.day} className="flex gap-4">
              {/* Timeline Marker */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-3 flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-600 text-white'
                      : isCurrent
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : milestone.day}
                </div>
                {index < milestones.length - 1 && (
                  <div
                    className={`w-1 h-12 mt-2 ${
                      isCompleted || isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>

              {/* Milestone Content */}
              <div className="flex-1 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold ${
                    isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : isCurrent
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {milestone.label}
                  </h4>
                  {isCompleted && (
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                      Completed
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Day {milestone.day} milestone
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Remaining</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {Math.max(0, daysTotal - daysElapsed)}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Completed</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {Math.min(daysElapsed, daysTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
