export interface PinoLogger {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  child: (bindings: Record<string, unknown>) => PinoLogger;
}

declare function pino(options?: Record<string, unknown>): PinoLogger;

export default pino;
