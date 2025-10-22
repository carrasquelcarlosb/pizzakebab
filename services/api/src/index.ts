import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import pino from 'pino';
import { randomUUID } from 'crypto';
import { config } from './config';
import mongoPlugin from './plugins/mongo';
import tenantResolverPlugin from './plugins/tenant-resolver';
import menusRoutes from './routes/menus';
import cartsRoutes from './routes/carts';
import ordersRoutes from './routes/orders';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: undefined,
  transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
});

export const buildServer = (): FastifyInstance => {
  const app = fastify({
    logger,
    disableRequestLogging: true,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  });

  app.register(mongoPlugin);
  app.register(tenantResolverPlugin);
  app.register(menusRoutes);
  app.register(cartsRoutes);
  app.register(ordersRoutes);

  app.get('/healthz', async () => ({ status: 'ok' }));

  app.get('/readyz', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const collections = await request.getTenantCollections();
      await collections.tenants.findOne({ resourceId: request.tenantId });
      return { status: 'ready' };
    } catch (error) {
      request.log.error({ err: error }, 'readiness check failed');
      reply.code(500);
      return { status: 'error' };
    }
  });

  return app;
};

export const start = async () => {
  const app = buildServer();
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info({ port: config.port }, 'API service listening');
  } catch (error) {
    app.log.error({ err: error }, 'Failed to start API service');
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}
