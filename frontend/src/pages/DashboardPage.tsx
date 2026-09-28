import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNewHiresSync, useSyncOnReconnect } from '../hooks/useSync'
import { NewHireCard } from '../components/NewHireCard'
import { FilterBar } from '../components/FilterBar'
import { SyncStatus } from '../components/SyncStatus'
import { FilterOptions } from '../types/index'

export const DashboardPage: React.FC = () => {
  const { user, logout, token } = useAuth()
  const {
    data: newHires,
    status,
    isOnline,
    error,
    pendingChanges,
    failedChanges,
  } = useNewHiresSync({ token })
  useSyncOnReconnect(token)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    department: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'start_date',
    sortOrder: 'desc',
  })

  // Filter and sort new hires
  const filteredAndSortedHires = useMemo(() => {
    let result = [...newHires]

    // Filter by department
    if (filters.department !== 'all') {
      result = result.filter((hire) => hire.department === filters.department)
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((hire) => hire.status === filters.status)
    }

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (hire) =>
          hire.name.toLowerCase().includes(query) ||
          hire.role.toLowerCase().includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      let compareValue = 0

      if (filters.sortBy === 'start_date') {
        compareValue = new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      } else if (filters.sortBy === 'completion_percent') {
        compareValue = a.completion_percent - b.completion_percent
      }

      return filters.sortOrder === 'asc' ? compareValue : -compareValue
    })

    return result
  }, [newHires, filters])

  const handleCreateNewHire = () => {
    // TODO: Navigate to create form or open modal
    // For now, just show an alert
    alert('Create new hire form will be implemented in Task 8')
    setShowCreateModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">PRIDE Training</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/training-milestones"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Training Guide"
              >
                📋 Training Guide
              </Link>
              <SyncStatus
                status={status}
                isOnline={isOnline}
                error={error}
                pendingChanges={pendingChanges}
                failedChanges={failedChanges}
              />
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Link
                to="/settings"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Settings"
              >
                ⚙️
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">New Hire Dashboard</h2>
              <p className="text-gray-600 mt-2">
                Manage and track progress of new hires through their 90-day onboarding
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              + Create New Hire
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {newHires.filter((h) => h.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {newHires.filter((h) => h.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">On Hold</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {newHires.filter((h) => h.status === 'on-hold').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-yellow-600">⏸</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Completion</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {newHires.length > 0
                    ? Math.round(
                        newHires.reduce((sum, h) => sum + h.completion_percent, 0) /
                          newHires.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-600">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Review Focus Card */}
        <CurrentMilestoneCard newHires={newHires} />

        {/* Filter Bar */}
        <FilterBar filters={filters} onFilterChange={setFilters} />

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredAndSortedHires.length}</span> of{' '}
          <span className="font-semibold">{newHires.length}</span> new hires
          {filters.searchQuery && ` matching "${filters.searchQuery}"`}
        </div>

        {/* New Hire Grid */}
        {filteredAndSortedHires.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedHires.map((newHire) => (
              <NewHireCard key={newHire.id} newHire={newHire} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">
              No new hires match your current filters.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria or creating a new hire.
            </p>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Hire</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 text-sm mb-4">
                The create new hire form will be implemented in the next task. For now, you can
                create new hires through the API.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCreateNewHire}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CurrentMilestoneCard({ newHires }: { newHires: any[] }) {
  const today = new Date()

  const calculateDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate)
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Find new hires at each milestone today (with a 5-day window)
  const atDay30 = newHires.filter((hire) => {
    const daysSince = calculateDaysSinceStart(hire.start_date)
    return daysSince >= 25 && daysSince <= 35
  })

  const atDay60 = newHires.filter((hire) => {
    const daysSince = calculateDaysSinceStart(hire.start_date)
    return daysSince >= 55 && daysSince <= 65
  })

  const atDay90 = newHires.filter((hire) => {
    const daysSince = calculateDaysSinceStart(hire.start_date)
    return daysSince >= 85 && daysSince <= 95
  })

  const totalAtMilestone = atDay30.length + atDay60.length + atDay90.length

  return (
    <div className="mb-8 bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today's Review Focus</h3>
          <p className="text-gray-600 text-sm mt-1">Current milestone checkpoints for this week</p>
        </div>
        <Link
          to="/training-milestones"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          View Full Guide
        </Link>
      </div>

      {totalAtMilestone > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {atDay30.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="font-semibold text-green-900 text-sm mb-2">
                🌱 Day 30 - Foundation Phase
              </p>
              <p className="text-sm text-gray-700">
                {atDay30.length} {atDay30.length === 1 ? 'employee' : 'employees'} to review
              </p>
              <p className="text-xs text-gray-600 mt-1">Expected: 40-50% proficiency</p>
            </div>
          )}
          {atDay60.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="font-semibold text-yellow-900 text-sm mb-2">
                🌿 Day 60 - Development Phase
              </p>
              <p className="text-sm text-gray-700">
                {atDay60.length} {atDay60.length === 1 ? 'employee' : 'employees'} to review
              </p>
              <p className="text-xs text-gray-600 mt-1">Expected: 70-80% proficiency</p>
            </div>
          )}
          {atDay90.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="font-semibold text-blue-900 text-sm mb-2">
                🌳 Day 90 - Mastery Phase
              </p>
              <p className="text-sm text-gray-700">
                {atDay90.length} {atDay90.length === 1 ? 'employee' : 'employees'} to review
              </p>
              <p className="text-xs text-gray-600 mt-1">Expected: 90-100% proficiency</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          No employees at milestone checkpoints this week. Next review scheduled in{' '}
          {newHires.length > 0
            ? Math.min(
                ...newHires.map((h) => {
                  const daysSince = calculateDaysSinceStart(h.start_date)
                  if (daysSince < 25)
                    return 25 - daysSince
                  if (daysSince < 55) return 55 - daysSince
                  return 85 - daysSince
                })
              )
            : 'N/A'}{' '}
          days.
        </p>
      )}
    </div>
  )
}
