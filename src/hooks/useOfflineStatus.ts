/**
 * Amanaura OS × FLOW — Offline Status Hook (Re-exported wrapper)
 */

import { useConnectionStatus } from './useConnectionStatus';

export interface OfflineStatus {
  isOnline: boolean;
  pendingMutations: number;
  lastSyncAt: string | null;
}

export function useOfflineStatus(): OfflineStatus {
  const { isOnline, queuedMutations, lastSyncAt } = useConnectionStatus();

  return {
    isOnline,
    pendingMutations: queuedMutations,
    lastSyncAt: lastSyncAt ? lastSyncAt.toISOString() : null
  };
}
