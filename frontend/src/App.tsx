import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { EvaluationPage } from './pages/EvaluationPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { useServiceWorker } from './hooks/useServiceWorker'

/**
 * PWA Install Prompt Component
 * Displays install prompt and update notifications
 */
function PWAPrompt(): React.ReactElement | null {
  const { isSupported, updateAvailable, installUpdate, isOnline } = useServiceWorker()
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Handle browser install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  // Show update available notification
  if (updateAvailable && isSupported) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">App Update Available</h3>
            <p className="text-sm text-blue-800 mb-3">
              A new version of Pride Training App is available.
            </p>
            <button
              onClick={installUpdate}
              className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Update Now
            </button>
          </div>
          <button
            onClick={() => {}}
            className="ml-2 text-blue-500 hover:text-blue-700"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Show install prompt
  if (showInstallPrompt && isSupported && !updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 bg-indigo-50 border border-indigo-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-indigo-900 mb-1">Add to Home Screen</h3>
            <p className="text-sm text-indigo-800 mb-3">
              Install Pride Training App for quick access and offline support.
            </p>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
            >
              Install
            </button>
          </div>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="ml-2 text-indigo-500 hover:text-indigo-700"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // Show offline notification
  if (!isOnline && isSupported) {
    return (
      <div className="fixed top-4 right-4 bg-amber-50 border border-amber-300 rounded-lg p-3 shadow-lg max-w-sm z-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16H5m13.889 0h3M5 12h3m13.889 0h3M5 8h3m13.889 0h3M9 20a2 2 0 110-4 2 2 0 010 4zm6-16a2 2 0 110 4 2 2 0 010-4zm0 8a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </div>
          <p className="ml-2 text-sm font-medium text-amber-800">
            You are offline. Cached data is available.
          </p>
        </div>
      </div>
    )
  }

  return null
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <PWAPrompt />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluate/:newHireId"
              element={
                <ProtectedRoute>
                  <EvaluationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:newHireId"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
