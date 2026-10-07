import { ApiStatus } from '../features/health/ApiStatus.tsx';

export function HomePage() {
  return (
    <>
      <h1>Dine Yerevan</h1>
      <p>The frontend is up and running.</p>
      <ApiStatus />
    </>
  );
}
