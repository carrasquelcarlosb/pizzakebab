import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '../config';

type AdminJwtPayload = {
  adminId: string;
  tenantId: string;
  exp: number;
};

const base64UrlEncode = (value: Buffer | string): string => {
  return Buffer.from(value).toString('base64url');
};

const base64UrlDecode = (value: string): Buffer => {
  return Buffer.from(value, 'base64url');
};

const signToken = (payload: AdminJwtPayload): string => {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', config.adminJwtSecret)
    .update(`${header}.${body}`)
    .digest();
  const sig = base64UrlEncode(signature);
  return `${header}.${body}.${sig}`;
};

const verifyToken = (token: string): AdminJwtPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const expectedSignature = createHmac('sha256', config.adminJwtSecret)
    .update(`${headerPart}.${payloadPart}`)
    .digest();
  const providedSignature = base64UrlDecode(signaturePart);

  if (expectedSignature.length !== providedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart).toString()) as AdminJwtPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
};

const extractToken = (request: FastifyRequest): string | null => {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((entry) => entry.trim());
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === 'admin_token') {
      return rest.join('=');
    }
  }

  return null;
};

const setTokenCookie = (reply: FastifyReply, token: string): void => {
  const maxAge = config.adminSessionTtlSeconds;
  reply.header('set-cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
};

const clearTokenCookie = (reply: FastifyReply): void => {
  reply.header('set-cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
};

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorate('signAdminToken', (payload: Omit<AdminJwtPayload, 'exp'>) => {
    const exp = Math.floor(Date.now() / 1000) + config.adminSessionTtlSeconds;
    return signToken({ ...payload, exp });
  });

  fastify.decorate('setAdminSessionCookie', setTokenCookie);
  fastify.decorate('clearAdminSessionCookie', clearTokenCookie);

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    const token = extractToken(request);
    if (!token) {
      reply.code(401);
      throw new Error('Missing authentication token');
    }

    const payload = verifyToken(token);
    if (!payload || payload.tenantId !== request.tenantId) {
      reply.code(401);
      throw new Error('Invalid authentication token');
    }

    const collections = await request.getTenantCollections();
    const adminUser = await collections.adminUsers.findOne({ resourceId: payload.adminId });
    if (!adminUser) {
      reply.code(401);
      throw new Error('Unknown administrator');
    }

    request.adminUser = {
      id: adminUser.resourceId,
      email: adminUser.email,
      name: adminUser.name,
      roles: adminUser.roles,
    };
  });
});

export type AdminUserSession = {
  id: string;
  email: string;
  name?: string;
  roles: string[];
};

export default authPlugin;
