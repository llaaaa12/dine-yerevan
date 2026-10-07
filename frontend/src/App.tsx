import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { routes } from './routes.tsx';

const router = createBrowserRouter(routes);

// App-wide providers (data fetching, auth, theme) wrap the router here as they are added.
export function App() {
  return <RouterProvider router={router} />;
}
