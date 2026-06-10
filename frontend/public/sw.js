const CACHE_NAME = 'matchmind-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install: Cache shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch: Network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API calls: Network only (don't cache)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    return
  }

  // Static assets: Cache-first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
    return
  }

  // SPA routes: Network-first, fallback to cached index.html
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        return caches.match('/index.html')
      })
  )
})
