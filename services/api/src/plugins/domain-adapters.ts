import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { createRequestTenantContextProvider } from '../adapters';

export const domainAdaptersPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorateRequest('getTenantContext', function (this: FastifyRequest) {
    if (!this.tenantContextProvider) {
      this.tenantContextProvider = createRequestTenantContextProvider(this);
    }
    return this.tenantContextProvider;
  });
});

export default domainAdaptersPlugin;
