import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';

import { getHealth } from './health.api.ts';

// Shows whether the browser can reach the backend (through the Vite proxy) and its database.
export function ApiStatus() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  let text = 'checking…';
  let dotColor = 'bg-muted-foreground';
  if (isError) {
    text = 'unreachable (is the backend running?)';
    dotColor = 'bg-destructive';
  } else if (!isPending) {
    text = `${data.status}, database ${data.database}`;
    dotColor = data.database === 'up' ? 'bg-emerald-500' : 'bg-amber-500';
  }

  return (
    <p
      role="status"
      className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground"
    >
      <span className={cn('size-2 rounded-full', dotColor)} aria-hidden />
      API status: {text}
    </p>
  );
}
