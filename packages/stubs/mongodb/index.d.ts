export type Document = Record<string, unknown>;
export type Filter<T> = Partial<T> & Record<string, unknown>;
export type FindOptions<T> = Record<string, unknown>;
export type OptionalUnlessRequiredId<T> = T;
export type UpdateFilter<T> = { $set?: Partial<T> } & Record<string, unknown>;
export type UpdateOptions = Record<string, unknown>;
export type DeleteOptions = Record<string, unknown>;

export class Collection<TSchema = Document> {
  find(filter?: Filter<TSchema>, options?: FindOptions<TSchema>): any;
  findOne(filter?: Filter<TSchema>, options?: FindOptions<TSchema>): Promise<TSchema | null>;
  insertOne(document: any): Promise<{ insertedId: string }>;
  updateOne(filter: Filter<TSchema>, update: UpdateFilter<TSchema>, options?: UpdateOptions): Promise<{ matchedCount: number; modifiedCount: number }>;
  deleteOne(filter?: Filter<TSchema>, options?: DeleteOptions): Promise<{ deletedCount: number }>;
  createIndex(keys: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
}

export class Db {
  collection<TSchema = Document>(name: string): Collection<TSchema>;
}

export class MongoClient {
  constructor(uri: string);
  connect(): Promise<this>;
  db(name: string): Db;
  close(): Promise<void>;
}
