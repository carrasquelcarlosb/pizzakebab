'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminApiError, AdminSession, adminApi } from '@/lib/admin-api';

type AdminGuardContextValue = {
  session: AdminSession;
  refresh: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminGuardContextValue | null>(null);

export const useAdminSession = (): AdminGuardContextValue | null => useContext(AdminSessionContext);

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const loadSession = async () => {
      try {
        const result = await adminApi.session();
        if (!mounted) return;
        setSession(result.admin);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof AdminApiError && err.status === 401) {
          setSession(null);
          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          }
        } else {
          setError('Unable to load administrator session');
          setSession(null);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  const refresh = async () => {
    try {
      const result = await adminApi.session();
      setSession(result.admin);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        setSession(null);
        router.replace('/admin/login');
      }
      throw err;
    }
  };

  const value = useMemo(() => {
    if (!session) {
      return null;
    }
    return { session, refresh };
  }, [session]);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-md border border-slate-800 bg-slate-900 px-6 py-4 shadow-lg">
          <p className="text-sm font-medium">Loading admin session…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
          <div className="rounded-md border border-red-900/40 bg-red-900/20 px-6 py-4 shadow-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      );
    }

    return null;
  }

  const contextValue: AdminGuardContextValue = value ?? { session, refresh };

  return <AdminSessionContext.Provider value={contextValue}>{children}</AdminSessionContext.Provider>;
}
