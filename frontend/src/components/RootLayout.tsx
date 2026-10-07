import { Link, Outlet } from 'react-router';

import styles from './RootLayout.module.css';

export function RootLayout() {
  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          🍽️ Dine Yerevan
        </Link>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
