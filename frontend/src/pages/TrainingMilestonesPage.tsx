import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNewHiresSync, useSyncOnReconnect } from '../hooks/useSync'

interface Milestone {
  day: number
  title: string
  phase: string
  focusAreas: string[]
  skillsToAssess: string[]
  expectedProficiency: string
  colorClass: string
  bgClass: string
  borderClass: string
}

const MILESTONES: Milestone[] = [
  {
    day: 30,
    title: 'Foundation Phase',
    phase: 'Day 30',
    focusAreas: [
      'Basic job competency',
      'Safety and compliance training',
      'Team integration and culture fit',
    ],
    skillsToAssess: [
      'Technical basics for role',
      'Communication with team',
      'Teamwork and collaboration',
      'Policy and procedure understanding',
    ],
    expectedProficiency: '40-50%',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
  },
  {
    day: 60,
    title: 'Development Phase',
    phase: 'Day 60',
    focusAreas: [
      'Growing technical proficiency',
      'Increasing independence',
      'Quality and speed improvements',
    ],
    skillsToAssess: [
      'Problem-solving abilities',
      'Confidence in role tasks',
      'Leadership readiness indicators',
      'Customer interaction quality',
      'Process efficiency',
    ],
    expectedProficiency: '70-80%',
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
  },
  {
    day: 90,
    title: 'Mastery Phase',
    phase: 'Day 90',
    focusAreas: [
      'Full role competency',
      'Independent work performance',
      'Meeting performance standards',
    ],
    skillsToAssess: [
      'Mastery of all role-specific skills',
      'Mentoring and knowledge sharing',
      'Strategic thinking',
      'Consistent high performance',
      'Leadership capability',
    ],
    expectedProficiency: '90-100%',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
]

export const TrainingMilestonesPage: React.FC = () => {
  const { user, logout, token } = useAuth()
  const { data: newHires } = useNewHiresSync({ token })
  useSyncOnReconnect(token)

  // Calculate which new hires are at each milestone today
  const milestoneStatus = useMemo(() => {
    const today = new Date()

    return {
      day30: newHires.filter((hire) => {
        const startDate = new Date(hire.start_date)
        const daysDiff = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysDiff >= 25 && daysDiff <= 35 // 5 day window around day 30
      }),
      day60: newHires.filter((hire) => {
        const startDate = new Date(hire.start_date)
        const daysDiff = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysDiff >= 55 && daysDiff <= 65 // 5 day window around day 60
      }),
      day90: newHires.filter((hire) => {
        const startDate = new Date(hire.start_date)
        const daysDiff = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysDiff >= 85 && daysDiff <= 95 // 5 day window around day 90
      }),
    }
  }, [newHires])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                PRIDE Training
              </Link>
            </div>
            <div className="flex items-center gap-4">
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
          <Link
            to="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
          >
            <span className="mr-1">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">30-60-90 Day Review Guide</h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            A comprehensive guide for evaluators, managers, and team leads to understand what to
            evaluate at each checkpoint of a new hire's 90-day onboarding period.
          </p>
        </div>

        {/* Milestones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {MILESTONES.map((milestone) => (
            <div
              key={milestone.day}
              className={`${milestone.bgClass} border-2 ${milestone.borderClass} rounded-lg p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-lg font-bold ${milestone.colorClass}`}>{milestone.phase}</h2>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{milestone.title}</h3>
                </div>
                <div className="text-3xl opacity-50">
                  {milestone.day === 30 && '🌱'}
                  {milestone.day === 60 && '🌿'}
                  {milestone.day === 90 && '🌳'}
                </div>
              </div>

              {/* Focus Areas */}
              <div className="mb-5">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Focus Areas</h4>
                <ul className="space-y-1">
                  {milestone.focusAreas.map((area, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills to Assess */}
              <div className="mb-5">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Skills to Assess</h4>
                <ul className="space-y-1">
                  {milestone.skillsToAssess.map((skill, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expected Proficiency */}
              <div className="pt-4 border-t border-current border-opacity-10">
                <p className="text-sm text-gray-600">
                  Expected Proficiency:{' '}
                  <span className={`font-bold ${milestone.colorClass}`}>
                    {milestone.expectedProficiency}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Active Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Reviews This Week</h2>

          {[
            { day: 30, data: milestoneStatus.day30, title: 'Day 30 Foundation Reviews' },
            { day: 60, data: milestoneStatus.day60, title: 'Day 60 Development Reviews' },
            { day: 90, data: milestoneStatus.day90, title: 'Day 90 Mastery Reviews' },
          ].map(({ day, data, title }) => (
            <div key={day} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
              {data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.map((hire: any) => (
                    <div key={hire.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-gray-900">{hire.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{hire.role}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Start Date: {new Date(hire.start_date).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${hire.completion_percent}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {hire.completion_percent}%
                        </span>
                      </div>
                      <Link
                        to={`/evaluate/${hire.id}`}
                        className="inline-block mt-3 px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No employees at this milestone this week.</p>
              )}
            </div>
          ))}
        </div>

        {/* Best Practices Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Best Practices for Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Before the Review</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Review previous assessment records</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Gather feedback from team members</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Prepare specific examples and observations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Schedule adequate time for discussion</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">During the Review</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Provide constructive, specific feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Discuss progress on previous goals</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Set clear expectations for next phase</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Document feedback and action items</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
