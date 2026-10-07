import { Badge } from '@/components/ui/badge';

import { ApiStatus } from '../features/health/ApiStatus.tsx';

export function HomePage() {
  return (
    <section className="flex flex-col items-start gap-5 py-10">
      <Badge variant="secondary">Table reservations in Yerevan</Badge>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Dine Yerevan
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Discover restaurants in Yerevan and reserve a table online in a few
        clicks.
      </p>
      <ApiStatus />
    </section>
  );
}
