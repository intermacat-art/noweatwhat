import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';
import { initEggSubscriptions } from './stores/eggStore';

// Auto-reload when new service worker is available
registerSW({
  onNeedRefresh() {
    window.location.reload();
  },
});

initEggSubscriptions();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
