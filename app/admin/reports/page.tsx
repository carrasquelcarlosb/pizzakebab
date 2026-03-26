'use client';

import { useEffect, useState } from 'react';
import { AdminApiError, AdminReport, adminApi } from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export default function AdminReportsPage() {
  const [dailyReports, setDailyReports] = useState<AdminReport[]>([]);
  const [popularReports, setPopularReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningReport, setRunningReport] = useState<'daily' | 'popular' | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [daily, popular] = await Promise.all([
        adminApi.reports('daily-sales'),
        adminApi.reports('popular-items'),
      ]);
      setDailyReports(daily);
      setPopularReports(popular);
      setError(null);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError('Unable to load reports');
      } else {
        setError('Unexpected error fetching reports');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const runDailySales = async () => {
    setRunningReport('daily');
    try {
      await adminApi.runDailySales();
      await loadReports();
    } catch (err) {
      setError('Failed to generate daily sales report');
    } finally {
      setRunningReport(null);
    }
  };

  const runPopularItems = async () => {
    setRunningReport('popular');
    try {
      await adminApi.runPopularItems();
      await loadReports();
    } catch (err) {
      setError('Failed to generate popular items report');
    } finally {
      setRunningReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Reports and insights</h1>
        <p className="mt-2 text-sm text-slate-400">Generate aggregated sales and product performance reports.</p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-300">Loading reports…</p> : null}

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-100">Daily sales</CardTitle>
            <CardDescription className="text-slate-400">
              Compute total sales and currency breakdown for the latest day.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={runDailySales} disabled={runningReport === 'daily'}>
            {runningReport === 'daily' ? 'Generating…' : 'Run report'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyReports.length === 0 ? (
            <p className="text-sm text-slate-400">No reports generated yet.</p>
          ) : (
            dailyReports.map((report) => {
              const payload = report.payload as {
                total: number;
                currencyBreakdown: Record<string, number>;
                orderCount: number;
              };
              return (
                <Card key={report.id} className="border-slate-800 bg-slate-950/60 text-slate-100">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg text-slate-100">{formatDate(report.rangeStart)}</CardTitle>
                        <p className="text-xs text-slate-500">Generated {formatDate(report.generatedAt)}</p>
                      </div>
                      <div className="text-right text-sm text-slate-200">
                        <p className="text-base font-semibold text-slate-100">Total: {payload.total.toFixed(2)}</p>
                        <p className="text-xs text-slate-400">Orders: {payload.orderCount}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      {Object.entries(payload.currencyBreakdown).map(([currency, value]) => (
                        <div key={currency} className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                          <p className="text-xs uppercase text-slate-400">{currency}</p>
                          <p className="text-base font-semibold">{value.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-100">Popular items</CardTitle>
            <CardDescription className="text-slate-400">
              Identify top-performing menu items over the last seven days.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={runPopularItems} disabled={runningReport === 'popular'}>
            {runningReport === 'popular' ? 'Generating…' : 'Run report'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularReports.length === 0 ? (
            <p className="text-sm text-slate-400">No popular item reports generated yet.</p>
          ) : (
            popularReports.map((report) => {
              const payload = report.payload as Array<{
                menuItemId: string;
                name: string;
                quantity: number;
                revenue: number;
              }>;
              return (
                <Card key={report.id} className="border-slate-800 bg-slate-950/60 text-slate-100">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg text-slate-100">
                          {formatDate(report.rangeStart)} → {formatDate(report.rangeEnd)}
                        </CardTitle>
                        <p className="text-xs text-slate-500">Generated {formatDate(report.generatedAt)}</p>
                      </div>
                      <div className="text-right text-sm text-slate-200">
                        <p className="text-xs text-slate-400">Top {payload.length} items</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {payload.map((item) => (
                        <div key={item.menuItemId} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
                          <div>
                            <p className="font-semibold text-slate-100">{item.name}</p>
                            <p className="text-xs text-slate-400">ID: {item.menuItemId}</p>
                          </div>
                          <div className="text-right text-xs text-slate-300">
                            <p>Qty: {item.quantity}</p>
                            <p>Revenue: {item.revenue.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
