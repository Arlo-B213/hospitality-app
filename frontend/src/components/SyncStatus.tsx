/**
 * SyncStatus Component - Shows sync state in navbar/dashboard
 * Displays real-time feedback: "Syncing...", "Synced", "Offline", error states
 */

import React, { useState } from 'react'
import { SyncStatus as SyncStatusType } from '../hooks/useSync'

export interface SyncStatusProps {
  status: SyncStatusType
  isOnline: boolean
  lastSyncTime?: number
  error?: string
  pendingChanges: number
  failedChanges: number
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  status,
  isOnline,
  lastSyncTime,
  error,
  pendingChanges,
  failedChanges,
}) => {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusColor = (): string => {
    if (!isOnline) return 'text-orange-600'
    if (status === 'error') return 'text-red-600'
    if (status === 'syncing') return 'text-blue-600'
    if (failedChanges > 0) return 'text-red-600'
    return 'text-green-600'
  }

  const getStatusIcon = (): string => {
    if (!isOnline) return '🌐'
    if (status === 'syncing') return '⏳'
    if (status === 'error') return '❌'
    if (failedChanges > 0) return '⚠️'
    return '✓'
  }

  const getStatusText = (): string => {
    if (!isOnline) return 'Offline'
    if (status === 'syncing') return 'Syncing...'
    if (status === 'error') return 'Sync Error'
    if (failedChanges > 0) return 'Sync Failed'
    if (pendingChanges > 0) return `Pending (${pendingChanges})`
    return 'Synced'
  }

  const formatLastSyncTime = (): string => {
    if (!lastSyncTime) return 'Never'

    const now = Date.now()
    const diffMs = now - lastSyncTime
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)

    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return 'Over an hour ago'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          getStatusColor()
        } hover:opacity-80 cursor-pointer`}
        title="Click for details"
      >
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </button>

      {/* Details Tooltip */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 z-50">
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Sync Status</p>
            </div>

            <div className="border-t pt-2">
              <p className="text-gray-600">
                Status: <span className="font-medium">{status}</span>
              </p>
            </div>

            <div>
              <p className="text-gray-600">
                Network: <span className={isOnline ? 'text-green-600' : 'text-orange-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </p>
            </div>

            <div>
              <p className="text-gray-600">
                Last Sync: <span className="font-medium">{formatLastSyncTime()}</span>
              </p>
            </div>

            {pendingChanges > 0 && (
              <div>
                <p className="text-gray-600">
                  Pending Changes: <span className="font-medium text-blue-600">{pendingChanges}</span>
                </p>
              </div>
            )}

            {failedChanges > 0 && (
              <div>
                <p className="text-gray-600">
                  Failed Changes: <span className="font-medium text-red-600">{failedChanges}</span>
                </p>
              </div>
            )}

            {error && (
              <div className="border-t pt-2">
                <p className="text-red-600 text-xs font-medium">Error: {error}</p>
              </div>
            )}

            {!isOnline && (
              <div className="border-t pt-2 bg-orange-50 p-2 rounded">
                <p className="text-orange-900 text-xs">
                  You are offline. Changes will be saved when you reconnect.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-4 shadow-lg max-w-xs">
          <p className="text-sm font-medium text-orange-900">You are offline</p>
          <p className="text-xs text-orange-800 mt-1">
            Changes are being saved locally and will sync when you reconnect.
          </p>
        </div>
      )}
    </div>
  )
}

export default SyncStatus
