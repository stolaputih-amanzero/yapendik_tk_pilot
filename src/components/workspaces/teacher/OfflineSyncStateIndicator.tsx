import React, { useState, useEffect } from 'react';
import { offlineSyncQueueService } from '../../../services';
import { useOfflineStatus } from '../../../hooks/useOfflineStatus';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const OfflineSyncStateIndicator: React.FC = () => {
  const { isOnline } = useOfflineStatus();
  const [pendingCount, setPendingCount] = useState(offlineSyncQueueService.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncQueueService.subscribe(() => {
      setPendingCount(offlineSyncQueueService.getPendingCount());
    });

    return () => {
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
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-2 py-1 rounded-pill text-[11px] font-bold bg-warning-tint border border-warning-line text-warning-deep hover-only:bg-warning-tint/80 transition flex items-center gap-2 cursor-pointer shadow-hairline"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="font-mono whitespace-nowrap">{pendingCount} Tertunda</span>
          </button>
        ) : (
          <span className="px-2 py-1 rounded-pill text-[11px] font-bold bg-success-tint text-success-deep border border-success-line flex items-center gap-1 shadow-hairline">
            <Wifi className="w-4 h-4 text-success-deep" />
            <span className="hidden medium:inline">Terhubung</span>
          </span>
        )
      ) : (
        <span className="px-2 py-1 rounded-pill text-[11px] font-bold bg-danger-tint border border-danger-line text-danger-deep flex items-center gap-2 animate-pulse shadow-hairline">
          <WifiOff className="w-4 h-4 text-danger-deep" />
          <span className="font-mono whitespace-nowrap">Offline ({pendingCount} Antrian)</span>
        </span>
      )}
    </div>
  );
};
