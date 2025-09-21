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
/* // Temporariamente desabilitado para garantir o deploy. Será reativado com uma estratégia de cache correta.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usa um caminho absoluto simples e define o escopo explicitamente como '/'.
    // Isso é mais robusto do que construir a URL e resolve ambiguidades
    // em ambientes de hospedagem complexos que poderiam causar o erro de 'origem'.
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registrado com sucesso com o escopo: ', registration.scope);
      })
      .catch(error => {
        console.log('Falha no registro do ServiceWorker: ', error);
      });
  });
}
*/