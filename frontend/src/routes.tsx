import type { RouteObject } from 'react-router';

import { RootLayout } from './components/RootLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

// All pages in one place; nested routes render inside RootLayout's <Outlet />.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
