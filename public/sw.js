// Service Worker for دوائي App - PWA + Offline Support + Push Notifications
const CACHE_NAME = 'duaiii-v2'
const STATIC_CACHE = 'duaiii-static-v2'
const API_CACHE = 'duaiii-api-v2'

// URLs to cache on install (static assets + app shell)
const URLS_TO_CACHE = [
  '/',
  '/home',
  '/auth/login',
  '/images/logo.png',
  '/icon.svg',
  '/manifest.json',
]

// Install event - cache important files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...')
        return cache.addAll(URLS_TO_CACHE).catch((err) => {
          console.warn('⚠️ Cache addAll error:', err)
        })
      }),
      // Prepare API cache
      caches.open(API_CACHE),
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating.')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  console.log('📨 Message received in SW:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_SUBSCRIPTION') {
    // Handle subscription request
    self.registration.pushManager.getSubscription().then((subscription) => {
      event.ports[0].postMessage({
        subscription: subscription ? subscription.toJSON() : null
      })
    }).catch((error) => {
      console.error('Error getting subscription:', error)
      event.ports[0].postMessage({ error: error.message })
    })
  }
})

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Don't cache POST, PUT, DELETE, PATCH requests
  if (request.method !== 'GET') {
    return
  }

  // Don't cache API requests - let them fail gracefully offline
  // This ensures offline detection works properly
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // On offline, return 503 Service Unavailable
        // Let app handle offline detection
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Cache static assets (images, CSS, JS)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Return cached version
          return response
        }

        // Try to fetch from network and cache it
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            const responseToCache = response.clone()
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // Return placeholder for failed static assets
            if (request.destination === 'image') {
              return caches.match('/placeholder.svg')
            }
            return new Response('Offline', { status: 503 })
          })
      })
    )
    return
  }

  // For HTML pages, use network-first strategy with fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache error responses
        if (!response || response.status !== 200) {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // On offline, try to serve cached version
        return caches.match(request).then((response) => {
          if (response) {
            return response
          }

          // If not cached, return home page (which will show offline screen)
          return caches.match('/').then((home) => {
            return home || new Response('Offline - Cache not available', { status: 503 })
          })
        })
      })
  )
})

// Push event - handle incoming push notifications for all roles
self.addEventListener('push', (event) => {
  console.log('🔔 Push received:', event)

  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      console.warn('⚠️ Could not parse push data as JSON:', e)
      data = { body: event.data.text() }
    }
  }

  // Support all roles: patient, pharmacy, admin
  const title = data.title || 'دوائي - Duaiii'
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: data.icon || '/icon.svg',
    badge: '/icon.svg',
    image: data.image,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/',
      role: data.role || 'patient', // patient, pharmacy, admin
      userId: data.userId,
      actionType: data.actionType // prescription_received, response_received, etc.
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'عرض',
        icon: '/icon.svg'
      },
      {
        action: 'dismiss',
        title: 'تجاهل'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'default-notification'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notification displayed'))
      .catch((error) => console.error('❌ Error showing notification:', error))
  )
})

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification click received:', event)

  event.notification.close()

  const url = event.notification.data?.url || '/'
  const role = event.notification.data?.role || 'patient'
  
  // Redirect based on action
  let finalUrl = url
  if (event.action === 'view') {
    finalUrl = url
  } else if (event.action === 'dismiss') {
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === finalUrl && 'focus' in client) {
            return client.focus()
          }
        }

        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(finalUrl)
        }
      })
      .catch((error) => console.error('Error handling notification click:', error))
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('🚫 Notification closed:', event)
})

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    console.log('⏳ Performing background sync...')
    // Implement background sync logic here
    // This could include syncing offline data, updating cache, etc.
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

