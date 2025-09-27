import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra o Service Worker para habilitar a funcionalidade PWA/offline
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Desativa o Service Worker em domínios de preview para evitar erros de origem cruzada.
    const isPreview = window.location.origin.includes("usercontent.goog");
    if (isPreview) {
      console.log("⚠️ Service Worker desativado no ambiente de preview.");
      // Tenta desregistrar qualquer SW antigo que possa ter sido registrado incorretamente.
      // Em ambientes sandboxed (como o AI Studio), esta operação pode falhar, e isso é esperado.
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
          console.log(`Service Worker com escopo ${registration.scope} desregistrado.`);
        }
      }).catch(function() {
          // Ignora intencionalmente o erro. Falhar ao desregistrar não é crítico aqui.
      });
      return;
    }

    const expectedOrigin = window.location.origin;

    // Usar um caminho relativo é crucial para ambientes que podem reescrever o host.
    navigator.serviceWorker.register('service-worker.js', { scope: '/' })
      .then(registration => {
        // Uma registro pode ter sucesso mesmo que a scriptURL tenha uma origem diferente.
        // Precisamos verificar a origem do script do worker para segurança.
        // Esta é uma verificação defensiva contra ambientes complexos de proxy/hospedagem.
        const worker = registration.installing || registration.waiting || registration.active;
        if (worker) {
          const scriptOrigin = new URL(worker.scriptURL).origin;
          if (scriptOrigin !== expectedOrigin) {
            console.warn(
              `⚠️ ServiceWorker com origem incorreta detectado (${scriptOrigin}). Desregistrando...`
            );
            registration.unregister();
          } else {
            console.log('✅ ServiceWorker registrado com sucesso com o escopo: ', registration.scope);
          }
        } else {
             console.log('ServiceWorker registrado, aguardando ativação para verificar a origem.');
        }
      })
      .catch(error => {
        console.error('❌ Falha no registro do ServiceWorker: ', error);
      });
  });
}