import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { verifyPassword } from '../services/password';
import { MenuDocument, MenuItemDocument, PricingOverrideDocument, OperatingHourDocument, ReportDocument } from '../db/schemas';
import type { TenantCollections } from '../db/mongo';

const adminUserResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: ['string', 'null'] },
    roles: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'email', 'roles'],
  additionalProperties: false,
} as const;

const loginBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

const menuItemInputSchema = {
  type: 'object',
  properties: {
    id: { type: ['string', 'null'] },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    categoryKey: { type: ['string', 'null'] },
    price: { type: 'number' },
    currency: { type: 'string' },
    isAvailable: { type: 'boolean' },
    imageUrl: { type: ['string', 'null'] },
    isPopular: { type: ['boolean', 'null'] },
    isNew: { type: ['boolean', 'null'] },
  },
  required: ['name', 'price', 'currency', 'isAvailable'],
  additionalProperties: false,
} as const;

const menuInputSchema = {
  type: 'object',
  properties: {
    id: { type: ['string', 'null'] },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    translationKey: { type: ['string', 'null'] },
    isActive: { type: 'boolean' },
    items: { type: 'array', items: menuItemInputSchema },
  },
  required: ['name', 'isActive', 'items'],
  additionalProperties: false,
} as const;

type MenuItemInput = {
  id?: string | null;
  name: string;
  description?: string | null;
  categoryKey?: string | null;
  price: number;
  currency: string;
  isAvailable: boolean;
  imageUrl?: string | null;
  isPopular?: boolean | null;
  isNew?: boolean | null;
};

type MenuInput = {
  id?: string | null;
  name: string;
  description?: string | null;
  translationKey?: string | null;
  isActive: boolean;
  items: MenuItemInput[];
};

const pricingOverrideInputSchema = {
  type: 'object',
  properties: {
    id: { type: ['string', 'null'] },
    menuItemId: { type: 'string' },
    price: { type: 'number' },
    currency: { type: 'string' },
    startsAt: { type: ['string', 'null'], format: 'date-time' },
    endsAt: { type: ['string', 'null'], format: 'date-time' },
    reason: { type: ['string', 'null'] },
  },
  required: ['menuItemId', 'price', 'currency'],
  additionalProperties: false,
} as const;

const operatingHourInputSchema = {
  type: 'object',
  properties: {
    id: { type: ['string', 'null'] },
    dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
    opensAt: { type: 'string' },
    closesAt: { type: 'string' },
    isClosed: { type: ['boolean', 'null'] },
  },
  required: ['dayOfWeek', 'opensAt', 'closesAt'],
  additionalProperties: false,
} as const;

const deviceInputSchema = {
  type: 'object',
  properties: {
    id: { type: ['string', 'null'] },
    label: { type: 'string' },
    type: { type: 'string', enum: ['kiosk', 'tablet', 'mobile'] },
  },
  required: ['label', 'type'],
  additionalProperties: false,
} as const;

const parseDate = (value: string | null | undefined): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
};

const formatMenuItem = (doc: MenuItemDocument) => ({
  id: doc.resourceId,
  name: doc.name,
  description: doc.description ?? null,
  categoryKey: doc.categoryKey ?? null,
  price: doc.price,
  currency: doc.currency,
  isAvailable: doc.isAvailable,
  imageUrl: doc.imageUrl ?? null,
  isPopular: doc.isPopular ?? false,
  isNew: doc.isNew ?? false,
});

const formatMenu = (menu: MenuDocument, items: MenuItemDocument[]) => ({
  id: menu.resourceId,
  name: menu.name,
  description: menu.description ?? null,
  translationKey: menu.translationKey ?? null,
  isActive: menu.isActive,
  items: items.map(formatMenuItem),
});

const formatPricingOverride = (doc: PricingOverrideDocument) => ({
  id: doc.resourceId,
  menuItemId: doc.menuItemId,
  price: doc.price,
  currency: doc.currency,
  startsAt: doc.startsAt?.toISOString() ?? null,
  endsAt: doc.endsAt?.toISOString() ?? null,
  reason: doc.reason ?? null,
});

const formatOperatingHour = (doc: OperatingHourDocument) => ({
  id: doc.resourceId,
  dayOfWeek: doc.dayOfWeek,
  opensAt: doc.opensAt,
  closesAt: doc.closesAt,
  isClosed: doc.isClosed ?? false,
});

