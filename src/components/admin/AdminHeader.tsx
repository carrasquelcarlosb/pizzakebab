'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminSession } from './AdminGuard';

const links = [
  { href: '/admin/menus', label: 'Menus' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/devices', label: 'Devices' },
  { href: '/admin/reports', label: 'Reports' },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const context = useAdminSession();
  const session = context?.session;

  const handleLogout = async () => {
    await adminApi.logout();
    router.replace('/admin/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold text-slate-100">Pizzakebab Admin</span>
        <nav className="flex gap-1 text-sm text-slate-300">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({
                    variant: isActive ? 'secondary' : 'ghost',
                    size: 'sm',
                  }),
                  'px-3',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <div className="text-right">
          <p className="font-medium text-slate-100">{session?.name ?? session?.email}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {session ? session.roles.join(', ') : '—'}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
