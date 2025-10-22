'use client';

import Link from 'next/link';
import { useAdminSession } from '@/components/admin/AdminGuard';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminHomePage() {
  const context = useAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Welcome back{context ? `, ${context.session.name ?? context.session.email}` : ''}!</h1>
        <p className="mt-2 text-sm text-slate-300">
          Use the navigation to manage menus, monitor incoming orders, register devices, and review performance reports.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            href: '/admin/menus',
            title: 'Manage menus',
            description: 'Update pricing, availability, and descriptions in real-time.',
          },
          {
            href: '/admin/orders',
            title: 'Track orders',
            description: 'Monitor active orders and customer details as they flow in.',
          },
          {
            href: '/admin/devices',
            title: 'Devices',
            description: 'Register kiosks, tablets, and mobile devices for in-store experiences.',
          },
          {
            href: '/admin/reports',
            title: 'Reports',
            description: 'Run daily sales and popularity reports to stay on top of trends.',
          },
        ].map((item) => (
          <Card
            key={item.href}
            className="border-slate-800 bg-slate-900/60 text-slate-100 transition hover:border-slate-700 hover:bg-slate-900"
          >
            <Link href={item.href} className="flex h-full flex-col">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg text-slate-100">{item.title}</CardTitle>
                <CardDescription className="text-slate-300">{item.description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
