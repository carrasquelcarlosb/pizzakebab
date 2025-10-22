import { randomUUID } from 'crypto';
import type { ServerResponse } from 'http';
import type { FastifyInstance } from 'fastify';
import type { DeviceDocument } from '../db/schemas';
import {
  acknowledgeKitchenTicket,
  getOutstandingKitchenTickets,
  type TicketAcknowledgementStatus,
} from '../services/kitchen-queue';
import { ticketStream } from '../services/ticket-stream';

const registerDeviceBodySchema = {
  type: 'object',
  properties: {
    deviceId: { type: ['string', 'null'] },
    label: { type: 'string' },
    type: { type: 'string', enum: ['kiosk', 'tablet', 'mobile', 'printer'] },
    capabilities: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    hardwareId: { type: ['string', 'null'] },
    metadata: { type: ['object', 'null'] },
  },
  required: ['label', 'type', 'capabilities'],
  additionalProperties: false,
} as const;

type RegisterDeviceBody = {
  deviceId?: string | null;
  label: string;
  type: DeviceDocument['type'];
  capabilities: string[];
  hardwareId?: string | null;
  metadata?: Record<string, unknown> | null;
};

const heartbeatBodySchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['online', 'offline'] },
    capabilities: { type: 'array', items: { type: 'string' } },
    metrics: { type: ['object', 'null'] },
  },
  additionalProperties: false,
} as const;

type DeviceHeartbeatBody = {
  status?: 'online' | 'offline';
  capabilities?: string[];
  metrics?: Record<string, unknown> | null;
};

const acknowledgementBodySchema = {
  type: 'object',
  properties: {
    deviceId: { type: 'string' },
    status: {
      type: 'string',
      enum: ['received', 'printing', 'printed', 'failed', 'completed'],
    },
    notes: { type: ['string', 'null'] },
  },
  required: ['deviceId', 'status'],
  additionalProperties: false,
} as const;

type TicketAcknowledgementBody = {
  deviceId: string;
  status: TicketAcknowledgementStatus;
  notes?: string | null;
};

type DeviceHeartbeatParams = { deviceId: string };
type TicketAcknowledgementParams = { ticketId: string };

const computeHealthState = (device: DeviceDocument, now: Date) => {
  const lastHeartbeatMs = device.lastHeartbeatAt?.getTime();
  const secondsSince =
    typeof lastHeartbeatMs === 'number' ? Math.floor((now.getTime() - lastHeartbeatMs) / 1000) : null;
  const state = secondsSince !== null && secondsSince <= 60 ? 'online' : 'offline';
  return {
    state,
    lastHeartbeatSecondsAgo: secondsSince,
  };
};

const formatDevice = (device: DeviceDocument, now = new Date()) => {
  const health = computeHealthState(device, now);
  return {
    id: device.resourceId,
    label: device.label,
    type: device.type,
    capabilities: device.capabilities,
    status: device.status ?? health.state,
    hardwareId: device.hardwareId ?? null,
    metadata: device.metadata ?? null,
    metrics: device.metrics ?? null,
    lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
    lastHeartbeatAt: device.lastHeartbeatAt?.toISOString() ?? null,
    createdAt: device.createdAt.toISOString(),
    updatedAt: device.updatedAt.toISOString(),
    health,
  };
};

const sendSseEvent = (reply: ServerResponse, event: string, data: unknown) => {
  reply.write(`event: ${event}\n`);
  reply.write(`data: ${JSON.stringify(data)}\n\n`);
};

