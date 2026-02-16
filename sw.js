/**
 * Service Worker para Gallows - Tecnotic
 * Gestiona la caché para permitir el funcionamiento offline y mejorar la velocidad.
 * Versión optimizada con logs para depuración en desarrollo.
 */

const CACHE_NAME = 'gallows-cache-v1';

// Lista de activos a cachear durante la instalación
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './the_gallows.html',
  './icon-192.png',
  './icon-512.png'
];

// Evento de instalación: guarda los archivos en la caché
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Estado: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache abierta: Guardando activos estáticos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Todos los activos han sido cacheados con éxito');
        return self.skipWaiting();
      })
  );
});

// Evento de activación: limpia cachés antiguas si las hubiera
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Estado: Activado y listo para manejar peticiones');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Limpiando memoria: Borrando caché antigua:', cacheName);
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
        if (response) {
          console.log('[Service Worker] Sirviendo desde caché:', event.request.url);
          return response;
        }
        console.log('[Service Worker] Petición no encontrada en caché, consultando red:', event.request.url);
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('[Service Worker] Error al procesar la petición:', error);
      })
  );
});
