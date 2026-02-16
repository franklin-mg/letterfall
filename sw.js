/**
 * Service Worker para Gallows - Tecnotic
 * Gestiona la caché para permitir el funcionamiento offline y mejorar la velocidad.
 */

const CACHE_NAME = 'gallows-cache-v1';

// Lista de activos a cachear durante la instalación
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Evento de instalación: guarda los archivos en la caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierta: guardando activos estáticos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de activación: limpia cachés antiguas si las hubiera
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento fetch: intercepta peticiones para servir desde caché primero
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna la respuesta desde caché si existe, de lo contrario busca en la red
        return response || fetch(event.request);
      })
      .catch(() => {
        // Opcional: podrías retornar una página offline aquí si fuera necesario
      })
  );
});