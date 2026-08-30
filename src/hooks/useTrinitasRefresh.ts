/**
 * Amanaura OS × FLOW — Trinitas Refresh Orchestration Hook
 * Architectural Specification: ADR-UX-011 §5.2 (Doktrin D-11)
 * 
 * 3 Organic Inherent Refresh Pathways:
 * 1. Event-Driven: Online transition, tab visibility change (Silent Ghost Recovery).
 * 2. Soft Interval: Periodic polling (90-120s) ONLY active in OPERASIONAL mode when tab is visible.
 *    Paused in mode PENUTUP (Right to Rest D-8).
 * 3. User-Initiated: Pull-to-refresh (Mobile) and ghost refresh button (Desktop).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BriefingMode } from '../types/briefingTypes';

export interface TrinitasRefreshOptions {
  briefingMode?: BriefingMode;
  intervalMs?: number; // default: 100000ms (100 seconds)
  onRefresh?: () => Promise<void> | void;
}

export interface TrinitasRefreshResult {
  lastRefreshedAt: Date;
  isRefreshing: boolean;
  triggerManualRefresh: () => Promise<void>;
  formattedLastRefreshed: string;
}

export function useTrinitasRefresh(options: TrinitasRefreshOptions = {}): TrinitasRefreshResult {
  const {
    briefingMode = 'OPERASIONAL',
    intervalMs = 100000,
    onRefresh
  } = options;

  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const executeRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefreshRef.current) {
        await onRefreshRef.current();
      }
      // Natural soft delay for calm visual feedback
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn('[Trinitas Refresh] Error executing refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Pathway 1: Event-Driven Refresh (online & visibilitychange)
  useEffect(() => {
    const handleOnline = () => {
      executeRefresh();
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        // Silent Ghost Recovery when returning to tab
        executeRefresh();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [executeRefresh]);

  // Pathway 2: Soft Interval Refresh (Active ONLY when tab is visible and mode is OPERASIONAL / PRATINJAU)
  useEffect(() => {
    // In PENUTUP mode, respect Right to Rest (D-8) and do NOT poll in background
    if (briefingMode === 'PENUTUP') {
      return;
    }

    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        executeRefresh();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [briefingMode, intervalMs, executeRefresh]);

  // Format time hh:mm
  const formattedLastRefreshed = lastRefreshedAt.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    lastRefreshedAt,
    isRefreshing,
    triggerManualRefresh: executeRefresh,
    formattedLastRefreshed
  };
}
