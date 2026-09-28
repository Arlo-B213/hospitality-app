import React, { useState, useEffect } from 'react'
import { UserPreferences, ThemeMode } from '../../types/index'
import { defaultUserPreferences } from '../../utils/mockData'

interface PreferencesTabProps {
  onThemeChange?: (theme: ThemeMode) => void
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({ onThemeChange }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('userPreferences')
    return saved ? JSON.parse(saved) : defaultUserPreferences
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)

    setSaveStatus('saving')
    return () => clearTimeout(timer)
  }, [preferences])

  const handlePushNotificationsChange = (enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      pushNotificationsEnabled: enabled,
    }))
  }

  const handleReminderFrequencyChange = (frequency: 'daily' | 'weekly' | 'none') => {
    setPreferences((prev) => ({
      ...prev,
      reminderFrequency: frequency,
    }))
  }

  const handleQuietHoursToggle = (enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      quietHoursEnabled: enabled,
    }))
  }

  const handleQuietHoursStartChange = (time: string) => {
    setPreferences((prev) => ({
      ...prev,
      quietHoursStart: time,
    }))
  }

  const handleQuietHoursEndChange = (time: string) => {
    setPreferences((prev) => ({
      ...prev,
      quietHoursEnd: time,
    }))
  }

  const handleThemeChange = (theme: ThemeMode) => {
    setPreferences((prev) => ({
      ...prev,
      themeMode: theme,
    }))
    if (onThemeChange) {
      onThemeChange(theme)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>

        <div className="space-y-4">
          {/* Push Notifications Toggle */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600 mt-1">
                Receive notifications about new evaluations, milestones, and important updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={preferences.pushNotificationsEnabled}
                onChange={(e) => handlePushNotificationsChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Reminder Frequency */}
          {preferences.pushNotificationsEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Reminder Frequency</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminderFrequency"
                    value="daily"
                    checked={preferences.reminderFrequency === 'daily'}
                    onChange={(e) => handleReminderFrequencyChange(e.target.value as any)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Daily</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminderFrequency"
                    value="weekly"
                    checked={preferences.reminderFrequency === 'weekly'}
                    onChange={(e) => handleReminderFrequencyChange(e.target.value as any)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Weekly</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminderFrequency"
                    value="none"
                    checked={preferences.reminderFrequency === 'none'}
                    onChange={(e) => handleReminderFrequencyChange(e.target.value as any)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">None</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiet Hours Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
            <p className="text-sm text-gray-600 mt-1">
              Don't receive notifications during these hours
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(e) => handleQuietHoursToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {preferences.quietHoursEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quietHoursStart" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                id="quietHoursStart"
                value={preferences.quietHoursStart}
                onChange={(e) => handleQuietHoursStartChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="quietHoursEnd" className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                id="quietHoursEnd"
                value={preferences.quietHoursEnd}
                onChange={(e) => handleQuietHoursEndChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Theme Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={preferences.themeMode === 'light'}
                onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Light Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={preferences.themeMode === 'dark'}
                onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Dark Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={preferences.themeMode === 'system'}
                onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">System Default</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Status Indicator */}
      <div className="flex items-center justify-center py-2">
        {saveStatus === 'saving' && (
          <p className="text-sm text-gray-500">
            <span className="inline-block animate-spin mr-2">⏳</span>
            Saving preferences...
          </p>
        )}
        {saveStatus === 'saved' && (
          <p className="text-sm text-green-600">
            <span className="inline-block mr-2">✓</span>
            Preferences saved
          </p>
        )}
      </div>
    </div>
  )
}
