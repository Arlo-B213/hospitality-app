/**
 * Service Worker Registration Logic
 * Handles registration, updates, and lifecycle events
 */

let registration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;
let updateListeners: Array<() => void> = [];

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported in this browser');
    return null;
  }

  try {
    console.log('[SW] Registering Service Worker...');

    registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered:', registration);

    // Monitor for updates
    registration.onupdatefound = () => {
      const newWorker = registration!.installing;

      if (newWorker) {
        console.log('[SW] Update found, new worker installing...');

        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is ready and old one is still controlling
            console.log('[SW] New version available');
            updateAvailable = true;
            notifyUpdateListeners();
          }
        };
      }
    };

    // Handle controller change (new SW took over)
    navigator.serviceWorker.oncontrollerchange = () => {
      console.log('[SW] New Service Worker activated');
      window.location.reload();
    };

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Check if an update is available
 */
export function isUpdateAvailable(): boolean {
  return updateAvailable;
}

/**
 * Install the waiting service worker (triggers controllerchange)
 */
export function installUpdate(): void {
  if (!registration?.waiting) {
    console.log('[SW] No waiting worker to install');
    return;
  }

  console.log('[SW] Installing waiting worker...');
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Subscribe to update available events
 */
export function onUpdateAvailable(callback: () => void): () => void {
  updateListeners.push(callback);

  // Return unsubscribe function
  return () => {
    updateListeners = updateListeners.filter((listener) => listener !== callback);
  };
}

/**
 * Notify all listeners about available update
 */
function notifyUpdateListeners(): void {
  updateListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('[SW] Error in update listener:', error);
    }
  });
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!registration) {
    return false;
  }

  try {
    const success = await registration.unregister();
    if (success) {
      console.log('[SW] Service Worker unregistered');
      registration = null;
      updateAvailable = false;
    }
    return success;
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
    return false;
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<void> {
  if (!registration) {
    console.log('[SW] No active registration to check for updates');
    return;
  }

  try {
    console.log('[SW] Checking for updates...');
    await registration.update();
  } catch (error) {
    console.error('[SW] Update check failed:', error);
  }
}

/**
 * Get the current service worker registration
 */
export function getRegistration(): ServiceWorkerRegistration | null {
  return registration;
}
