// In order to get the web app working offline, the browser needs to be able to respond to network requests and choose where to route them.

// During the service worker's install event, a named cache is opened using the Cache Storage API. The files and routes specified in precacheResources are then loaded into the cache using the cache.addAll method. This is called precaching because it preemptively caches the set of files during install time as opposed to caching them when they're needed or requested.

// Once the service worker is controlling the site, requested resources pass through the service worker like a proxy. Each request triggers a fetch event that, in this service worker, searches the cache for a match, if there's a match, responds with cached resource. If there isn't a match, the resource is requested normally.

// Caching resources allows the app to work offline by avoiding network requests. Now the app can respond with a 200 status code when offline!

// Choose a cache name
const cacheName = 'cache-v1';
// List the files to precache
const precacheResources = ['/', '/index.html', '/css/style.css', '/js/main.js', '/js/app/editor.js', '/js/lib/actions.js'];

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('Service worker install event!');
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activate event!');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    }),
  );
});