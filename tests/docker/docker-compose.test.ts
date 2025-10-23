import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type ComposeConfig = Record<string, unknown>;

type StackEntry = {
  indent: number;
  container: any;
  key?: string;
};

const parseValue = (value: string) => {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed.replace(/'/g, '"'));
    } catch (error) {
      return trimmed;
    }
  }
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  return trimmed;
};

const findNextMeaningfulLine = (lines: string[], startIndex: number): string | undefined => {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }
    return trimmed;
  }
  return undefined;
};

const parseCompose = (content: string): ComposeConfig => {
  const root: ComposeConfig = {};
  const stack: StackEntry[] = [{ indent: -1, container: root }];
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }

    const indent = line.length - trimmed.length;

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (trimmed.startsWith('- ')) {
      const value = parseValue(trimmed.slice(2));
      if (Array.isArray(parent.container)) {
        parent.container.push(value);
      } else if (parent.key) {
        const target = parent.container[parent.key];
        if (!Array.isArray(target)) {
          parent.container[parent.key] = [];
        }
        (parent.container[parent.key] as unknown[]).push(value);
      }
      continue;
    }

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const valuePart = trimmed.slice(separatorIndex + 1).trim();

    if (valuePart.length === 0) {
      const nextLine = findNextMeaningfulLine(lines, index) ?? '';
      const isArray = nextLine.startsWith('- ');
      const container = isArray ? [] : {};
      (parent.container as Record<string, unknown>)[key] = container;
      stack.push({ indent, container, key });
    } else {
      (parent.container as Record<string, unknown>)[key] = parseValue(valuePart);
    }
  }

  return root;
};

describe('docker-compose configuration', () => {
  const composePath = resolve(process.cwd(), 'docker-compose.yml');
  const document = readFileSync(composePath, 'utf8');
  const config = parseCompose(document) as any;

  it('defines a MongoDB service with persistent storage', () => {
    const mongo = config?.services?.mongo;
    assert.ok(mongo, 'Mongo service should be defined');
    assert.equal(mongo.image, 'mongo:6.0');
    assert.deepEqual(mongo.ports, ['27017:27017']);
    assert.equal(mongo.environment?.MONGO_INITDB_ROOT_USERNAME, 'root');
    assert.equal(mongo.environment?.MONGO_INITDB_ROOT_PASSWORD, 'example');
    assert.deepEqual(mongo.volumes, ['mongo-data:/data/db']);
  });

  it('connects the API service to Mongo with the expected defaults', () => {
    const api = config?.services?.api;
    assert.ok(api, 'API service should be defined');
    assert.equal(api.depends_on?.[0], 'mongo');
    assert.deepEqual(api.environment, {
      PORT: 4000,
      MONGO_URI: 'mongodb://root:example@mongo:27017/?authSource=admin',
      MONGO_DB_NAME: 'pizzakebab',
      TENANT_HOST_MAP: '{"localhost":"demo"}',
      TENANT_BASE_DOMAIN: 'localhost',
    });
    assert.deepEqual(api.ports, ['4000:4000']);
    assert.deepEqual(api.command, ['npm', 'run', 'api:start']);
  });
});
