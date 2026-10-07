import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        This page doesn’t exist or has moved.
      </p>
      {/* asChild: the button styles go onto the router's <Link> */}
      <Button asChild>
        <Link to="/">Back to the home page</Link>
      </Button>
    </section>
  );
}
