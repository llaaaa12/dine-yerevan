import { useEffect, useState } from 'react';

import { getHealth } from './health.api.ts';

// Shows whether the browser can reach the backend (through the Vite proxy) and its database.
export function ApiStatus() {
  const [status, setStatus] = useState('checking…');

  useEffect(() => {
    let ignore = false;
    getHealth()
      .then((health) => {
        if (!ignore) setStatus(`${health.status}, database ${health.database}`);
      })
      .catch(() => {
        if (!ignore) setStatus('unreachable (is the backend running?)');
      });
    return () => {
      ignore = true;
    };
  }, []);

  return <p>API status: {status}</p>;
}
