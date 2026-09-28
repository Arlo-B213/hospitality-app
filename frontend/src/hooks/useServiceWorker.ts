/**
 * useServiceWorker Hook
 * Provides service worker management and update handling
 */

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  onUpdateAvailable,
  installUpdate,
  isUpdateAvailable,
  checkForUpdates,
} from '../service-worker-register';

export interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  installUpdate: () => void;
  checkForUpdates: () => Promise<void>;
}

/**
 * Hook to manage service worker lifecycle
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [isSupported] = useState(() => 'serviceWorker' in navigator);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const register = async () => {
      const registration = await registerServiceWorker();
      setIsRegistered(!!registration);
      setUpdateAvailable(isUpdateAvailable());
    };

    register();
  }, [isSupported]);

  // Listen for update available events
  useEffect(() => {
    const unsubscribe = onUpdateAvailable(() => {
      console.log('Update available');
      setUpdateAvailable(true);
    });

    return unsubscribe;
  }, []);

  // Listen for online/offline events
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

  // Handle install update
  const handleInstallUpdate = useCallback(() => {
    if (updateAvailable) {
      installUpdate();
    }
  }, [updateAvailable]);

  // Handle check for updates
  const handleCheckForUpdates = useCallback(async () => {
    await checkForUpdates();
  }, []);

  return {
    isSupported,
    isRegistered,
    isOnline,
    updateAvailable,
    installUpdate: handleInstallUpdate,
    checkForUpdates: handleCheckForUpdates,
  };
}
