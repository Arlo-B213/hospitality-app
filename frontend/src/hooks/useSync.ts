/**
 * useSync Hook - Main sync orchestration
 * Manages real-time sync, offline support, and network detection
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { NewHire, AnalyticsResponse } from '../types/index'
import { apiClient } from '../services/api'
import { db } from '../services/db'
import { syncQueue } from '../services/syncQueue'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

export interface SyncState {
  status: SyncStatus
  isOnline: boolean
  lastSyncTime?: number
  error?: string
  pendingChanges: number
  failedChanges: number
}

interface UseSyncOptions {
  token: string | null
  enabled?: boolean
}

interface UseNewHiresSyncResult extends SyncState {
  data: NewHire[]
  refetch: () => Promise<void>
}

interface UseNewHireSyncResult extends SyncState {
  data: NewHire | null
  refetch: () => Promise<void>
}

interface UseAnalyticsSyncResult extends SyncState {
  data: AnalyticsResponse | null
  refetch: () => Promise<void>
}

interface UseEvaluationSyncResult extends SyncState {
  data: any
  refetch: () => Promise<void>
  saveSkillRatings: (ratings: any[]) => Promise<void>
  markLeadershipComplete: (moduleId: string, notes?: string) => Promise<void>
}

class UseSyncManager {
  private networkListeners = new Set<(isOnline: boolean) => void>()
  private syncListeners = new Set<() => void>()
  private isOnline = navigator.onLine

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyNetworkChange(true)
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyNetworkChange(false)
    })
  }

  addNetworkListener(listener: (isOnline: boolean) => void) {
    this.networkListeners.add(listener)
  }

  removeNetworkListener(listener: (isOnline: boolean) => void) {
    this.networkListeners.delete(listener)
  }

  notifyNetworkChange(isOnline: boolean) {
    this.networkListeners.forEach((listener) => listener(isOnline))
  }

  addSyncListener(listener: () => void) {
    this.syncListeners.add(listener)
  }

  removeSyncListener(listener: () => void) {
    this.syncListeners.delete(listener)
  }

  notifySync() {
    this.syncListeners.forEach((listener) => listener())
  }

  getIsOnline() {
    return this.isOnline
  }
}

const syncManager = new UseSyncManager()

/**
 * Hook for fetching new hires list with sync support
 */
export function useNewHiresSync(options: UseSyncOptions): UseNewHiresSyncResult {
  const [data, setData] = useState<NewHire[]>([])
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [isOnline, setIsOnline] = useState(syncManager.getIsOnline())
  const [error, setError] = useState<string>()
  const [lastSyncTime, setLastSyncTime] = useState<number>()
  const [pendingChanges, setPendingChanges] = useState(0)
  const [failedChanges, setFailedChanges] = useState(0)
  const fetchTimeoutRef = useRef<NodeJS.Timeout>()

  const { token, enabled = true } = options

  const refetch = useCallback(async () => {
    if (!enabled) return

    try {
      setStatus('syncing')
      setError(undefined)

      if (isOnline && token) {
        // Fetch from backend and cache
        const newHires = await apiClient.getNewHires(token)
        await db.saveNewHires(newHires)
        setData(newHires)
        setLastSyncTime(Date.now())
        setStatus('synced')
      } else {
        // Use cached data
        const cached = await db.getNewHires()
        setData(cached)
        setStatus('offline')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch new hires'
      setError(errorMsg)
      setStatus('error')

      // Fall back to cache on error
      try {
        const cached = await db.getNewHires()
        setData(cached)
      } catch {
        // Ignore cache error
      }
    }
  }, [enabled, token, isOnline])

  // Initial fetch and polling
  useEffect(() => {
    if (!enabled) return

    refetch()

    // Set up polling when online (5 second interval)
    const pollInterval = 5000
    if (isOnline && token) {
      fetchTimeoutRef.current = setInterval(refetch, pollInterval)
    }

    return () => {
      if (fetchTimeoutRef.current) clearInterval(fetchTimeoutRef.current)
    }
  }, [enabled, refetch, token, isOnline])

  // Network detection
  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online)
      if (online) {
        refetch()
      }
    }

    syncManager.addNetworkListener(handleNetworkChange)
    return () => syncManager.removeNetworkListener(handleNetworkChange)
  }, [refetch])

  // Monitor sync queue
  useEffect(() => {
    const updateSyncStatus = async () => {
      const syncStatus = await syncQueue.getSyncStatus()
      setPendingChanges(syncStatus.pendingCount)
      setFailedChanges(syncStatus.failedCount)
    }

    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 1000)

    const handleSync = () => updateSyncStatus()
    syncManager.addSyncListener(handleSync)

    return () => {
      clearInterval(interval)
      syncManager.removeSyncListener(handleSync)
    }
  }, [])

  return {
    data,
    status,
    isOnline,
    error,
    lastSyncTime,
    pendingChanges,
    failedChanges,
    refetch,
  }
}

