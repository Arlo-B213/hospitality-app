import React from 'react'
import { useNavigate } from 'react-router-dom'
import { NewHire, StatusType } from '../types/index'

interface NewHireCardProps {
  newHire: NewHire
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800'
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusTypeColor = (statusType: StatusType): string => {
  switch (statusType) {
    case 'on-track':
      return 'bg-green-500'
    case 'behind':
      return 'bg-yellow-500'
    case 'at-risk':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusType = (completion: number, daysElapsed: number): StatusType => {
  const expectedCompletion = (daysElapsed / 90) * 100
  const difference = completion - expectedCompletion

  if (difference >= -5) {
    return 'on-track'
  } else if (difference >= -15) {
    return 'behind'
  } else {
    return 'at-risk'
  }
}

export const NewHireCard: React.FC<NewHireCardProps> = ({ newHire }) => {
  const navigate = useNavigate()
  const statusType = getStatusType(newHire.completion_percent, newHire.days_elapsed)
  const progressBarColor = getStatusTypeColor(statusType)

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00Z')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleEvaluateClick = () => {
    navigate(`/evaluate/${newHire.id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="border-l-4 border-blue-500 px-6 py-4 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{newHire.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {newHire.role} • {newHire.department === 'FOH' ? 'Front of House' : 'Back of House'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(newHire.status)}`}
          >
            {newHire.status.charAt(0).toUpperCase() + newHire.status.slice(1).replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatDate(newHire.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">90-Day Target</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatDate(newHire.day_90_target_date)}
            </p>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Progress</p>
            <span className="text-sm font-semibold text-gray-900">
              {newHire.completion_percent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
              style={{ width: `${Math.min(newHire.completion_percent, 100)}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {newHire.days_elapsed} days elapsed • Status: {statusType}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusTypeColor(statusType)}`}
          />
          <span className="text-sm font-medium text-gray-700">
            {statusType === 'on-track' && 'On track for completion'}
            {statusType === 'behind' && 'Slightly behind pace'}
            {statusType === 'at-risk' && 'At risk of not completing'}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <button
          onClick={handleEvaluateClick}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          View/Edit Evaluation
        </button>
      </div>
    </div>
  )
}