const formatReport = (doc: ReportDocument) => ({
  id: doc.resourceId,
  type: doc.reportType,
  rangeStart: doc.rangeStart.toISOString(),
  rangeEnd: doc.rangeEnd.toISOString(),
  generatedAt: doc.generatedAt.toISOString(),
  payload: doc.payload,
});

const ensureMenuItems = async (
  menuId: string,
  items: MenuItemInput[],
  tenantCollections: TenantCollections,
): Promise<void> => {
  const existingItems = await tenantCollections.menuItems.find({ menuId }).toArray();
  const seen = new Set<string>();

  for (const item of items) {
    const isTempId = item.id?.startsWith('temp-item-');
    const resourceId = !item.id || isTempId ? randomUUID() : item.id;
    seen.add(resourceId);
    const payload = {
      menuId,
      name: item.name,
      description: item.description ?? undefined,
      categoryKey: item.categoryKey ?? undefined,
      price: item.price,
      currency: item.currency,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl ?? undefined,
      isPopular: item.isPopular ?? undefined,
      isNew: item.isNew ?? undefined,
    };

    await tenantCollections.menuItems.updateOne(
      { resourceId },
      {
        $setOnInsert: {
          resourceId,
          createdAt: new Date(),
        },
        $set: payload,
      },
      { upsert: true },
    );
  }

  for (const existing of existingItems) {
    if (!seen.has(existing.resourceId)) {
      await tenantCollections.menuItems.deleteOne({ resourceId: existing.resourceId });
    }
  }
};

const calculateDailySalesPayload = async (
  tenantCollections: TenantCollections,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  const orders = await tenantCollections.orders
    .find({ submittedAt: { $gte: rangeStart, $lt: rangeEnd } })
    .toArray();

  let total = 0;
  const currencyCount: Record<string, number> = {};

  for (const order of orders) {
    total += order.total;
    currencyCount[order.currency] = (currencyCount[order.currency] ?? 0) + order.total;
  }

  return {
    total,
    currencyBreakdown: currencyCount,
    orderCount: orders.length,
  };
};

