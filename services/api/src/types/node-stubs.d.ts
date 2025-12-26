// Minimal Node.js type declarations to support API service compilation without @types/node.
// These definitions cover only the APIs used within the service and intentionally remain partial.

type BufferEncoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex';

interface Buffer extends Uint8Array {
  readonly length: number;
  toString(encoding?: BufferEncoding): string;
}

declare const Buffer: {
  from(data: string | ArrayBufferView, encoding?: BufferEncoding): Buffer;
  from(data: ArrayBufferView): Buffer;
};

declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

interface NodeModule {
  exports: unknown;
}

declare const module: NodeModule & { exports: unknown };

declare const require: {
  main: NodeModule | undefined;
};

declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
}

declare module 'crypto' {
  type BinaryLike = string | ArrayBufferView;

  interface Hmac {
    update(data: BinaryLike): this;
    digest(): Buffer;
    digest(encoding: BufferEncoding): string;
  }

  export function randomUUID(): string;
  export function randomBytes(size: number): Buffer;
  export function pbkdf2Sync(
    password: BinaryLike,
    salt: BinaryLike,
    iterations: number,
    keylen: number,
    digest: string,
  ): Buffer;
  export function createHmac(algorithm: string, key: BinaryLike): Hmac;
  export function timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean;
}

declare module 'http' {
  interface ServerResponse {
    write(chunk: string): boolean;
    setHeader(name: string, value: string): void;
    end(chunk?: string): void;
    flushHeaders?(): void;
  }

  interface IncomingMessage {
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (error: unknown) => void): this;
  }

  export { ServerResponse, IncomingMessage };
}
