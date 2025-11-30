/**
 * Service Worker Registration Script
 * This script runs in the main thread to register the Service Worker
 * and provides robust logging for success and failure (including the 404 case).
 * * Place this file's content in a <script> tag or load it as a separate file
 * *after* your main scripts but *before* the end of the <body>.
 */

window.addEventListener('load', () => {
    // Check if the browser supports Service Workers
    if ('serviceWorker' in navigator) {
        // Attempt to register the Service Worker located at the root
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                // Registration successful! This logs the successful path, replacing the 404 message.
                console.log('🚀 SW registration successful, scope:', registration.scope);
                
                // Optional: Listen for the service worker being updated
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New content available, but need to wait for worker to activate
                                    console.log('SW: New content is available and waiting to activate.');
                                } else {
                                    // Content is cached, and the app is ready for offline use
                                    console.log('SW: Content is now available offline.');
                                }
                            }
                        };
                    }
                };

            })
            .catch((error) => {
                // This will now capture the TypeErrors (like the original 404) 
                // and log them more gracefully, giving developers context.
                console.error('❌ SW registration failed:', error.message);
                
                // Note: The TypeError (404) occurs because the browser considers 
                // a bad HTTP response (like 404) a failure to fetch the script.
            });
    } else {
        console.warn('Browser does not support Service Workers. Offline features disabled.');
    }
});