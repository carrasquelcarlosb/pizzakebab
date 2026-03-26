class QueryCursor {
  constructor(documents) {
    this._documents = documents.slice();
  }

  sort(criteria = {}) {
    const [field, direction] = Object.entries(criteria)[0] ?? [];
    if (field) {
      const multiplier = direction === -1 ? -1 : 1;
      this._documents.sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        return av > bv ? multiplier : -multiplier;
      });
    }
    return this;
  }

  limit(count) {
    if (typeof count === 'number') {
      this._documents = this._documents.slice(0, count);
    }
    return this;
  }

  async toArray() {
    return this._documents.map((doc) => ({ ...doc }));
  }
}

const matchesFilter = (document, filter = {}) => {
  return Object.entries(filter).every(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$in' in value && Array.isArray(value.$in)) {
        return value.$in.includes(document[key]);
      }
      if ('$ne' in value) {
        return document[key] !== value.$ne;
      }
      if ('$gte' in value || '$lt' in value) {
        const gte = value.$gte ?? -Infinity;
        const lt = value.$lt ?? Infinity;
        const docValue = document[key];
        return docValue >= gte && docValue < lt;
      }
    }
    return document[key] === value;
  });
};

class Collection {
  constructor(name) {
    this.name = name;
    this._documents = [];
  }

  async find(filter = {}) {
    const matches = this._documents.filter((doc) => matchesFilter(doc, filter));
    return new QueryCursor(matches);
  }

  async findOne(filter = {}) {
    const doc = this._documents.find((item) => matchesFilter(item, filter));
    return doc ? { ...doc } : null;
  }

  async insertOne(document) {
    const payload = { ...document };
    if (!payload._id) {
      payload._id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    this._documents.push(payload);
    return { insertedId: payload._id };
  }

  async updateOne(filter, update = {}) {
    const doc = this._documents.find((item) => matchesFilter(item, filter));
    if (!doc) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    if (typeof update === 'object' && update !== null) {
      if ('$set' in update) {
        Object.assign(doc, update.$set);
      } else {
        Object.assign(doc, update);
      }
    }

    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter = {}) {
    const index = this._documents.findIndex((item) => matchesFilter(item, filter));
    if (index === -1) {
      return { deletedCount: 0 };
    }
    this._documents.splice(index, 1);
    return { deletedCount: 1 };
  }

  async createIndex() {
    return;
  }
}

class Db {
  constructor(name) {
    this.name = name;
    this._collections = new Map();
  }

  collection(name) {
    if (!this._collections.has(name)) {
      this._collections.set(name, new Collection(name));
    }
    return this._collections.get(name);
  }
}

class MongoClient {
  constructor(uri) {
    this.uri = uri;
    this._databases = new Map();
  }

  async connect() {
    return this;
  }

  db(name) {
    if (!this._databases.has(name)) {
      this._databases.set(name, new Db(name));
    }
    return this._databases.get(name);
  }

  async close() {
    this._databases.clear();
  }
}

module.exports = {
  MongoClient,
  Db,
  Collection,
};
