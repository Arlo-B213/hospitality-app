import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSyncOnReconnect } from '../hooks/useSync'
import { SettingsTab, ThemeMode } from '../types/index'
import { ProfileTab } from '../components/tabs/ProfileTab'
import { PreferencesTab } from '../components/tabs/PreferencesTab'
import { AboutTab } from '../components/tabs/AboutTab'

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  useSyncOnReconnect(token)

  const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ]

  const handleThemeChange = (theme: ThemeMode) => {
    // Apply theme to document
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else if (theme === 'light') {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
    } else {
      // System default
      html.classList.remove('dark')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        html.classList.add('dark')
      }
      html.style.colorScheme = 'light dark'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'preferences' && <PreferencesTab onThemeChange={handleThemeChange} />}
          {activeTab === 'about' && <AboutTab />}
        </div>
      </main>
    </div>
  )
}
