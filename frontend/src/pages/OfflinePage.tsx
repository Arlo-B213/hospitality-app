/**
 * Offline Page Component
 * Displayed when the app cannot reach the network
 */

import React, { useState, useEffect } from 'react';

export function OfflinePage(): React.ReactElement {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Reload the app after a short delay to reconnect
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Offline Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16H5m13.889 0h3M5 12h3m13.889 0h3M5 8h3m13.889 0h3M9 20a2 2 0 110-4 2 2 0 010 4zm6-16a2 2 0 110 4 2 2 0 010-4zm0 8a2 2 0 110 4 2 2 0 010-4z"
                />
              </svg>
            </div>
          </div>

          {/* Status Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Connection
          </h1>
          <p className="text-gray-600 mb-6">
            {isOnline
              ? 'You are back online! Reconnecting...'
              : 'You are currently offline. Some features may be unavailable.'}
          </p>

          {/* Cached Content Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Good news:</strong> Your recent data is cached locally. You can view
              previously loaded dashboards and evaluations.
            </p>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  isOnline ? 'bg-green-600' : 'bg-red-600'
                }`}
              />
              {isOnline ? 'Back Online' : 'Offline'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            Check your internet connection and try again.
          </p>
        </div>

        {/* Network Status Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {isOnline
              ? 'Connection restored'
              : 'Waiting for connection...'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OfflinePage;
