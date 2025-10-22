'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminApiError, AdminOrder, adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const STATUSES = ['all', 'pending', 'confirmed', 'prepared', 'delivered', 'cancelled'] as const;

type StatusFilter = (typeof STATUSES)[number];

const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await adminApi.orders();
      setOrders(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError('Unable to load orders');
      } else {
        setError('Unexpected error fetching orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl text-slate-100">Order dashboard</CardTitle>
            <CardDescription className="text-slate-400">
              Monitor the latest 100 orders, their statuses, and customer details.
            </CardDescription>
            {lastUpdated ? (
              <p className="mt-1 text-xs text-slate-500">Last refreshed {lastUpdated.toLocaleTimeString()}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Select>
            <Button type="button" variant="outline" onClick={loadOrders}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-slate-300">Loading orders…</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-sm text-slate-400">No orders found for the selected status.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-sm text-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{order.id}</td>
                    <td className="px-4 py-3 capitalize">{order.status}</td>
                    <td className="px-4 py-3">{order.itemCount}</td>
                    <td className="px-4 py-3">
                      {order.total.toFixed(2)} {order.currency}
                    </td>
                    <td className="px-4 py-3">
                      {order.customer ? (
                        <div className="space-y-1 text-xs text-slate-300">
                          {order.customer.name ? <p>{order.customer.name}</p> : null}
                          {order.customer.phone ? <p>{order.customer.phone}</p> : null}
                          {order.customer.email ? <p>{order.customer.email}</p> : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Walk-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(order.submittedAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{order.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
