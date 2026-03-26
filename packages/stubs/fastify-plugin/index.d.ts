import type { FastifyInstance } from 'fastify';

type FastifyPluginCallback = (instance: FastifyInstance, opts: Record<string, unknown>) => Promise<void> | void;

declare function fastifyPlugin<T extends FastifyPluginCallback>(fn: T): T;

export default fastifyPlugin;
export = fastifyPlugin;
