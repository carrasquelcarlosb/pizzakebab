// Lightweight module declarations to allow TypeScript compilation without installing runtime dependencies.

declare module 'dotenv' {
  const dotenv: {
    config(): void;
  };
  export default dotenv;
}

declare module 'pino' {
  type PinoLogger = {
    info: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    child: (...args: unknown[]) => PinoLogger;
  };
  function pino(options?: Record<string, unknown>): PinoLogger;
  export default pino;
}

declare module 'fastify' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface FastifyBaseLogger {
    info: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  }

  export interface FastifyRequest {
    headers: Record<string, string | undefined>;
    raw: IncomingMessage & { url?: string };
    tenantId: string;
    getTenantCollections: () => Promise<any>;
    tenantContextProvider?: unknown;
    getTenantContext: () => any;
    adminUser?: unknown;
    body: any;
    params: any;
    query?: any;
    log: any;
  }

  export interface FastifyReply {
    raw: ServerResponse;
    code(statusCode: number): FastifyReply;
    header(name: string, value: string): FastifyReply;
    send(payload: unknown): FastifyReply;
  }

  export type RouteOptions = Record<string, unknown>;

  export type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown> | unknown;

  export interface FastifyInstance {
    register(plugin: unknown, opts?: Record<string, unknown>): FastifyInstance;
    decorate(name: string, value: unknown): void;
    decorateRequest(name: string, defaultValue: unknown): void;
    addHook(name: string, hook: (...args: unknown[]) => Promise<unknown> | unknown): void;
    get<RouteGeneric = any>(
      path: string,
      options: RouteOptions | RouteHandler,
      handler?: RouteHandler,
    ): FastifyInstance;
    post<RouteGeneric = any>(
      path: string,
      options: RouteOptions | RouteHandler,
      handler?: RouteHandler,
    ): FastifyInstance;
    put<RouteGeneric = any>(
      path: string,
      options: RouteOptions | RouteHandler,
      handler?: RouteHandler,
    ): FastifyInstance;
    delete<RouteGeneric = any>(
      path: string,
      options: RouteOptions | RouteHandler,
      handler?: RouteHandler,
    ): FastifyInstance;
    patch<RouteGeneric = any>(
      path: string,
      options: RouteOptions | RouteHandler,
      handler?: RouteHandler,
    ): FastifyInstance;
    listen(options: { port: number; host?: string }): Promise<void>;
    log: any;
  }

  function fastify(options?: Record<string, unknown>): FastifyInstance;
  export default fastify;
  export { FastifyInstance, FastifyReply, FastifyRequest, FastifyBaseLogger };
}

declare module 'fastify-plugin' {
  import type { FastifyInstance } from 'fastify';

  type FastifyPlugin = (instance: FastifyInstance, opts: Record<string, unknown>) => Promise<void> | void;
  function fp<T extends FastifyPlugin>(plugin: T): T;
  export default fp;
}

declare module 'mongodb' {
  export type Document = Record<string, unknown>;
  export type Filter<T> = any;
  export type FindOptions<T> = any;
  export type OptionalUnlessRequiredId<T> = T;
  export type UpdateFilter<T> = any;
  export type UpdateOptions = any;
  export type DeleteOptions = any;

  export class Collection<TSchema = Document> {
    find(filter?: Filter<TSchema>, options?: FindOptions<TSchema>): any;
    findOne(filter?: Filter<TSchema>, options?: FindOptions<TSchema>): Promise<TSchema | null>;
    insertOne(document: any): Promise<{ insertedId: string }>;
    updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options?: UpdateOptions): Promise<{
      matchedCount: number;
      modifiedCount: number;
    }>;
    deleteOne(filter?: Filter<TSchema>, options?: DeleteOptions): Promise<{ deletedCount: number }>;
    createIndex(keys: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
  }

  export class Db {
    collection<TSchema = Document>(name: string): Collection<TSchema>;
  }

  export class MongoClient {
    constructor(uri: string);
    connect(): Promise<void>;
    db(name: string): Db;
    close(): Promise<void>;
  }
}
