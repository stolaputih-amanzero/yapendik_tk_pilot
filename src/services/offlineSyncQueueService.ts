/**
 * Yapendik School OS — Stage 4.1 Offline Sync Queue Service
 * Provides client-side UUID v4 generation, offline command queuing,
 * and deterministic replay upon network reconnection.
 */

import { OfflineQueueItem } from '../types/teacherDailyTypes';

const QUEUE_STORAGE_KEY = 'yapendik_teacher_offline_queue_v1';

class OfflineSyncQueueService {
  private queue: OfflineQueueItem[] = [];
  private listeners: Array<(queue: OfflineQueueItem[]) => void> = [];
  private isReplaying = false;

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.autoDrainQueue();
      });
    }
  }

  /**
   * Generates a deterministic client-side UUID v4
   * Invariant Offline-01: Every offline capture uses a client-generated UUID
   */
  public generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Standard RFC4122 compliant fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (raw) {
          this.queue = JSON.parse(raw);
        }
      }
    } catch (e) {
      console.warn('Could not load offline queue from storage:', e);
      this.queue = [];
    }
  }

  private persistToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      }
    } catch (e) {
      console.warn('Could not persist offline queue to storage:', e);
    }
    this.notify();
  }

  public subscribe(listener: (queue: OfflineQueueItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const snapshot = [...this.queue];
    this.listeners.forEach(l => {
      try {
        l(snapshot);
      } catch (e) {
        console.error('Offline queue listener error:', e);
      }
    });
  }

  public getPendingCount(): number {
    return this.queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED').length;
  }

  public getQueue(): OfflineQueueItem[] {
    return [...this.queue];
  }

  public enqueue(
    command_type: OfflineQueueItem['command_type'],
    payload: OfflineQueueItem['payload']
  ): OfflineQueueItem {
    const item: OfflineQueueItem = {
      queue_id: `q_${this.generateUUID()}`,
      command_type,
      payload,
      created_at: new Date().toISOString(),
      retry_count: 0,
      status: 'PENDING'
    };

    this.queue.push(item);
    this.persistToStorage();
    return item;
  }

  public updateStatus(queue_id: string, status: OfflineQueueItem['status'], error_message?: string) {
    const item = this.queue.find(q => q.queue_id === queue_id);
    if (item) {
      item.status = status;
      if (error_message) item.error_message = error_message;
      if (status === 'FAILED') item.retry_count += 1;
      this.persistToStorage();
    }
  }

  public remove(queue_id: string) {
    this.queue = this.queue.filter(q => q.queue_id !== queue_id);
    this.persistToStorage();
  }

  public clear() {
    this.queue = [];
    this.persistToStorage();
  }

  /**
   * Drain queue using provided execution handler
   */
  public async autoDrainQueue(
    executor?: (item: OfflineQueueItem) => Promise<boolean>
  ): Promise<{ processed: number; failed: number }> {
    if (this.isReplaying || this.queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    this.isReplaying = true;
    let processed = 0;
    let failed = 0;

    try {
      const pendingItems = this.queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');

      for (const item of pendingItems) {
        if (executor) {
          this.updateStatus(item.queue_id, 'SYNCING');
          try {
            const success = await executor(item);
            if (success) {
              this.remove(item.queue_id);
              processed++;
            } else {
              this.updateStatus(item.queue_id, 'FAILED', 'Execution returned false');
              failed++;
            }
          } catch (err: any) {
            this.updateStatus(item.queue_id, 'FAILED', err?.message || 'Replay error');
            failed++;
          }
        }
      }
    } finally {
      this.isReplaying = false;
    }

    return { processed, failed };
  }
}

export const offlineSyncQueueService = new OfflineSyncQueueService();
