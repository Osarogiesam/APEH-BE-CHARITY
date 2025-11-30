/**
 * Service Worker (sw.js)
 * * Implements a basic "Cache-First, falling back to Network" strategy for static assets.
 * This file handles all network requests and caching on the client side.
 */

// 1. Define Cache Name and Assets
const CACHE_NAME = 'apeh-be-charity-v1';

// List of files to be cached upon installation (pre-caching)
// Make sure to include all critical files like the main HTML, CSS, and JS.
const urlsToCache = [
    '/', // Root index file
    'index.html',
    // Assuming your main script is loaded from the root
    'script.js', 
    // Add any critical CSS and vendor files here
    '/style.css', 
    '/vendor-C31BE1_7.js',
    '/payments.js',
    // Add fallback placeholder images or icons if needed
];


// =========================================================
// 2. INSTALLATION: Caching Static Assets
// =========================================================
self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    
    console.log('[Service Worker] Install Event: Pre-caching static assets.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Opened cache and adding files...');
                return cache.addAll(urlsToCache)
                    .then(() => {
                        console.log('[Service Worker] All required assets cached successfully.');
                    })
                    .catch(error => {
                        console.error('[Service Worker] Failed to cache critical assets:', error);
                    });
            })
    );
});


// =========================================================
// 3. ACTIVATION: Cleaning up old caches
// =========================================================
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event: Cleaning up old caches.');
    
    // Claim control of all pages so that new fetches are intercepted
    event.waitUntil(self.clients.claim());

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete any caches that don't match the current CACHE_NAME
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


// =========================================================
// 4. FETCH: Intercepting Network Requests
// =========================================================
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Skip cross-origin requests, including third-party APIs
    if (requestUrl.origin !== location.origin) {
        return;
    }

    // Cache-First Strategy for Static Assets (e.g., CSS, JS, Fonts, Images)
    // This is fast and serves cached content immediately if available.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If asset is found in cache, return it
                if (response) {
                    return response;
                }

                // If not found in cache, fetch from the network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We consume it once to 
                        // put it in the cache and once to return to the browser.
                        const responseToCache = networkResponse.clone();

                        // Open the cache and store the new response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Only cache GET requests
                                if (event.request.method === 'GET') {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return networkResponse;
                    })
                    .catch(error => {
                        // This catch handles network errors (e.g., being offline)
                        console.error('[Service Worker] Fetch failed:', error);
                        // Optional: Return a specific offline page if needed
                        // return caches.match('/offline.html'); 
                    });
            })
    );
});