/**
 * Hook for fetching a single new hire with sync support
 */
export function useNewHireSync(id: string, options: UseSyncOptions): UseNewHireSyncResult {
  const [data, setData] = useState<NewHire | null>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [isOnline, setIsOnline] = useState(syncManager.getIsOnline())
  const [error, setError] = useState<string>()
  const [lastSyncTime, setLastSyncTime] = useState<number>()
  const [pendingChanges, setPendingChanges] = useState(0)
  const [failedChanges, setFailedChanges] = useState(0)

  const { token, enabled = true } = options

  const refetch = useCallback(async () => {
    if (!enabled || !id) return

    try {
      setStatus('syncing')
      setError(undefined)

      if (isOnline && token) {
        const hire = await apiClient.getNewHire(token, id)
        await db.saveNewHires([hire])
        setData(hire)
        setLastSyncTime(Date.now())
        setStatus('synced')
      } else {
        const allCached = await db.getNewHires()
        const cached = allCached.find((h) => h.id === id)
        setData(cached || null)
        setStatus('offline')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch new hire'
      setError(errorMsg)
      setStatus('error')

      try {
        const allCached = await db.getNewHires()
        const cached = allCached.find((h) => h.id === id)
        setData(cached || null)
      } catch {
        // Ignore cache error
      }
    }
  }, [enabled, id, token, isOnline])

  useEffect(() => {
    if (!enabled || !id) return
    refetch()
  }, [enabled, id, refetch])

  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online)
      if (online) {
        refetch()
      }
    }

    syncManager.addNetworkListener(handleNetworkChange)
    return () => syncManager.removeNetworkListener(handleNetworkChange)
  }, [refetch])

  useEffect(() => {
    const updateSyncStatus = async () => {
      const syncStatus = await syncQueue.getSyncStatus()
      setPendingChanges(syncStatus.pendingCount)
      setFailedChanges(syncStatus.failedCount)
    }

    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    data,
    status,
    isOnline,
    error,
    lastSyncTime,
    pendingChanges,
    failedChanges,
    refetch,
  }
}

/**
 * Hook for fetching analytics with sync support
 */
export function useAnalyticsSync(
  newHireId: string,
  options: UseSyncOptions
): UseAnalyticsSyncResult {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [isOnline, setIsOnline] = useState(syncManager.getIsOnline())
  const [error, setError] = useState<string>()
  const [lastSyncTime, setLastSyncTime] = useState<number>()
  const [pendingChanges, setPendingChanges] = useState(0)
  const [failedChanges, setFailedChanges] = useState(0)

  const { token, enabled = true } = options

  const refetch = useCallback(async () => {
    if (!enabled || !newHireId) return

    try {
      setStatus('syncing')
      setError(undefined)

      if (isOnline && token) {
        const analytics = await apiClient.getAnalytics(token, newHireId)
        await db.saveAnalytics(newHireId, analytics)
        setData(analytics)
        setLastSyncTime(Date.now())
        setStatus('synced')
      } else {
        const cached = await db.getAnalytics(newHireId)
        setData(cached)
        setStatus('offline')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(errorMsg)
      setStatus('error')

      try {
        const cached = await db.getAnalytics(newHireId)
        setData(cached)
      } catch {
        // Ignore cache error
      }
    }
  }, [enabled, newHireId, token, isOnline])

  useEffect(() => {
    if (!enabled || !newHireId) return
    refetch()
  }, [enabled, newHireId, refetch])

  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online)
      if (online) {
        refetch()
      }
    }

    syncManager.addNetworkListener(handleNetworkChange)
    return () => syncManager.removeNetworkListener(handleNetworkChange)
  }, [refetch])

  useEffect(() => {
    const updateSyncStatus = async () => {
      const syncStatus = await syncQueue.getSyncStatus()
      setPendingChanges(syncStatus.pendingCount)
      setFailedChanges(syncStatus.failedCount)
    }

    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    data,
    status,
    isOnline,
    error,
    lastSyncTime,
    pendingChanges,
    failedChanges,
    refetch,
  }
}

