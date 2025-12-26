class FastifyReply {
  constructor(logger) {
    this.logger = logger;
    this.statusCode = 200;
    this.headers = {};
    this.sent = false;
    this.payload = undefined;
    this.raw = {};
  }

  code(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  header(name, value) {
    const key = name.toLowerCase();
    const existing = this.headers[key];
    if (existing === undefined) {
      this.headers[key] = value;
    } else if (Array.isArray(existing)) {
      this.headers[key] = [...existing, value];
    } else {
      this.headers[key] = [existing, value];
    }
    return this;
  }

  send(payload) {
    this.payload = payload;
    this.sent = true;
    return this;
  }

  toResponse() {
    const body = typeof this.payload === 'string' ? this.payload : JSON.stringify(this.payload ?? null);
    return {
      statusCode: this.statusCode,
      headers: { ...this.headers },
      body,
      json: () => (typeof this.payload === 'string' ? JSON.parse(this.payload) : this.payload),
    };
  }
}

const createLogger = (loggerOptions) => {
  const fallback = {
    info: () => {},
    error: () => {},
    child: () => fallback,
  };

  if (!loggerOptions) {
    return fallback;
  }

  if (typeof loggerOptions === 'object' && loggerOptions !== null) {
    const base = {
      info: typeof loggerOptions.info === 'function' ? loggerOptions.info.bind(loggerOptions) : fallback.info,
      error: typeof loggerOptions.error === 'function' ? loggerOptions.error.bind(loggerOptions) : fallback.error,
    };
    base.child = typeof loggerOptions.child === 'function'
      ? (bindings) => loggerOptions.child.call(loggerOptions, bindings)
      : () => base;
    return { ...fallback, ...base };
  }

  return fallback;
};

const pathToRegex = (path) => {
  const segments = path.split('/').filter(Boolean);
  const parts = segments.map((segment) => {
    if (segment.startsWith(':')) {
      const name = segment.slice(1);
      return `(?<${name}>[^/]+)`;
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  const pattern = `^/${parts.join('/')}$`;
  return new RegExp(pattern);
};

class FastifyInstance {
  constructor(options = {}) {
    this.options = options;
    this.log = createLogger(options.logger);
    this.requestDecorators = new Map();
    this.hooks = new Map();
    this.routes = [];
    this.decorate('close', this.close.bind(this));
  }

  decorate(name, value) {
    this[name] = value;
    return this;
  }

  decorateRequest(name, defaultValue) {
    this.requestDecorators.set(name, defaultValue);
    return this;
  }

  addHook(name, hook) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push(hook);
    return this;
  }

  async register(plugin, opts = {}) {
    const handler = typeof plugin === 'function' ? plugin : plugin?.default;
    if (typeof handler !== 'function') {
      return this;
    }
    await handler(this, opts);
    return this;
  }

  route(method, path, opts, handler) {
    if (typeof opts === 'function') {
      handler = opts;
      opts = {};
    }
    this.routes.push({
      method: method.toUpperCase(),
      path,
      matcher: pathToRegex(path),
      handler,
      options: opts ?? {},
    });
    return this;
  }

  get(path, opts, handler) {
    return this.route('GET', path, opts, handler);
  }

  post(path, opts, handler) {
    return this.route('POST', path, opts, handler);
  }

  put(path, opts, handler) {
    return this.route('PUT', path, opts, handler);
  }

  delete(path, opts, handler) {
    return this.route('DELETE', path, opts, handler);
  }

  patch(path, opts, handler) {
    return this.route('PATCH', path, opts, handler);
  }

  async inject({ method, url, headers = {}, payload }) {
    const [pathPart, queryString] = url.split('?');
    const route = this.routes.find((entry) => entry.method === method.toUpperCase() && entry.matcher.test(pathPart));
    if (!route) {
      throw new Error(`No route registered for ${method.toUpperCase()} ${url}`);
    }

    const match = route.matcher.exec(pathPart);
    const params = match?.groups ? { ...match.groups } : {};

    const request = {
      headers: { ...headers },
      raw: { url },
      params,
      query: Object.fromEntries(new URLSearchParams(queryString ?? '')),
      body: payload ?? null,
      tenantId: undefined,
      log: this.log,
    };

    for (const [name, value] of this.requestDecorators.entries()) {
      if (typeof value === 'function') {
        request[name] = value.bind(request);
      } else {
        request[name] = value;
      }
    }

    const reply = new FastifyReply(this.log);

    const runHooks = async (hookName) => {
      const hooks = this.hooks.get(hookName) ?? [];
      for (const hook of hooks) {
        const result = await hook(request, reply);
        if (result === reply || reply.sent) {
          return true;
        }
      }
      return false;
    };

    const halted = await runHooks('onRequest');
    if (halted) {
      return reply.toResponse();
    }

    const result = await route.handler(request, reply);
    if (result !== undefined && result !== reply && !reply.sent) {
      reply.send(result);
    }

    return reply.toResponse();
  }

  async listen() {
    return;
  }

  async ready() {
    return this;
  }

  async close() {
    const hooks = this.hooks.get('onClose') ?? [];
    for (const hook of hooks) {
      await hook();
    }
  }
}

function fastify(options) {
  return new FastifyInstance(options);
}

module.exports = fastify;
module.exports.default = fastify;
module.exports.FastifyInstance = FastifyInstance;
module.exports.FastifyReply = FastifyReply;
module.exports.FastifyRequest = Object;
module.exports.fastify = fastify;
