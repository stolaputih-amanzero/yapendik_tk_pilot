/**
 * Amanaura OS × FLOW — Living Shell Connection Status Hook
 * Architectural Specification: ADR-UX-011 §5.1 (Doktrin D-10)
 * 
 * 4 Canonical Connection States:
 * 1. ONLINE: Connected, 0 pending mutations (4s pulse, Gold accent-valor).
 * 2. OFFLINE_IDLE: Offline, 0 pending mutations (8s slow pulse, soft gray-gold).
 * 3. OFFLINE_QUEUED: Offline, >0 pending mutations (8s slow pulse + Status Dot Capsule).
 * 4. RECONCILING: Just reconnected / background sync in progress (Glint pulse, then ONLINE).
 */

import { useState, useEffect, useCallback } from 'react';

export type ConnectionState = 'ONLINE' | 'OFFLINE_IDLE' | 'OFFLINE_QUEUED' | 'RECONCILING';

export interface ConnectionStatusResult {
  state: ConnectionState;
  isOnline: boolean;
  queuedMutations: number;
  lastSyncAt: Date | null;
  triggerReconciliation: () => Promise<void>;
  setQueuedMutations: (count: number) => void;
}

export function useConnectionStatus(): ConnectionStatusResult {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [queuedMutations, setQueuedMutations] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('amanaura_queued_mutations');
      return stored ? parseInt(stored, 10) || 0 : 0;
    }
    return 0;
  });

  const [isReconciling, setIsReconciling] = useState<boolean>(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(() => new Date());

  const triggerReconciliation = useCallback(async () => {
    setIsReconciling(true);
    // Simulate / execute background sync reconciliation
    await new Promise((resolve) => setTimeout(resolve, 800));
    setQueuedMutations(0);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('amanaura_queued_mutations');
    }
    setLastSyncAt(new Date());
    setIsReconciling(false);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (queuedMutations > 0) {
        triggerReconciliation();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconciling(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [queuedMutations, triggerReconciliation]);

  // Determine current canonical 4-state
  let state: ConnectionState = 'ONLINE';
  if (isReconciling) {
    state = 'RECONCILING';
  } else if (!isOnline) {
    state = queuedMutations > 0 ? 'OFFLINE_QUEUED' : 'OFFLINE_IDLE';
  } else {
    state = 'ONLINE';
  }

  return {
    state,
    isOnline,
    queuedMutations,
    lastSyncAt,
    triggerReconciliation,
    setQueuedMutations
  };
}

export interface BreathStateMetadata {
  state: ConnectionState;
  ariaLabel: string;
  title: string;
  colorClass: string;
  animationClass: string;
  showCapsule: boolean;
  capsuleText?: string;
}

export function getBreathStateMeta(state: ConnectionState, queuedCount: number = 0): BreathStateMetadata {
  switch (state) {
    case 'ONLINE':
      return {
        state: 'ONLINE',
        ariaLabel: 'Status: Terhubung ke Cloud',
        title: 'Status: Terhubung ke Cloud (Denyut Sirkadian Normal)',
        colorClass: 'text-accent-valor',
        animationClass: 'animate-amanaura-breath',
        showCapsule: false
      };
    case 'OFFLINE_IDLE':
      return {
        state: 'OFFLINE_IDLE',
        ariaLabel: 'Status: Mode Offline — Data Aman di Perangkat',
        title: 'Status: Mode Offline — Data Aman di Perangkat (Menahan Napas)',
        colorClass: 'text-ink-faint',
        animationClass: 'animate-amanaura-breath-slow',
        showCapsule: false
      };
    case 'OFFLINE_QUEUED':
      return {
        state: 'OFFLINE_QUEUED',
        ariaLabel: `Status: Mode Offline — ${queuedCount} Perubahan Menunggu Sinkronisasi`,
        title: `Status: Mode Offline — ${queuedCount} Perubahan Menunggu Sinkronisasi`,
        colorClass: 'text-ink-faint',
        animationClass: 'animate-amanaura-breath-slow',
        showCapsule: true,
        capsuleText: `● ${queuedCount} Belum Sinkron`
      };
    case 'RECONCILING':
      return {
        state: 'RECONCILING',
        ariaLabel: 'Status: Menyelaraskan Data ke Cloud...',
        title: 'Status: Menyelaraskan Data ke Cloud (Rekonsiliasi Otomatis)',
        colorClass: 'text-accent-valor',
        animationClass: 'animate-pulse',
        showCapsule: true,
        capsuleText: '✦ Menyinkronkan...'
      };
  }
}
