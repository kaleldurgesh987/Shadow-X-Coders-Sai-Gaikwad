import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Google Maps Platform Quota & Auth Failure Monitor (per gmp skill directives)
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

// Suppress benign Vite HMR websocket disconnection noise in cloud iframe preview
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('[vite] failed to connect')) {
    return;
  }
  originalConsoleError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || '');
  if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('closed without opened')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  if (msg.includes('WebSocket') || msg.includes('websocket')) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
