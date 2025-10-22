import {
  MongoClient,
  Db,
  Collection,
  Filter,
  FindOptions,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  DeleteOptions,
  Document,
} from 'mongodb';
import { config } from '../config';
import { COLLECTION_NAMES, TenantCollectionsShape } from './schemas';
import {
  appendUpdatedTimestamp,
  buildTenantScopedFilter,
  sanitizeTenantScopedUpdate,
} from './tenant-helpers';

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
  updateOne(
    filter: Filter<TSchema>,
    update: UpdateFilter<TSchema>,
    options?: UpdateOptions,
  ): ReturnType<Collection<TSchema>['updateOne']>;
  deleteOne(filter?: Filter<TSchema>, options?: DeleteOptions): ReturnType<Collection<TSchema>['deleteOne']>;
};

const createTenantCollection = <TSchema extends { tenantId: string } & Document>(
  collection: Collection<TSchema>,
  tenantId: string,
): TenantCollection<TSchema> => ({
  find(filter = {}, options) {
    return collection.find(buildTenantScopedFilter<TSchema>(tenantId, filter) as Filter<TSchema>, options);
  },
  findOne(filter = {}, options) {
    return collection.findOne(buildTenantScopedFilter<TSchema>(tenantId, filter) as Filter<TSchema>, options);
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
    const sanitizedUpdate = sanitizeTenantScopedUpdate(update) as UpdateFilter<TSchema>;
    const updateWithTimestamp = appendUpdatedTimestamp(sanitizedUpdate) as UpdateFilter<TSchema>;

    return collection.updateOne(
      buildTenantScopedFilter<TSchema>(tenantId, filter) as Filter<TSchema>,
      updateWithTimestamp,
      options,
    );
  },
  deleteOne(filter = {}, options) {
    return collection.deleteOne(buildTenantScopedFilter<TSchema>(tenantId, filter) as Filter<TSchema>, options);
  },
});

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

export { appendUpdatedTimestamp, buildTenantScopedFilter, sanitizeTenantScopedUpdate } from './tenant-helpers';
