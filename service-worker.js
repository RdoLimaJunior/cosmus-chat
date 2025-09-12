const CACHE_NAME = 'cosmus-pwa-cache-v1';
// Adiciona os arquivos principais que compõem o "app shell" ao cache.
// CRÍTICO: '/index.tsx' foi adicionado para garantir que a lógica principal do app funcione offline.
// CRÍTICO: '/cosmus2.webp' foi adicionado pois é usado como avatar padrão.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx', // Garante que o script principal seja cacheado
  '/cosmus.webp',
  '/cosmus2.webp', // Garante que o avatar padrão seja cacheado
  '/icon-192.png',
  '/icon-512.png'
];

// Evento de Instalação: abre o cache e adiciona os arquivos principais.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  // Força o service worker em espera a se tornar o ativo.
  self.skipWaiting();
});

// Evento de Ativação: limpa caches antigos.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o nome do cache não estiver na nossa lista de permissões, delete-o.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Torna o service worker o controlador para todos os clientes imediatamente.
  );
});

// Evento de Fetch: serve do cache, com fallback para a rede, e então armazena em cache a nova resposta.
self.addEventListener('fetch', event => {
  // Nós só queremos cachear requisições GET.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Para chamadas de API para a NASA, sempre vá para a rede. Não armazene em cache.
  if (event.request.url.includes('images-api.nasa.gov')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia de Cache, depois Rede.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Retorna a resposta do cache se disponível.
        if (response) {
          return response;
        }

        // Caso contrário, busca da rede.
        return fetch(event.request).then(networkResponse => {
          // Verifica se recebemos uma resposta válida antes de armazenar em cache.
          if (networkResponse && networkResponse.status === 200) {
              // Clona a resposta porque ela só pode ser consumida uma vez.
              // Coloca a nova resposta no cache.
              cache.put(event.request, networkResponse.clone());
          }
          // Retorna a resposta da rede original.
          return networkResponse;
        });
      });
    })
  );
});