import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAnalyticsSync, useSyncOnReconnect } from '../hooks/useSync'
import { SyncStatus } from '../components/SyncStatus'
import { MetricsCard } from '../components/MetricsCard'
import { SkillHeatmapLazy } from '../components/LazyCharts'
import { RadarChartLazy } from '../components/LazyCharts'
import { TrendChartLazy } from '../components/LazyCharts'
import { CohortComparisonLazy } from '../components/LazyCharts'
import { ProgressTimeline } from '../components/ProgressTimeline'

export const AnalyticsPage: React.FC = () => {
  const { newHireId } = useParams<{ newHireId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    data: analytics,
    status,
    isOnline,
    error,
    pendingChanges,
    failedChanges,
  } = useAnalyticsSync(newHireId || '', { token })
  useSyncOnReconnect(token)

  const isLoading = status === 'idle' || status === 'syncing'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-8 max-w-md text-center shadow-lg">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Unknown error'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {analytics.newHireName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Training Analytics & Progress</p>
        </div>
        <SyncStatus
          status={status}
          isOnline={isOnline}
          error={error}
          pendingChanges={pendingChanges}
          failedChanges={failedChanges}
        />
      </div>

      {/* Key Metrics Cards - 2x2 grid on desktop, 1 col on mobile */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Days Elapsed"
          value={analytics.daysElapsed}
          unit="days"
          color="blue"
          icon="📅"
        />
        <MetricsCard
          title="Completion"
          value={Math.round(analytics.completionPercent)}
          unit="%"
          color="green"
          icon="✅"
        />
        <MetricsCard
          title="Skills Average"
          value={analytics.skillsAverage.toFixed(1)}
          unit="/5.0"
          color="purple"
          icon="⭐"
        />
        <MetricsCard
          title="Cohort Percentile"
          value={Math.round(analytics.cohortPercentile)}
          unit="th"
          color="orange"
          icon="📊"
        />
      </div>

      {/* Charts Grid - Responsive layout */}
      <div className="space-y-6">
        {/* Row 1: Progress Timeline (Full Width) */}
        <ProgressTimeline
          milestones={analytics.milestones}
          daysElapsed={analytics.daysElapsed}
          daysTotal={analytics.daysTotal}
        />

        {/* Row 2: Radar Chart and Trend Chart (1 col mobile, 2 col desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RadarChartLazy
            technicalScore={analytics.technicalScore}
            softSkillScore={analytics.softSkillScore}
            leadershipScore={analytics.leadershipScore}
          />
          <TrendChartLazy data={analytics.dailyProgress} />
        </div>

        {/* Row 3: Cohort Comparison (Full Width) */}
        <CohortComparisonLazy
          data={analytics.cohortComparison}
          percentile={analytics.cohortPercentile}
        />

        {/* Row 4: Skill Heatmap (Full Width) */}
        <SkillHeatmapLazy skills={analytics.skillProficiencies} />
      </div>

      {/* Footer Note */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
