const dataStore = require('./dataStore');

const normalizeQuery = (query = {}) => {
  if (!query || typeof query !== 'object') return {};
  return query;
};

const matchesQuery = (entry, query = {}) => {
  const normalized = normalizeQuery(query);
  if (!Object.keys(normalized).length) return true;

  for (const [key, expected] of Object.entries(normalized)) {
    if (key === '$or') {
      if (!Array.isArray(expected) || !expected.some((subQuery) => matchesQuery(entry, subQuery))) return false;
      continue;
    }

    if (key === '$and') {
      if (!Array.isArray(expected) || !expected.every((subQuery) => matchesQuery(entry, subQuery))) return false;
      continue;
    }

    const actual = entry[key];

    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if (expected.$ne !== undefined && String(actual) === String(expected.$ne)) return false;
      if (expected.$in && Array.isArray(expected.$in) && !expected.$in.some((item) => String(actual) === String(item))) return false;
      if (expected.$gte !== undefined && Number(actual ?? 0) < Number(expected.$gte)) return false;
      if (expected.$lte !== undefined && Number(actual ?? 0) > Number(expected.$lte)) return false;
      if (expected.$regex !== undefined) {
        const regex = new RegExp(expected.$regex, expected.$options || 'i');
        if (typeof actual !== 'string' || !regex.test(actual)) return false;
      }
      if (expected.$exists !== undefined) {
        const exists = actual !== undefined && actual !== null && actual !== '';
        if (exists !== expected.$exists) return false;
      }
      continue;
    }

    if (expected === undefined || expected === null || expected === '') continue;
    if (typeof actual === 'string' && typeof expected === 'string') {
      if (actual.toLowerCase() !== expected.toLowerCase()) return false;
      continue;
    }
    if (String(actual) !== String(expected)) return false;
  }

  return true;
};

const decorate = (collection, record) => {
  if (!record || typeof record !== 'object') return record;
  const copy = { ...record };

  copy.save = async () => {
    const store = dataStore.getStore();
    const index = store[collection].findIndex((entry) => String(entry._id) === String(copy._id));
    if (index >= 0) {
      store[collection][index] = { ...copy };
      dataStore.saveStore(store);
      return { ...copy };
    }
    store[collection].push({ ...copy });
    dataStore.saveStore(store);
    return { ...copy };
  };

  return copy;
};

const createLocalModel = ({ collectionName }) => ({
  findOne: async (query = {}) => {
    const store = dataStore.getStore();
    const found = store[collectionName].find((entry) => matchesQuery(entry, query));
    return found ? decorate(collectionName, found) : null;
  },

  findById: async (id) => {
    const store = dataStore.getStore();
    const found = store[collectionName].find((entry) => String(entry._id) === String(id));
    return found ? decorate(collectionName, found) : null;
  },

  find: (query = {}) => {
    const store = dataStore.getStore();
    return store[collectionName]
      .filter((entry) => matchesQuery(entry, query))
      .map((entry) => decorate(collectionName, entry));
  },

  create: async (payload = {}) => {
    const store = dataStore.getStore();
    const item = { ...payload, _id: payload._id || dataStore.generateId() };
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = item.updatedAt || new Date().toISOString();
    store[collectionName].push(item);
    dataStore.saveStore(store);
    return decorate(collectionName, item);
  },

  findByIdAndUpdate: async (id, updates = {}) => {
    const store = dataStore.getStore();
    const index = store[collectionName].findIndex((entry) => String(entry._id) === String(id));
    if (index === -1) return null;
    const updated = { ...store[collectionName][index], ...updates, _id: store[collectionName][index]._id, updatedAt: new Date().toISOString() };
    store[collectionName][index] = updated;
    dataStore.saveStore(store);
    return decorate(collectionName, updated);
  },

  findByIdAndDelete: async (id) => {
    const store = dataStore.getStore();
    const index = store[collectionName].findIndex((entry) => String(entry._id) === String(id));
    if (index === -1) return null;
    const [deleted] = store[collectionName].splice(index, 1);
    dataStore.saveStore(store);
    return decorate(collectionName, deleted);
  },

  findOneAndDelete: async (query = {}) => {
    const store = dataStore.getStore();
    const index = store[collectionName].findIndex((entry) => matchesQuery(entry, query));
    if (index === -1) return null;
    const [deleted] = store[collectionName].splice(index, 1);
    dataStore.saveStore(store);
    return decorate(collectionName, deleted);
  },

  deleteMany: async (query = {}) => {
    const store = dataStore.getStore();
    const before = store[collectionName].length;
    store[collectionName] = store[collectionName].filter((entry) => !matchesQuery(entry, query));
    dataStore.saveStore(store);
    return { deletedCount: before - store[collectionName].length };
  },

  insertMany: async (items) => {
    const store = dataStore.getStore();
    const created = [];
    for (const item of items) {
      const entry = { ...item, _id: item._id || dataStore.generateId() };
      entry.createdAt = entry.createdAt || new Date().toISOString();
      entry.updatedAt = entry.updatedAt || new Date().toISOString();
      store[collectionName].push(entry);
      created.push(decorate(collectionName, entry));
    }
    dataStore.saveStore(store);
    return created;
  },
});

module.exports = { createLocalModel, matchesQuery };
