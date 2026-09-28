/**
 * Sync Queue - Manages offline changes, retry logic, and conflict resolution
 * Stores changes offline and syncs them when the app comes back online
 */

import { db, SyncQueueItem } from './db'
import { apiClient } from './api'

const MAX_RETRIES = 3

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: Array<{
    itemId: string
    error: string
  }>
}

class SyncQueueService {
  private isProcessing = false

  /**
   * Add a skill rating change to the queue (for offline sync)
   */
  async queueSkillRating(
    newHireId: string,
    skillId: string,
    rating: number,
    notes: string
  ): Promise<void> {
    await db.addToSyncQueue({
      type: 'skill_rating',
      newHireId,
      data: { skillId, rating, notes, newHireId },
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
      status: 'pending',
    })
  }

  /**
   * Add a leadership module completion to the queue (for offline sync)
   */
  async queueLeadershipComplete(
    newHireId: string,
    moduleId: string,
    notes: string
  ): Promise<void> {
    await db.addToSyncQueue({
      type: 'leadership_complete',
      newHireId,
      data: { moduleId, notes, newHireId },
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
      status: 'pending',
    })
  }

  /**
   * Add a password change to the queue (for offline sync)
   */
  async queuePasswordChange(oldPassword: string, newPassword: string): Promise<void> {
    await db.addToSyncQueue({
      type: 'password_change',
      data: { oldPassword, newPassword },
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
      status: 'pending',
    })
  }

  /**
   * Process all items in the sync queue
   * Called when app comes back online
   */
  async processSyncQueue(token: string): Promise<SyncResult> {
    if (this.isProcessing) {
      return { success: false, synced: 0, failed: 0, errors: [] }
    }

    this.isProcessing = true

    try {
      const items = await db.getSyncQueue()
      const pendingItems = items.filter((item) => item.status === 'pending')

      let synced = 0
      let failed = 0
      const errors: Array<{ itemId: string; error: string }> = []

      for (const item of pendingItems) {
        try {
          const success = await this.syncItem(item, token)

          if (success) {
            // Item synced successfully
            await db.removeSyncQueueItem(item.id!)
            synced++
          } else {
            // Item failed, update retry count
            if (item.retries < item.maxRetries) {
              // Retry later
              await db.updateSyncQueueItem(item.id!, {
                retries: item.retries + 1,
                status: 'pending',
                lastError: 'Failed to sync, will retry',
              })
              failed++
            } else {
              // Max retries exceeded, mark as failed
              await db.updateSyncQueueItem(item.id!, {
                status: 'failed',
                lastError: 'Max retries exceeded',
              })
              errors.push({
                itemId: item.id!,
                error: 'Max retries exceeded',
              })
              failed++
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          if (item.retries < item.maxRetries) {
            await db.updateSyncQueueItem(item.id!, {
              retries: item.retries + 1,
              status: 'pending',
              lastError: errorMessage,
            })
          } else {
            await db.updateSyncQueueItem(item.id!, {
              status: 'failed',
              lastError: errorMessage,
            })
            errors.push({
              itemId: item.id!,
              error: errorMessage,
            })
          }

          failed++
        }
      }

      return {
        success: failed === 0,
        synced,
        failed,
        errors,
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Sync a single queue item to the backend
   */
  private async syncItem(item: SyncQueueItem, token: string): Promise<boolean> {
    try {
      switch (item.type) {
        case 'skill_rating': {
          const { skillId, rating, notes, newHireId } = item.data
          await apiClient.saveSkillRatings(token, newHireId, [
            { skillId, rating, notes },
          ])
          return true
        }

        case 'leadership_complete': {
          const { moduleId, notes, newHireId } = item.data
          await apiClient.markLeadershipComplete(token, newHireId, moduleId, notes)
          return true
        }

        case 'password_change': {
          const { oldPassword, newPassword } = item.data
          await apiClient.changePassword(token, oldPassword, newPassword)
          return true
        }

        default:
          return false
      }
    } catch (error) {
      console.error(`Failed to sync ${item.type}:`, error)
      return false
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<{
    pendingCount: number
    failedCount: number
    totalCount: number
  }> {
    const items = await db.getSyncQueue()
    const pendingCount = items.filter((item) => item.status === 'pending').length
    const failedCount = items.filter((item) => item.status === 'failed').length

    return {
      pendingCount,
      failedCount,
      totalCount: items.length,
    }
  }

  /**
   * Clear failed items from the queue
   */
  async clearFailedItems(): Promise<void> {
    const items = await db.getSyncQueue()
    const failedItems = items.filter((item) => item.status === 'failed')

    for (const item of failedItems) {
      await db.removeSyncQueueItem(item.id!)
    }
  }
}

export const syncQueue = new SyncQueueService()
