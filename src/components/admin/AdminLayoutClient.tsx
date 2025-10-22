'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminGuard } from './AdminGuard';
import { AdminHeader } from './AdminHeader';

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
