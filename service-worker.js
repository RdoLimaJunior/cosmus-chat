const CACHE_NAME = 'cosmus-pwa-cache-v1';
// Adiciona os arquivos principais que compõem o "app shell" ao cache.
// Estes arquivos devem existir na pasta 'public' para serem copiados para a raiz do build.
const urlsToCache = [
  '/',
  '/manifest.json',
  '/cosmus-icon.svg'
];

// Evento de Instalação: o service worker é registrado.
self.addEventListener('install', event => {
  // Realiza a instalação: abre o cache e armazena os assets do app shell.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto. Armazenando o app shell.');
        // Adiciona todos os URLs definidos à cache. `addAll` é atômico.
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força a ativação imediata do novo service worker.
  );
});

// Evento de Ativação: o service worker é ativado.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  // Garante que o cliente use a versão mais recente do cache.
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se um cache antigo for encontrado (não está na whitelist), ele é removido.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Torna este service worker o controlador para todos os clientes abertos.
  );
});

// Evento de Fetch: intercepta todas as requisições de rede da página.
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET.
  if (event.request.method !== 'GET') {
    return;
  }
  
  const requestUrl = new URL(event.request.url);

  // Estratégia de Network-Only para a API da NASA para garantir dados sempre atualizados.
  if (requestUrl.hostname === 'images-api.nasa.gov') {
    // A requisição vai diretamente para a rede. O cache não é utilizado.
    event.respondWith(fetch(event.request));
    return;
  }

  // Estratégia de Cache-First para todos os outros assets.
  // Ideal para assets estáticos que não mudam com frequência.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se o recurso estiver no cache (cache hit), retorna a resposta do cache.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Se o recurso não estiver no cache, busca na rede.
        return fetch(event.request).then(
          networkResponse => {
            // Verifica se a resposta da rede é válida.
            // Ignora requisições de extensões do Chrome.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clona a resposta da rede. A resposta é um stream e só pode ser consumida uma vez.
            // Precisamos de uma cópia para o cache e outra para o navegador.
            const responseToCache = networkResponse.clone();

            // Abre o cache e armazena a nova resposta para futuras requisições.
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            // Retorna a resposta original da rede para o navegador.
            return networkResponse;
          }
        ).catch(error => {
          // O fetch falha se a rede estiver indisponível.
          // Neste caso, o aplicativo ficará offline, mas os assets já cacheados funcionarão.
          console.error('Fetch falhou; o usuário está provavelmente offline.', error);
          // O `throw error` fará com que a promessa seja rejeitada, e o navegador mostrará sua página de erro de conexão.
          throw error;
        });
      })
  );
});