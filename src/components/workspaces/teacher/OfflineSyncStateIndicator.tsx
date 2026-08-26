/**
 * Yapendik School OS — Stage 4.1 Offline Sync State Indicator (CC-13)
 * Real-time indicator of network status and pending local command queue count
 */

import React, { useState, useEffect } from 'react';
import { offlineSyncQueueService } from '../../../services';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineSyncStateIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(offlineSyncQueueService.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    const unsubscribe = offlineSyncQueueService.subscribe(() => {
      setPendingCount(offlineSyncQueueService.getPendingCount());
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    if (pendingCount === 0 || isSyncing) return;
    setIsSyncing(true);
    try {
      await offlineSyncQueueService.autoDrainQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        pendingCount > 0 ? (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{pendingCount} Tertunda (Sinkronkan)</span>
          </button>
        ) : (
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
            <Wifi className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Online Terhubung</span>
          </span>
        )
      ) : (
        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 border border-rose-300 text-rose-800 flex items-center gap-1.5 animate-pulse shadow-xs">
          <WifiOff className="w-3.5 h-3.5 text-rose-700" />
          <span>Offline ({pendingCount} Antrian)</span>
        </span>
      )}
    </div>
  );
};
