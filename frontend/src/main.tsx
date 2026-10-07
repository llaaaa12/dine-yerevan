import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles first, so component styles can override them
import './index.css';
import { App } from './App.tsx';

// Only `vite --mode mock` keeps this branch; production builds drop it and MSW with it
async function startMockApi() {
  if (import.meta.env.MODE === 'mock') {
    const { worker } = await import('./test/msw/browser.ts');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
}

startMockApi().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
