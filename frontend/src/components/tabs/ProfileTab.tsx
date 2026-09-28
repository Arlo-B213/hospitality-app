import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { RoleBadge } from '../RoleBadge'

export const ProfileTab: React.FC = () => {
  const { user, logout } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const validatePasswordChange = (): boolean => {
    setPasswordError('')

    if (!currentPassword) {
      setPasswordError('Current password is required')
      return false
    }

    if (!newPassword) {
      setPasswordError('New password is required')
      return false
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return false
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return false
    }

    return true
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordChange()) {
      return
    }

    setIsChangingPassword(true)

    // Mock API call to change password
    try {
      // TODO: Replace with real API endpoint in Task 14
      // const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/change-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentPassword, newPassword }),
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordForm(false)
        setPasswordSuccess('')
      }, 2000)
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
    }
  }

  return (
    <div className="space-y-6">
      {/* User Information Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={user?.email || 'Not set'}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Display name will be editable in future updates</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 cursor-not-allowed"
            />
          </div>

          {/* Role and Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex items-center">
                <RoleBadge role={user?.role as any} size="md" />
              </div>
            </div>

            {user?.team && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <input
                  type="text"
                  value={user.team}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password (min 8 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{passwordSuccess}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordError('')
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Out</h3>
        <p className="text-gray-600 text-sm mb-4">
          Sign out of your account. You'll need to log back in to access PRIDE Training.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
