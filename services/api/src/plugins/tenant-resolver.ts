import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';

const resolveTenantId = (request: FastifyRequest): string | null => {
  const hostHeader = request.headers.host;
  if (!hostHeader) {
    return null;
  }

  const host = hostHeader.split(':')[0];

  if (config.tenantHostMap[host]) {
    return config.tenantHostMap[host];
  }

  if (config.baseDomain && host.endsWith(config.baseDomain)) {
    const subdomain = host.replace(`.${config.baseDomain}`, '');
    if (subdomain && subdomain !== host) {
      return subdomain;
    }
  }

  return null;
};

const denyUnknownTenant = async (reply: FastifyReply): Promise<void> => {
  reply.code(400).send({ message: 'Unknown tenant' });
};

export const tenantResolverPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorateRequest('tenantId', null);

  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const path = request.raw.url?.split('?')[0];
    if (path === '/healthz') {
      request.tenantId = 'system';
      request.log = request.log.child({ tenantId: 'system' });
      return;
    }

    const tenantId = resolveTenantId(request);

    if (!tenantId) {
      await denyUnknownTenant(reply);
      return reply; // early exit
    }

    request.tenantId = tenantId;
    request.log = request.log.child({ tenantId });
  });
});

export default tenantResolverPlugin;
