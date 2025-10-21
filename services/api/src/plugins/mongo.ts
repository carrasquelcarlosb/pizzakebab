import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { ensureIndexes, getTenantCollections, closeMongo, TenantCollections } from '../db/mongo';

export const mongoPlugin = fp(async (fastify: FastifyInstance) => {
  await ensureIndexes();
  fastify.decorate('getTenantCollections', getTenantCollections);
  fastify.decorateRequest('getTenantCollections', async function (this: FastifyRequest): Promise<TenantCollections> {
    if (!this.tenantId) {
      throw new Error('tenantId is not set on the request context');
    }
    return fastify.getTenantCollections(this.tenantId);
  });

  fastify.addHook('onClose', async () => {
    await closeMongo();
  });
});

export default mongoPlugin;
