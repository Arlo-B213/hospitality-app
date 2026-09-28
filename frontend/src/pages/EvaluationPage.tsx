import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNewHireSync, useSyncOnReconnect } from '../hooks/useSync'
import { SyncStatus } from '../components/SyncStatus'
import { EvaluationForm } from '../components/EvaluationForm'

export const EvaluationPage: React.FC = () => {
  const { newHireId } = useParams<{ newHireId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    data: newHire,
    status,
    isOnline,
    error,
    pendingChanges,
    failedChanges,
  } = useNewHireSync(newHireId || '', { token })
  useSyncOnReconnect(token)

  const isLoading = status === 'idle' || status === 'syncing'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-flex items-center justify-center w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
          <p className="text-gray-600">Loading evaluation form...</p>
        </div>
      </div>
    )
  }

  if (error || !newHire) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">PRIDE Training</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Evaluation</h2>
            <p className="text-red-800 mb-4">{error || 'The new hire was not found.'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">PRIDE Training</h1>
            </div>
            <div className="flex items-center gap-4">
              <SyncStatus
                status={status}
                isOnline={isOnline}
                error={error}
                pendingChanges={pendingChanges}
                failedChanges={failedChanges}
              />
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Evaluation Form</h2>
          <p className="text-gray-600 mt-2">Complete the 90-day technical skills evaluation</p>
        </div>

        <EvaluationForm newHire={newHire} />
      </main>
    </div>
  )
}
