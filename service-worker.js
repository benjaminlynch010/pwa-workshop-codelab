import { warmStrategyCache } from 'workbox-recipes';
import { CacheFirst } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { StaleWhileRevalidate } from 'workbox-strategies';







// It starts by setting up a new Cache First caching strategy, chosen instead of a Cache Only strategy to allow for other pages to be added to the cache as needed. A name is given to it, page-cache. Workbox strategies can take a number of plugins that can affect the lifecycle of saving and retrieving content from the cache. Here, two plugins, the Cacheable Response plugin and the Expiration plugin, are used to ensure only good server responses are cached, and that each item in cache will get flushed after 30 days.
const pageCache = new CacheFirst({
  cacheName: 'page-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

// Next, the strategy's cache gets warmed with /index.html and / using the warm strategy cache Workbox recipe. This will add those items to this cache during the service worker's install event.
warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Finally, a new route is registered. Any request that's a page navigation will be managed by this Cache First strategy, either pulling from the cache or the network and then caching the response.
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'asset-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);