const calculatePopularItemsPayload = async (
  tenantCollections: TenantCollections,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  const orders = await tenantCollections.orders
    .find({ submittedAt: { $gte: rangeStart, $lt: rangeEnd } })
    .toArray();

  const counts = new Map<string, { quantity: number; revenue: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      const entry = counts.get(item.menuItemId) ?? { quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      const averageLineTotal = order.items.length > 0 ? order.total / order.items.length : 0;
      entry.revenue += averageLineTotal * item.quantity;
      counts.set(item.menuItemId, entry);
    }
  }

  const menuItems = await tenantCollections.menuItems.find({}).toArray();
  const itemNameMap = new Map(menuItems.map((item) => [item.resourceId, item.name]));

  return Array.from(counts.entries())
    .map(([menuItemId, info]) => ({
      menuItemId,
      name: itemNameMap.get(menuItemId) ?? menuItemId,
      quantity: info.quantity,
      revenue: info.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 20);
};

export default async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/admin/auth/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              admin: adminUserResponseSchema,
              token: { type: 'string' },
            },
            required: ['admin', 'token'],
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };
      const collections = await request.getTenantCollections();
      const adminUser = await collections.adminUsers.findOne({ email: email.toLowerCase() });

      if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
        reply.code(401);
        return { message: 'Invalid credentials' };
      }

      const token = app.signAdminToken({ adminId: adminUser.resourceId, tenantId: request.tenantId });
      app.setAdminSessionCookie(reply, token);

      await collections.adminUsers.updateOne(
        { resourceId: adminUser.resourceId },
        { $set: { lastLoginAt: new Date() } },
      );

      return {
        admin: {
          id: adminUser.resourceId,
          email: adminUser.email,
          name: adminUser.name ?? null,
          roles: adminUser.roles,
        },
        token,
      };
    },
  );

  app.post(
    '/admin/auth/logout',
    { preHandler: app.authenticate },
    async (_request, reply) => {
      app.clearAdminSessionCookie(reply);
      return { success: true };
    },
  );

  app.get(
    '/admin/auth/session',
    { preHandler: app.authenticate },
    async (request) => {
      return { admin: request.adminUser };
    },
  );

  app.get(
    '/admin/menus',
    { preHandler: app.authenticate },
    async (request) => {
      const collections = await request.getTenantCollections();
      const menus = await collections.menus.find({}).toArray();
      const items = await collections.menuItems.find({}).toArray();
      const itemsByMenu = new Map<string, MenuItemDocument[]>();
      for (const item of items) {
        const list = itemsByMenu.get(item.menuId) ?? [];
        list.push(item);
        itemsByMenu.set(item.menuId, list);
      }

      return {
        menus: menus.map((menu) => formatMenu(menu, itemsByMenu.get(menu.resourceId) ?? [])),
      };
    },
  );

  app.post(
    '/admin/menus',
    { preHandler: app.authenticate, schema: { body: menuInputSchema } },
    async (request, reply) => {
      const collections = await request.getTenantCollections();
      const body = request.body as MenuInput;

      const resourceId = body.id && body.id.length > 0 ? body.id : randomUUID();

      await collections.menus.updateOne(
        { resourceId },
        {
          $setOnInsert: { resourceId, createdAt: new Date() },
          $set: {
            name: body.name,
            description: body.description ?? undefined,
            translationKey: body.translationKey ?? undefined,
            isActive: body.isActive,
          },
        },
        { upsert: true },
      );

      await ensureMenuItems(resourceId, body.items, collections);

      const menuDoc = await collections.menus.findOne({ resourceId });
      const menuItems = await collections.menuItems.find({ menuId: resourceId }).toArray();

      reply.code(201);
      return { menu: menuDoc ? formatMenu(menuDoc, menuItems) : null };
    },
  );

  app.put(
    '/admin/menus/:menuId',
    { preHandler: app.authenticate, schema: { body: menuInputSchema } },
    async (request) => {
      const { menuId } = request.params as { menuId: string };
      const collections = await request.getTenantCollections();
      const body = request.body as MenuInput;

      const menu = await collections.menus.findOne({ resourceId: menuId });
      if (!menu) {
        return { message: 'Menu not found' };
      }

      await collections.menus.updateOne(
        { resourceId: menuId },
        {
          $set: {
            name: body.name,
            description: body.description ?? undefined,
            translationKey: body.translationKey ?? undefined,
            isActive: body.isActive,
          },
        },
      );

      await ensureMenuItems(menuId, body.items, collections);

      const updatedMenu = await collections.menus.findOne({ resourceId: menuId });
      const menuItems = await collections.menuItems.find({ menuId }).toArray();

      return { menu: updatedMenu ? formatMenu(updatedMenu, menuItems) : null };
    },
  );

  app.delete(
    '/admin/menus/:menuId',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const { menuId } = request.params as { menuId: string };
      const collections = await request.getTenantCollections();
      await collections.menus.deleteOne({ resourceId: menuId });
      await collections.menuItems.deleteMany({ menuId });
      reply.code(204);
    },
  );

  app.get(
    '/admin/pricing-overrides',
    { preHandler: app.authenticate },
    async (request) => {
      const collections = await request.getTenantCollections();
      const overrides = await collections.pricingOverrides.find({}).toArray();
      return { overrides: overrides.map(formatPricingOverride) };
    },
  );

  app.post(
    '/admin/pricing-overrides',
    { preHandler: app.authenticate, schema: { body: pricingOverrideInputSchema } },
    async (request, reply) => {
      const collections = await request.getTenantCollections();
      const body = request.body as {
        id?: string | null;
        menuItemId: string;
        price: number;
        currency: string;
        startsAt?: string | null;
        endsAt?: string | null;
        reason?: string | null;
      };

      const resourceId = body.id && body.id.length > 0 ? body.id : randomUUID();
      await collections.pricingOverrides.updateOne(
        { resourceId },
        {
          $setOnInsert: { resourceId, createdAt: new Date() },
          $set: {
            menuItemId: body.menuItemId,
            price: body.price,
            currency: body.currency,
            startsAt: parseDate(body.startsAt ?? undefined),
            endsAt: parseDate(body.endsAt ?? undefined),
            reason: body.reason ?? undefined,
          },
        },
        { upsert: true },
      );

      const override = await collections.pricingOverrides.findOne({ resourceId });
      reply.code(201);
      return { override: override ? formatPricingOverride(override) : null };
    },
  );

  app.put(
    '/admin/pricing-overrides/:overrideId',
    { preHandler: app.authenticate, schema: { body: pricingOverrideInputSchema } },
    async (request) => {
      const { overrideId } = request.params as { overrideId: string };
      const collections = await request.getTenantCollections();
      const body = request.body as {
        menuItemId: string;
        price: number;
        currency: string;
        startsAt?: string | null;
        endsAt?: string | null;
        reason?: string | null;
      };

      await collections.pricingOverrides.updateOne(
        { resourceId: overrideId },
        {
          $set: {
            menuItemId: body.menuItemId,
            price: body.price,
            currency: body.currency,
            startsAt: parseDate(body.startsAt ?? undefined),
            endsAt: parseDate(body.endsAt ?? undefined),
            reason: body.reason ?? undefined,
          },
        },
      );

      const override = await collections.pricingOverrides.findOne({ resourceId: overrideId });
      return { override: override ? formatPricingOverride(override) : null };
    },
  );

  app.delete(
    '/admin/pricing-overrides/:overrideId',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const { overrideId } = request.params as { overrideId: string };
      const collections = await request.getTenantCollections();
      await collections.pricingOverrides.deleteOne({ resourceId: overrideId });
      reply.code(204);
    },
  );

  app.get(
    '/admin/operating-hours',
    { preHandler: app.authenticate },
    async (request) => {
      const collections = await request.getTenantCollections();
      const hours = await collections.operatingHours.find({}).toArray();
      return { hours: hours.map(formatOperatingHour) };
    },
  );

  app.post(
    '/admin/operating-hours',
    { preHandler: app.authenticate, schema: { body: operatingHourInputSchema } },
    async (request, reply) => {
      const collections = await request.getTenantCollections();
      const body = request.body as {
        id?: string | null;
        dayOfWeek: number;
        opensAt: string;
        closesAt: string;
        isClosed?: boolean | null;
      };

      const resourceId = body.id && body.id.length > 0 ? body.id : randomUUID();
      await collections.operatingHours.updateOne(
        { resourceId },
        {
          $setOnInsert: { resourceId, createdAt: new Date() },
          $set: {
            dayOfWeek: body.dayOfWeek,
            opensAt: body.opensAt,
            closesAt: body.closesAt,
            isClosed: body.isClosed ?? undefined,
          },
        },
        { upsert: true },
      );

      const hour = await collections.operatingHours.findOne({ resourceId });
      reply.code(201);
      return { operatingHour: hour ? formatOperatingHour(hour) : null };
    },
  );

  app.put(
    '/admin/operating-hours/:hourId',
    { preHandler: app.authenticate, schema: { body: operatingHourInputSchema } },
    async (request) => {
      const { hourId } = request.params as { hourId: string };
      const collections = await request.getTenantCollections();
      const body = request.body as {
        dayOfWeek: number;
        opensAt: string;
        closesAt: string;
        isClosed?: boolean | null;
      };

      await collections.operatingHours.updateOne(
        { resourceId: hourId },
        {
          $set: {
            dayOfWeek: body.dayOfWeek,
            opensAt: body.opensAt,
            closesAt: body.closesAt,
            isClosed: body.isClosed ?? undefined,
          },
        },
      );

      const hour = await collections.operatingHours.findOne({ resourceId: hourId });
      return { operatingHour: hour ? formatOperatingHour(hour) : null };
    },
  );

  app.delete(
    '/admin/operating-hours/:hourId',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const { hourId } = request.params as { hourId: string };
      const collections = await request.getTenantCollections();
      await collections.operatingHours.deleteOne({ resourceId: hourId });
      reply.code(204);
    },
  );

  app.get(
    '/admin/devices',
    { preHandler: app.authenticate },
    async (request) => {
      const collections = await request.getTenantCollections();
      const devices = await collections.devices.find({}).toArray();
      return {
        devices: devices.map((device) => ({
          id: device.resourceId,
          label: device.label,
          type: device.type,
          lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
        })),
      };
    },
  );

  app.post(
    '/admin/devices',
    { preHandler: app.authenticate, schema: { body: deviceInputSchema } },
    async (request, reply) => {
      const collections = await request.getTenantCollections();
      const body = request.body as { id?: string | null; label: string; type: 'kiosk' | 'tablet' | 'mobile' };
      const resourceId = body.id && body.id.length > 0 ? body.id : randomUUID();
      await collections.devices.updateOne(
        { resourceId },
        {
          $setOnInsert: { resourceId, createdAt: new Date() },
          $set: { label: body.label, type: body.type },
        },
        { upsert: true },
      );
      const device = await collections.devices.findOne({ resourceId });
      reply.code(201);
      return {
        device: device
          ? {
              id: device.resourceId,
              label: device.label,
              type: device.type,
              lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
            }
          : null,
      };
    },
  );

  app.put(
    '/admin/devices/:deviceId',
    { preHandler: app.authenticate, schema: { body: deviceInputSchema } },
    async (request) => {
      const { deviceId } = request.params as { deviceId: string };
      const collections = await request.getTenantCollections();
      const body = request.body as { label: string; type: 'kiosk' | 'tablet' | 'mobile' };
      await collections.devices.updateOne(
        { resourceId: deviceId },
        { $set: { label: body.label, type: body.type } },
      );
      const device = await collections.devices.findOne({ resourceId: deviceId });
      return {
        device: device
          ? {
              id: device.resourceId,
              label: device.label,
              type: device.type,
              lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
            }
          : null,
      };
    },
  );

  app.post(
    '/admin/devices/:deviceId/ping',
    { preHandler: app.authenticate },
    async (request) => {
      const { deviceId } = request.params as { deviceId: string };
      const collections = await request.getTenantCollections();
      const now = new Date();
      await collections.devices.updateOne(
        { resourceId: deviceId },
        { $set: { lastSeenAt: now } },
      );
      const device = await collections.devices.findOne({ resourceId: deviceId });
      return {
        device: device
          ? {
              id: device.resourceId,
              label: device.label,
              type: device.type,
              lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
            }
          : null,
      };
    },
  );

  app.get(
    '/admin/orders',
    { preHandler: app.authenticate },
    async (request) => {
      const collections = await request.getTenantCollections();
      const orders = await collections.orders
        .find({}, { sort: { submittedAt: -1 }, limit: 100 })
        .toArray();

      return {
        orders: orders.map((order) => ({
          id: order.resourceId,
          status: order.status,
          total: order.total,
          currency: order.currency,
          submittedAt: order.submittedAt.toISOString(),
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          customer: order.customer ?? null,
          notes: order.notes ?? null,
        })),
      };
    },
  );

  app.post(
    '/admin/reports/daily-sales/run',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const collections = await request.getTenantCollections();
      const { date } = (request.body ?? {}) as { date?: string };
      const rangeStart = date ? new Date(date) : new Date();
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 1);

      const payload = await calculateDailySalesPayload(collections, rangeStart, rangeEnd);
      const resourceId = randomUUID();
      await collections.reports.insertOne({
        resourceId,
        reportType: 'daily-sales',
        rangeStart,
        rangeEnd,
        generatedAt: new Date(),
        payload,
      });

      const report = await collections.reports.findOne({ resourceId });
      reply.code(201);
      return { report: report ? formatReport(report) : null };
    },
  );

  app.post(
    '/admin/reports/popular-items/run',
    { preHandler: app.authenticate },
    async (request, reply) => {
      const collections = await request.getTenantCollections();
      const { days } = (request.body ?? {}) as { days?: number };
      const windowDays = Number.isFinite(days) && days && days > 0 ? days : 7;
      const rangeEnd = new Date();
      const rangeStart = new Date(rangeEnd);
      rangeStart.setDate(rangeEnd.getDate() - windowDays);

      const payload = await calculatePopularItemsPayload(collections, rangeStart, rangeEnd);
      const resourceId = randomUUID();
      await collections.reports.insertOne({
        resourceId,
        reportType: 'popular-items',
        rangeStart,
        rangeEnd,
        generatedAt: new Date(),
        payload,
      });

      const report = await collections.reports.findOne({ resourceId });
      reply.code(201);
      return { report: report ? formatReport(report) : null };
    },
  );

  app.get(
    '/admin/reports/:type',
    { preHandler: app.authenticate },
    async (request) => {
      const { type } = request.params as { type: 'daily-sales' | 'popular-items' };
      const collections = await request.getTenantCollections();
      const reports = await collections.reports
        .find({ reportType: type }, { sort: { generatedAt: -1 }, limit: 20 })
        .toArray();

      return { reports: reports.map(formatReport) };
    },
  );
}
