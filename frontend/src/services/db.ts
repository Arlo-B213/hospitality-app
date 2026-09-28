/**
 * IndexedDB Cache - Stores new hire, evaluations, and analytics data locally
 * Enables offline access and caching layer
 */

import { NewHire, AnalyticsResponse } from '../types/index'

const DB_NAME = 'PRIDE_Training_DB'
const DB_VERSION = 1

export interface CacheEntry<T> {
  key: string
  data: T
  timestamp: number
  ttl?: number // Time to live in milliseconds
}

export interface SyncQueueItem {
  id: string
  type: 'skill_rating' | 'leadership_complete' | 'password_change'
  newHireId?: string
  data: any
  timestamp: number
  retries: number
  maxRetries: number
  lastError?: string
  status: 'pending' | 'failed' | 'synced'
}

class IndexedDBService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * Initialize IndexedDB connection and create stores if needed
   */
  async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('new_hires')) {
          db.createObjectStore('new_hires', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('evaluations')) {
          db.createObjectStore('evaluations', { keyPath: 'newHireId' })
        }
        if (!db.objectStoreNames.contains('analytics')) {
          db.createObjectStore('analytics', { keyPath: 'newHireId' })
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('cache_meta')) {
          db.createObjectStore('cache_meta', { keyPath: 'key' })
        }
      }
    })

    return this.initPromise
  }

  /**
   * Check if data is expired based on TTL
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    if (!entry.ttl) return false
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Save new hires list to cache
   */
  async saveNewHires(hires: NewHire[], ttl = 5 * 60 * 1000): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['new_hires', 'cache_meta'], 'readwrite')

      // Save individual hires
      const store = transaction.objectStore('new_hires')
      hires.forEach((hire) => {
        store.put(hire)
      })

      // Save metadata
      const metaStore = transaction.objectStore('cache_meta')
      metaStore.put({
        key: 'new_hires_list',
        timestamp: Date.now(),
        ttl,
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Get cached new hires
   */
  async getNewHires(): Promise<NewHire[]> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['new_hires', 'cache_meta'], 'readonly')
      const metaStore = transaction.objectStore('cache_meta')
      const metaRequest = metaStore.get('new_hires_list')

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result

        // Check if cache is expired
        if (meta && this.isExpired(meta)) {
          resolve([])
          return
        }

        // Get all new hires
        const store = transaction.objectStore('new_hires')
        const hireRequest = store.getAll()

        hireRequest.onsuccess = () => {
          resolve(hireRequest.result)
        }

        hireRequest.onerror = () => reject(hireRequest.error)
      }

      metaRequest.onerror = () => reject(metaRequest.error)
    })
  }

  /**
   * Save evaluation data to cache
   */
  async saveEvaluation(newHireId: string, evaluation: any, ttl = 10 * 60 * 1000): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['evaluations', 'cache_meta'], 'readwrite')

      const store = transaction.objectStore('evaluations')
      store.put({ newHireId, data: evaluation, timestamp: Date.now() })

      const metaStore = transaction.objectStore('cache_meta')
      metaStore.put({
        key: `evaluation_${newHireId}`,
        timestamp: Date.now(),
        ttl,
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Get cached evaluation data
   */
  async getEvaluation(newHireId: string): Promise<any | null> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['evaluations', 'cache_meta'], 'readonly')
      const metaStore = transaction.objectStore('cache_meta')
      const metaRequest = metaStore.get(`evaluation_${newHireId}`)

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result

        // Check if cache is expired
        if (!meta || this.isExpired(meta)) {
          resolve(null)
          return
        }

        // Get evaluation
        const store = transaction.objectStore('evaluations')
        const evalRequest = store.get(newHireId)

        evalRequest.onsuccess = () => {
          resolve(evalRequest.result?.data || null)
        }

        evalRequest.onerror = () => reject(evalRequest.error)
      }

      metaRequest.onerror = () => reject(metaRequest.error)
    })
  }

  /**
   * Save analytics data to cache
   */
  async saveAnalytics(
    newHireId: string,
    analytics: AnalyticsResponse,
    ttl = 5 * 60 * 1000
  ): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics', 'cache_meta'], 'readwrite')

      const store = transaction.objectStore('analytics')
      store.put({ newHireId, data: analytics, timestamp: Date.now() })

      const metaStore = transaction.objectStore('cache_meta')
      metaStore.put({
        key: `analytics_${newHireId}`,
        timestamp: Date.now(),
        ttl,
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  /**
   * Get cached analytics data
   */
  async getAnalytics(newHireId: string): Promise<AnalyticsResponse | null> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics', 'cache_meta'], 'readonly')
      const metaStore = transaction.objectStore('cache_meta')
      const metaRequest = metaStore.get(`analytics_${newHireId}`)

      metaRequest.onsuccess = () => {
        const meta = metaRequest.result

        // Check if cache is expired
        if (!meta || this.isExpired(meta)) {
          resolve(null)
          return
        }

        // Get analytics
        const store = transaction.objectStore('analytics')
        const analyticsRequest = store.get(newHireId)

        analyticsRequest.onsuccess = () => {
          resolve(analyticsRequest.result?.data || null)
        }

        analyticsRequest.onerror = () => reject(analyticsRequest.error)
      }

      metaRequest.onerror = () => reject(metaRequest.error)
    })
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<string> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      const request = store.add(item)

      request.onsuccess = () => {
        resolve(String(request.result))
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all sync queue items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly')
      const store = transaction.objectStore('sync_queue')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Update sync queue item status
   */
  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          const updated = { ...item, ...updates }
          const updateRequest = store.put(updated)

          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  /**
   * Remove item from sync queue (after successful sync)
   */
  async removeSyncQueueItem(id: string): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite')
      const store = transaction.objectStore('sync_queue')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all caches (useful for logout)
   */
  async clearAllCaches(): Promise<void> {
    await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['new_hires', 'evaluations', 'analytics', 'sync_queue', 'cache_meta'],
        'readwrite'
      )

      const stores = ['new_hires', 'evaluations', 'analytics', 'sync_queue', 'cache_meta']
      stores.forEach((storeName) => {
        transaction.objectStore(storeName).clear()
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export const db = new IndexedDBService()
