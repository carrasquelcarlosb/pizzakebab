import { MongoClient, Db, Collection, Filter, FindOptions, OptionalUnlessRequiredId, UpdateFilter, UpdateOptions, DeleteOptions, Document } from 'mongodb';
import { config } from '../config';
import { COLLECTION_NAMES, TenantCollectionsShape } from './schemas';

let client: MongoClient | null = null;
let database: Db | null = null;

const ensureClient = async (): Promise<MongoClient> => {
  if (!client) {
    client = new MongoClient(config.mongoUri);
    await client.connect();
    return client;
  }

  return client;
};

const ensureDatabase = async (): Promise<Db> => {
  if (database) {
    return database;
  }

  const connectedClient = await ensureClient();
  database = connectedClient.db(config.mongoDbName);
  return database;
};

export const closeMongo = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};

export type TenantCollection<TSchema extends Document> = {
  find(filter?: Filter<TSchema>, options?: FindOptions<TSchema>): ReturnType<Collection<TSchema>['find']>;
  findOne(filter?: Filter<TSchema>, options?: FindOptions<TSchema>): ReturnType<Collection<TSchema>['findOne']>;
  insertOne(document: OptionalUnlessRequiredId<Omit<TSchema, 'tenantId'>>): ReturnType<Collection<TSchema>['insertOne']>;
  updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options?: UpdateOptions): ReturnType<Collection<TSchema>['updateOne']>;
  deleteOne(filter?: Filter<TSchema>, options?: DeleteOptions): ReturnType<Collection<TSchema>['deleteOne']>;
};

const createTenantCollection = <TSchema extends { tenantId: string } & Document>(
  collection: Collection<TSchema>,
  tenantId: string,
): TenantCollection<TSchema> => {
  const buildScopedFilter = (filter: Filter<TSchema> = {} as Filter<TSchema>): Filter<TSchema> => {
    if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
      const sanitizedFilter = { ...(filter as Record<string, unknown>) };
      delete (sanitizedFilter as { tenantId?: unknown }).tenantId;
      return { ...(sanitizedFilter as Filter<TSchema>), tenantId } as Filter<TSchema>;
    }
    return { tenantId } as Filter<TSchema>;
  };

  const sanitizeUpdatePayload = (
    update: UpdateFilter<TSchema>,
  ): UpdateFilter<TSchema> => {
    const protectedKeys = new Set(['tenantId', 'resourceId']);

    if (update && typeof update === 'object' && !Array.isArray(update)) {
      const clonedUpdate = { ...(update as Record<string, unknown>) };
      const modifierKeys = Object.keys(clonedUpdate).filter((key) => key.startsWith('$'));

      if (modifierKeys.length === 0) {
        protectedKeys.forEach((key) => {
          if (key in clonedUpdate) {
            delete clonedUpdate[key];
          }
        });
        return clonedUpdate as UpdateFilter<TSchema>;
      }

      modifierKeys.forEach((modifierKey) => {
        const modifierValue = clonedUpdate[modifierKey];
        if (modifierValue && typeof modifierValue === 'object' && !Array.isArray(modifierValue)) {
          const clonedModifier = { ...(modifierValue as Record<string, unknown>) };
          let mutated = false;

          protectedKeys.forEach((key) => {
            if (key in clonedModifier) {
              delete clonedModifier[key];
              mutated = true;
            }
          });

          if (mutated) {
            clonedUpdate[modifierKey] = clonedModifier;
          }
        }
      });

      return clonedUpdate as UpdateFilter<TSchema>;
    }

    return update;
  };

  const appendUpdatedTimestamp = (
    update: UpdateFilter<TSchema>,
  ): UpdateFilter<TSchema> => {
    const timestamp = new Date();

    if (typeof update === 'object' && update !== null && !Array.isArray(update)) {
      const modifierKeys = Object.keys(update).filter((key) => key.startsWith('$'));

      if (modifierKeys.length === 0) {
        return { ...(update as Record<string, unknown>), updatedAt: timestamp } as UpdateFilter<TSchema>;
      }

      const $set = { ...((update as UpdateFilter<TSchema>).$set ?? {}), updatedAt: timestamp };
      return { ...(update as UpdateFilter<TSchema>), $set };
    }

    return update;
  };

  return {
    find(filter = {}, options) {
      return collection.find(buildScopedFilter(filter), options);
    },
    findOne(filter = {}, options) {
      return collection.findOne(buildScopedFilter(filter), options);
    },
  insertOne(document) {
    const now = new Date();
    const payload = {
      ...(document as TSchema),
      tenantId,
      createdAt: (document as Partial<TSchema>).createdAt ?? now,
      updatedAt: (document as Partial<TSchema>).updatedAt ?? now,
    };
    return collection.insertOne(payload as OptionalUnlessRequiredId<TSchema>);
  },
  updateOne(filter, update, options) {
    const sanitizedUpdate = sanitizeUpdatePayload(update);
    const updateWithTimestamp = appendUpdatedTimestamp(sanitizedUpdate);

    return collection.updateOne(buildScopedFilter(filter), updateWithTimestamp, options);
  },
  deleteOne(filter = {}, options) {
    return collection.deleteOne(buildScopedFilter(filter), options);
  },
  };
};

export type TenantCollections = {
  [K in keyof TenantCollectionsShape]: TenantCollection<TenantCollectionsShape[K]>;
};

export const getTenantCollections = async (tenantId: string): Promise<TenantCollections> => {
  const db = await ensureDatabase();
  const collectionEntries = (Object.keys(COLLECTION_NAMES) as Array<keyof TenantCollectionsShape>).map((key) => {
    const collectionName = COLLECTION_NAMES[key];
    const collection = db.collection<TenantCollectionsShape[typeof key]>(collectionName);
    return [key, createTenantCollection(collection, tenantId)] as const;
  });

  return Object.fromEntries(collectionEntries) as TenantCollections;
};

export const ensureIndexes = async (): Promise<void> => {
  const db = await ensureDatabase();
  await Promise.all(
    Object.values(COLLECTION_NAMES).map(async (collectionName) => {
      const collection = db.collection(collectionName);
      await collection.createIndex({ tenantId: 1, resourceId: 1 }, { unique: true });
    }),
  );
};

export const getMongoClient = async (): Promise<MongoClient> => ensureClient();
export const getDatabase = async (): Promise<Db> => ensureDatabase();
