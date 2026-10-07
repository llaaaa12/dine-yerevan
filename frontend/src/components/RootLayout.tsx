import { UtensilsCrossedIcon } from 'lucide-react';
import { Link, Outlet } from 'react-router';

import { Toaster } from '@/components/ui/sonner';

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <UtensilsCrossedIcon className="size-5 text-primary" aria-hidden />
            Dine Yerevan
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Outlet />
      </main>
      {/* Toast messages: call toast('…') from 'sonner' anywhere */}
      <Toaster />
    </div>
  );
}