export default async function devicesRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: RegisterDeviceBody }>(
    '/devices/register',
    {
      schema: {
        body: registerDeviceBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              device: { type: 'object' },
            },
            required: ['device'],
          },
          201: {
            type: 'object',
            properties: {
              device: { type: 'object' },
            },
            required: ['device'],
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId, label, type, capabilities, hardwareId, metadata } = request.body;
      const collections = await request.getTenantCollections();
      const now = new Date();
      const normalizedCapabilities = Array.from(new Set(capabilities ?? [])) as string[];

      let existing = null;
      if (hardwareId) {
        existing = await collections.devices.findOne({ hardwareId });
      }
      if (!existing && deviceId) {
        existing = await collections.devices.findOne({ resourceId: deviceId });
      }

      const resourceId = existing?.resourceId ?? deviceId ?? randomUUID();
      const payload: Partial<DeviceDocument> = {
        label,
        type,
        capabilities: normalizedCapabilities,
        hardwareId: hardwareId ?? undefined,
        metadata: metadata ?? undefined,
        status: 'online',
        lastSeenAt: now,
        lastHeartbeatAt: now,
      };

      if (existing) {
        await collections.devices.updateOne(
          { resourceId: existing.resourceId },
          { $set: payload },
        );
      } else {
        await collections.devices.insertOne({
          resourceId,
          label,
          type,
          capabilities: normalizedCapabilities,
          hardwareId: hardwareId ?? undefined,
          metadata: metadata ?? undefined,
          status: 'online',
          lastSeenAt: now,
          lastHeartbeatAt: now,
        });
      }

      const device = await collections.devices.findOne({ resourceId });
      if (!device) {
        reply.code(500);
        return { message: 'Failed to register device' };
      }

      const responseBody = { device: formatDevice(device, now) };
      reply.code(existing ? 200 : 201);
      return responseBody;
    },
  );

  app.post<{ Params: DeviceHeartbeatParams; Body: DeviceHeartbeatBody }>(
    '/devices/:deviceId/heartbeat',
    {
      schema: {
        body: heartbeatBodySchema,
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              device: { type: 'object' },
            },
            required: ['device'],
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params;
      const { status, capabilities, metrics } = request.body;
      const collections = await request.getTenantCollections();
      const now = new Date();

      const update: Partial<DeviceDocument> = {
        status: status ?? 'online',
        lastSeenAt: now,
        lastHeartbeatAt: now,
      };

      if (Array.isArray(capabilities) && capabilities.length > 0) {
        update.capabilities = Array.from(new Set(capabilities));
      }

      if (metrics !== undefined) {
        update.metrics = metrics ?? undefined;
      }

      const result = await collections.devices.updateOne(
        { resourceId: deviceId },
        { $set: update },
      );

      if (result.matchedCount === 0) {
        reply.code(404);
        return { message: 'Device not found' };
      }

      const device = await collections.devices.findOne({ resourceId: deviceId });
      if (!device) {
        reply.code(404);
        return { message: 'Device not found' };
      }

      return { device: formatDevice(device, now) };
    },
  );

  app.get('/devices/tickets/stream', async (request, reply) => {
    const tenantId = request.tenantId;
    const collections = await request.getTenantCollections();

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.flushHeaders?.();

    let closed = false;
    const sendEvent = (event: string, data: unknown) => {
      if (closed) {
        return;
      }
      sendSseEvent(reply.raw, event, data);
    };

    const unsubscribe = ticketStream.subscribe(tenantId, (event) => {
      sendEvent(event.type, event);
    });

    sendEvent('connected', { ts: new Date().toISOString() });

    const snapshot = await getOutstandingKitchenTickets(collections);
    sendEvent('tickets.snapshot', { tickets: snapshot });

    const heartbeat = setInterval(() => {
      sendEvent('ping', { ts: new Date().toISOString() });
    }, 30000);

    const cleanup = () => {
      if (closed) {
        return;
      }
      closed = true;
      clearInterval(heartbeat);
      unsubscribe();
    };

    request.raw.on('close', cleanup);
    request.raw.on('error', cleanup);

    await new Promise<void>((resolve) => {
      request.raw.on('close', resolve);
      request.raw.on('error', resolve);
    });

    cleanup();
  });

  app.post<{ Params: TicketAcknowledgementParams; Body: TicketAcknowledgementBody }>(
    '/devices/tickets/:ticketId/ack',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            ticketId: { type: 'string' },
          },
          required: ['ticketId'],
        },
        body: acknowledgementBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              ticket: { type: 'object' },
              acknowledgement: { type: 'object' },
            },
            required: ['ticket', 'acknowledgement'],
          },
        },
      },
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const { deviceId, status, notes } = request.body;
      const collections = await request.getTenantCollections();

      const device = await collections.devices.findOne({ resourceId: deviceId });
      if (!device) {
        reply.code(404);
        return { message: 'Device not found' };
      }

      const result = await acknowledgeKitchenTicket(request.tenantId, collections, request.log, {
        ticketId,
        deviceId,
        status,
        notes: notes ?? undefined,
      });

      if (!result) {
        reply.code(404);
        return { message: 'Ticket not found' };
      }

      return result;
    },
  );

  app.get(
    '/admin/devices/health',
    {
      preHandler: app.authenticate,
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              devices: { type: 'array', items: { type: 'object' } },
            },
            required: ['devices'],
          },
        },
      },
    },
    async (request) => {
      const collections = await request.getTenantCollections();
      const devices = await collections.devices.find().sort({ label: 1 }).toArray();
      const now = new Date();

      return {
        devices: devices.map((device) => formatDevice(device, now)),
      };
    },
  );
}
