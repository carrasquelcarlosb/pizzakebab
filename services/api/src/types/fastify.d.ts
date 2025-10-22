import 'fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { getTenantCollections, TenantCollections } from '../db/mongo';
import type { AdminUserSession } from '../plugins/auth';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
    getTenantCollections: () => Promise<TenantCollections>;
    adminUser?: AdminUserSession;
  }

  interface FastifyInstance {
    getTenantCollections: typeof getTenantCollections;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    signAdminToken: (payload: { adminId: string; tenantId: string }) => string;
    setAdminSessionCookie: (reply: FastifyReply, token: string) => void;
    clearAdminSessionCookie: (reply: FastifyReply) => void;
  }
}
