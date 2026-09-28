import React, { Suspense } from 'react'

/**
 * Lazy-loaded chart components for code splitting
 * This reduces the initial bundle size by loading charts only when needed
 */

// Lazy load chart components
const LazyRadarChart = React.lazy(() => import('./RadarChart').then(m => ({ default: m.RadarChart })))
const LazyTrendChart = React.lazy(() => import('./TrendChart').then(m => ({ default: m.TrendChart })))
const LazyCohortComparison = React.lazy(() => import('./CohortComparison').then(m => ({ default: m.CohortComparison })))
const LazySkillHeatmap = React.lazy(() => import('./SkillHeatmap').then(m => ({ default: m.SkillHeatmap })))

/**
 * Loading skeleton for chart containers
 * Improves perceived performance by showing a placeholder while loading
 */
const ChartSkeleton: React.FC = () => (
  <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 animate-pulse">
    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
  </div>
)

/**
 * Wrapped lazy RadarChart with Suspense boundary
 */
export const RadarChartLazy: React.FC<React.ComponentProps<typeof LazyRadarChart>> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyRadarChart {...props} />
  </Suspense>
)

/**
 * Wrapped lazy TrendChart with Suspense boundary
 */
export const TrendChartLazy: React.FC<React.ComponentProps<typeof LazyTrendChart>> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyTrendChart {...props} />
  </Suspense>
)

/**
 * Wrapped lazy CohortComparison with Suspense boundary
 */
export const CohortComparisonLazy: React.FC<React.ComponentProps<typeof LazyCohortComparison>> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazyCohortComparison {...props} />
  </Suspense>
)

/**
 * Wrapped lazy SkillHeatmap with Suspense boundary
 */
export const SkillHeatmapLazy: React.FC<React.ComponentProps<typeof LazySkillHeatmap>> = (props) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LazySkillHeatmap {...props} />
  </Suspense>
)