/**
 * Hook for managing evaluation data with sync support
 */
export function useEvaluationSync(
  newHireId: string,
  options: UseSyncOptions
): UseEvaluationSyncResult {
  const [data, setData] = useState<any>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [isOnline, setIsOnline] = useState(syncManager.getIsOnline())
  const [error, setError] = useState<string>()
  const [lastSyncTime, setLastSyncTime] = useState<number>()
  const [pendingChanges, setPendingChanges] = useState(0)
  const [failedChanges, setFailedChanges] = useState(0)

  const { token, enabled = true } = options

  const refetch = useCallback(async () => {
    if (!enabled || !newHireId) return

    try {
      setStatus('syncing')
      setError(undefined)

      if (isOnline && token) {
        const evaluation = await apiClient.getEvaluations(token, newHireId)
        await db.saveEvaluation(newHireId, evaluation)
        setData(evaluation)
        setLastSyncTime(Date.now())
        setStatus('synced')
      } else {
        const cached = await db.getEvaluation(newHireId)
        setData(cached)
        setStatus('offline')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch evaluations'
      setError(errorMsg)
      setStatus('error')

      try {
        const cached = await db.getEvaluation(newHireId)
        setData(cached)
      } catch {
        // Ignore cache error
      }
    }
  }, [enabled, newHireId, token, isOnline])

  const saveSkillRatings = useCallback(
    async (ratings: any[]) => {
      if (!token) return

      try {
        if (isOnline) {
          // Save immediately if online
          await apiClient.saveSkillRatings(token, newHireId, ratings)
          syncManager.notifySync()
        } else {
          // Queue for later if offline
          for (const rating of ratings) {
            await syncQueue.queueSkillRating(
              newHireId,
              rating.skillId,
              rating.rating,
              rating.notes || ''
            )
          }
        }
      } catch (err) {
        console.error('Failed to save skill ratings:', err)
        // Queue for retry
        for (const rating of ratings) {
          await syncQueue.queueSkillRating(
            newHireId,
            rating.skillId,
            rating.rating,
            rating.notes || ''
          )
        }
      }
    },
    [token, newHireId, isOnline]
  )

  const markLeadershipComplete = useCallback(
    async (moduleId: string, notes?: string) => {
      if (!token) return

      try {
        if (isOnline) {
          await apiClient.markLeadershipComplete(token, newHireId, moduleId, notes)
          syncManager.notifySync()
        } else {
          await syncQueue.queueLeadershipComplete(newHireId, moduleId, notes || '')
        }
      } catch (err) {
        console.error('Failed to mark leadership complete:', err)
        // Queue for retry
        await syncQueue.queueLeadershipComplete(newHireId, moduleId, notes || '')
      }
    },
    [token, newHireId, isOnline]
  )

  useEffect(() => {
    if (!enabled || !newHireId) return
    refetch()
  }, [enabled, newHireId, refetch])

  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online)
      if (online && token) {
        refetch()
        // Try to sync any pending changes
        syncQueue.processSyncQueue(token)
      }
    }

    syncManager.addNetworkListener(handleNetworkChange)
    return () => syncManager.removeNetworkListener(handleNetworkChange)
  }, [refetch, token])

  useEffect(() => {
    const updateSyncStatus = async () => {
      const syncStatus = await syncQueue.getSyncStatus()
      setPendingChanges(syncStatus.pendingCount)
      setFailedChanges(syncStatus.failedCount)
    }

    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    data,
    status,
    isOnline,
    error,
    lastSyncTime,
    pendingChanges,
    failedChanges,
    refetch,
    saveSkillRatings,
    markLeadershipComplete,
  }
}

/**
 * Trigger sync queue processing when coming back online
 */
export function useSyncOnReconnect(token: string | null) {
  useEffect(() => {
    if (!token) return

    const handleReconnect = async (isOnline: boolean) => {
      if (isOnline) {
        try {
          await syncQueue.processSyncQueue(token)
          syncManager.notifySync()
        } catch (err) {
          console.error('Failed to process sync queue:', err)
        }
      }
    }

    syncManager.addNetworkListener(handleReconnect)
    return () => syncManager.removeNetworkListener(handleReconnect)
  }, [token])
}
