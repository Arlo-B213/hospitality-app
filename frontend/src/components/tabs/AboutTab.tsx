import React, { useState, useEffect } from 'react'
import { useServiceWorker } from '../../hooks/useServiceWorker'

export const AboutTab: React.FC = () => {
  const { isSupported } = useServiceWorker()
  const [cacheSize, setCacheSize] = useState<string>('Calculating...')
  const appVersion = process.env.REACT_APP_VERSION || '1.0.0'

  // Calculate cache size
  useEffect(() => {
    const calculateCacheSize = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate()
          const usedMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(2)
          const quotaMB = ((estimate.quota || 0) / 1024 / 1024).toFixed(2)
          setCacheSize(`${usedMB} MB of ${quotaMB} MB`)
        } else {
          setCacheSize('Not available')
        }
      } catch (error) {
        setCacheSize('Unable to calculate')
      }
    }

    calculateCacheSize()
  }, [])

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear the cache? You may lose offline functionality.')) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
        setCacheSize('Cleared')
        setTimeout(() => {
          setCacheSize('0 MB')
        }, 2000)
      } catch (error) {
        console.error('Error clearing cache:', error)
        alert('Failed to clear cache')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* About App Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About PRIDE Training</h3>

        <div className="space-y-4">
          <p className="text-gray-600">
            PRIDE Training is a comprehensive onboarding and training management platform designed for restaurant teams.
            Track new hire progress, manage evaluations, and visualize analytics all in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-600">App Version</p>
              <p className="text-lg font-semibold text-gray-900">v{appVersion}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Build Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Status Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progressive Web App</h3>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-gray-900">PWA Support</p>
              <p className="text-sm text-gray-600 mt-1">
                Install the app for offline access and faster loading
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isSupported ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {isSupported ? 'Supported' : 'Not Supported'}
            </div>
          </div>

          {isSupported && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-900">
                You can install this app on your device for quick access and offline functionality. Look for the install prompt in your browser.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cache Management Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage & Cache</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Cache Usage</p>
            <p className="text-lg font-semibold text-gray-900">{cacheSize}</p>
            <p className="text-xs text-gray-500 mt-1">
              Cached data allows the app to work offline and improves performance
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Credits Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits & Technologies</h3>

        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-900">Built with</p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>React - UI framework</li>
              <li>TypeScript - Type-safe JavaScript</li>
              <li>Tailwind CSS - Utility-first CSS framework</li>
              <li>React Router - Client-side routing</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-md p-3 mt-4">
            <p className="text-xs text-gray-600">
              <strong>Copyright</strong> - PRIDE Training Platform
              <br />
              <strong>License</strong> - Internal Use Only
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback & Support</h3>

        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Have suggestions or found a bug? We'd love to hear from you.
          </p>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors">
              Send Feedback
            </button>
            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-md transition-colors">
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
