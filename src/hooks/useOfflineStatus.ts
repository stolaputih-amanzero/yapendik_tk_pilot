import { useState, useEffect } from 'react';

export interface OfflineStatus {
  isOnline: boolean;
  pendingMutations: number;
  lastSyncAt: string | null;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Placeholder for IndexedDB queue length — implementasi penuh
  // di Sprint PWA berikutnya. Saat ini selalu 0.
  const pendingMutations = 0;
  const lastSyncAt = null;

  return { isOnline, pendingMutations, lastSyncAt };
}
