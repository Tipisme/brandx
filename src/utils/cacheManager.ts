/**
 * Cache and Version Manager for Brandix
 * Ensures clients always run the latest build and provides manual cache-busting
 */

export const APP_VERSION = '2026.09.07.v2';

export function initCacheManager() {
  try {
    const savedVersion = localStorage.getItem('brandix_app_version');
    if (savedVersion && savedVersion !== APP_VERSION) {
      console.log(`[CacheManager] New version detected: ${APP_VERSION} (was ${savedVersion}). Refreshing cache...`);
      // Clear specific caches while keeping auth credentials if valid
      const user = localStorage.getItem('brandhub_user');
      const token = localStorage.getItem('brandhub_token');
      
      // Clear sessionStorage
      sessionStorage.clear();

      // Clean browser caches if service worker/Cache API was used
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }

      // Restore credentials
      if (user) localStorage.setItem('brandhub_user', user);
      if (token) localStorage.setItem('brandhub_token', token);
    }
    localStorage.setItem('brandix_app_version', APP_VERSION);
  } catch (err) {
    console.warn('[CacheManager] Error initializing cache manager:', err);
  }
}

/**
 * Force clear all client caches and hard-reload the page
 */
export async function forceClearCacheAndReload() {
  try {
    // 1. Clear caches storage API if present
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // 2. Clear session storage
    sessionStorage.clear();

    // 3. Clear application temporary data
    localStorage.removeItem('brandix_app_version');

    // 4. Force browser reload with cache-busting query parameter
    const cleanUrl = window.location.origin + window.location.pathname;
    const currentHash = window.location.hash || '#/';
    const timestamp = Date.now();
    window.location.href = `${cleanUrl}?_nocache=${timestamp}${currentHash}`;
    window.location.reload();
  } catch (e) {
    console.error('[CacheManager] Force reload error:', e);
    window.location.reload();
  }
}
