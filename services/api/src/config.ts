import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export interface AppConfig {
  port: number;
  mongoUri: string;
  mongoDbName: string;
  tenantHostMap: Record<string, string>;
  baseDomain?: string;
  adminJwtSecret: string;
  adminSessionTtlSeconds: number;
}

const parseTenantMap = (raw: string | undefined): Record<string, string> => {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed;
  } catch (error) {
    const map: Record<string, string> = {};
    for (const pair of raw.split(',')) {
      const [tenantId, host] = pair.split('=');
      if (tenantId && host) {
        map[host.trim()] = tenantId.trim();
      }
    }
    return map;
  }
};

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: requiredEnv('MONGO_URI'),
  mongoDbName: requiredEnv('MONGO_DB_NAME'),
  tenantHostMap: parseTenantMap(process.env.TENANT_HOST_MAP),
  baseDomain: process.env.TENANT_BASE_DOMAIN,
  adminJwtSecret: requiredEnv('ADMIN_JWT_SECRET'),
  adminSessionTtlSeconds: Number.parseInt(process.env.ADMIN_SESSION_TTL ?? '3600', 10),
};
