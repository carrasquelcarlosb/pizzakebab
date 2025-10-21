import 'fastify';
import { getTenantCollections, TenantCollections } from '../db/mongo';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
    getTenantCollections: () => Promise<TenantCollections>;
  }

  interface FastifyInstance {
    getTenantCollections: typeof getTenantCollections;
  }
}
