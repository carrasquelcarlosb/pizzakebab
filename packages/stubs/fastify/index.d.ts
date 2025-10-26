import { IncomingMessage, ServerResponse } from 'http';

export interface FastifyBaseLogger {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => FastifyBaseLogger;
}

export interface FastifyRequest {
  headers: Record<string, string | undefined>;
  raw: IncomingMessage & { url?: string };
  tenantId: string | undefined;
  getTenantCollections: () => Promise<any>;
  tenantContextProvider?: unknown;
  getTenantContext: () => any;
  adminUser?: unknown;
  body: any;
  params: any;
  query?: any;
  log: FastifyBaseLogger;
}

export interface FastifyReply {
  raw: ServerResponse;
  code(statusCode: number): FastifyReply;
  header(name: string, value: string): FastifyReply;
  send(payload: unknown): FastifyReply;
}

export type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown;

export interface FastifyInstance {
  register(plugin: unknown, opts?: Record<string, unknown>): FastifyInstance | Promise<FastifyInstance>;
  decorate(name: string, value: unknown): void;
  decorateRequest(name: string, defaultValue: unknown): void;
  addHook(name: string, hook: (...args: unknown[]) => Promise<unknown> | unknown): void;
  get(path: string, options: Record<string, unknown> | RouteHandler, handler?: RouteHandler): FastifyInstance;
  post(path: string, options: Record<string, unknown> | RouteHandler, handler?: RouteHandler): FastifyInstance;
  put(path: string, options: Record<string, unknown> | RouteHandler, handler?: RouteHandler): FastifyInstance;
  delete(path: string, options: Record<string, unknown> | RouteHandler, handler?: RouteHandler): FastifyInstance;
  patch(path: string, options: Record<string, unknown> | RouteHandler, handler?: RouteHandler): FastifyInstance;
  listen(options: { port: number; host?: string }): Promise<void>;
  close(): Promise<void>;
  log: FastifyBaseLogger;
}

export default function fastify(options?: Record<string, unknown>): FastifyInstance;
export { FastifyInstance, FastifyReply, FastifyRequest };
