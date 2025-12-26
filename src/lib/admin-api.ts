'use client';

export type AdminSession = {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
};

export type AdminMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  categoryKey?: string | null;
  price: number;
  currency: string;
  isAvailable: boolean;
  imageUrl?: string | null;
  isPopular?: boolean;
  isNew?: boolean;
};

export type AdminMenu = {
  id: string;
  name: string;
  description?: string | null;
  translationKey?: string | null;
  isActive: boolean;
  items: AdminMenuItem[];
};

export type AdminOrder = {
  id: string;
  status: string;
  total: number;
  currency: string;
  submittedAt: string;
  itemCount: number;
  customer?: { name?: string; phone?: string; email?: string } | null;
  notes?: string | null;
};

export type AdminDevice = {
  id: string;
  label: string;
  type: 'kiosk' | 'tablet' | 'mobile';
  lastSeenAt?: string | null;
};

export type AdminPricingOverride = {
  id: string;
  menuItemId: string;
  price: number;
  currency: string;
  startsAt?: string | null;
  endsAt?: string | null;
  reason?: string | null;
};

export type AdminOperatingHour = {
  id: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed?: boolean;
};

export type AdminReport = {
  id: string;
  type: 'daily-sales' | 'popular-items';
  rangeStart: string;
  rangeEnd: string;
  generatedAt: string;
  payload: unknown;
};

export class AdminApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'pizzakebab';

const buildHeaders = (extra?: HeadersInit): HeadersInit => ({
  'Content-Type': 'application/json',
  'x-tenant-id': TENANT_ID,
  ...(extra ?? {}),
});

async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: buildHeaders(init.headers as HeadersInit | undefined),
  });

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch (error) {
      body = null;
    }
    throw new AdminApiError('Admin API request failed', response.status, body);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const adminApi = {
  async login(email: string, password: string) {
    return adminRequest<{ admin: AdminSession; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async logout() {
    return adminRequest<{ success: boolean }>('/admin/auth/logout', { method: 'POST' });
  },
  async session() {
    return adminRequest<{ admin: AdminSession }>('/admin/auth/session');
  },
  async menus() {
    const result = await adminRequest<{ menus: AdminMenu[] }>('/admin/menus');
    return result.menus;
  },
  async saveMenu(menu: Partial<AdminMenu>) {
    if (menu.id) {
      const result = await adminRequest<{ menu: AdminMenu | null }>(`/admin/menus/${menu.id}`, {
        method: 'PUT',
        body: JSON.stringify(menu),
      });
      return result.menu;
    }
    const result = await adminRequest<{ menu: AdminMenu | null }>('/admin/menus', {
      method: 'POST',
      body: JSON.stringify(menu),
    });
    return result.menu;
  },
  async deleteMenu(menuId: string) {
    await adminRequest(`/admin/menus/${menuId}`, { method: 'DELETE' });
  },
  async pricingOverrides() {
    const result = await adminRequest<{ overrides: AdminPricingOverride[] }>('/admin/pricing-overrides');
    return result.overrides;
  },
  async savePricingOverride(override: Partial<AdminPricingOverride>) {
    if (override.id) {
      const result = await adminRequest<{ override: AdminPricingOverride | null }>(
        `/admin/pricing-overrides/${override.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(override),
        },
      );
      return result.override;
    }
    const result = await adminRequest<{ override: AdminPricingOverride | null }>('/admin/pricing-overrides', {
      method: 'POST',
      body: JSON.stringify(override),
    });
    return result.override;
  },
  async deletePricingOverride(id: string) {
    await adminRequest(`/admin/pricing-overrides/${id}`, { method: 'DELETE' });
  },
  async operatingHours() {
    const result = await adminRequest<{ hours: AdminOperatingHour[] }>('/admin/operating-hours');
    return result.hours;
  },
  async saveOperatingHour(hour: Partial<AdminOperatingHour>) {
    if (hour.id) {
      const result = await adminRequest<{ operatingHour: AdminOperatingHour | null }>(
        `/admin/operating-hours/${hour.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(hour),
        },
      );
      return result.operatingHour;
    }
    const result = await adminRequest<{ operatingHour: AdminOperatingHour | null }>('/admin/operating-hours', {
      method: 'POST',
      body: JSON.stringify(hour),
    });
    return result.operatingHour;
  },
  async deleteOperatingHour(id: string) {
    await adminRequest(`/admin/operating-hours/${id}`, { method: 'DELETE' });
  },
  async devices() {
    const result = await adminRequest<{ devices: AdminDevice[] }>('/admin/devices');
    return result.devices;
  },
  async saveDevice(device: Partial<AdminDevice>) {
    if (device.id) {
      const result = await adminRequest<{ device: AdminDevice | null }>(`/admin/devices/${device.id}`, {
        method: 'PUT',
        body: JSON.stringify(device),
      });
      return result.device;
    }
    const result = await adminRequest<{ device: AdminDevice | null }>('/admin/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
    return result.device;
  },
  async pingDevice(deviceId: string) {
    const result = await adminRequest<{ device: AdminDevice | null }>(`/admin/devices/${deviceId}/ping`, {
      method: 'POST',
    });
    return result.device;
  },
  async deleteDevice(deviceId: string) {
    await adminRequest(`/admin/devices/${deviceId}`, { method: 'DELETE' });
  },
  async orders() {
    const result = await adminRequest<{ orders: AdminOrder[] }>('/admin/orders');
    return result.orders;
  },
  async runDailySales(date?: string) {
    const result = await adminRequest<{ report: AdminReport | null }>('/admin/reports/daily-sales/run', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    return result.report;
  },
  async runPopularItems(days?: number) {
    const result = await adminRequest<{ report: AdminReport | null }>('/admin/reports/popular-items/run', {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
    return result.report;
  },
  async reports(type: 'daily-sales' | 'popular-items') {
    const result = await adminRequest<{ reports: AdminReport[] }>(`/admin/reports/${type}`);
    return result.reports;
  },
};
