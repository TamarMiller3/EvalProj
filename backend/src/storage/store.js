const { getCollection } = require('./db');

const COLLECTION = 'evaluations';

const store = {
  async get(code) {
    const col = await getCollection(COLLECTION);
    const doc = await col.findOne({ code: code.toUpperCase() });
    return doc || null;
  },

  async set(code, data) {
    const col = await getCollection(COLLECTION);
    const doc = { ...data, code: code.toUpperCase(), savedAt: new Date() };
    await col.replaceOne(
      { code: code.toUpperCase() },
      doc,
      { upsert: true }
    );
    return doc;
  },

  async exists(code) {
    const col = await getCollection(COLLECTION);
    const count = await col.countDocuments({ code: code.toUpperCase() });
    return count > 0;
  },

  async delete(code) {
    const col = await getCollection(COLLECTION);
    await col.deleteOne({ code: code.toUpperCase() });
  },

  async listAll() {
    const col = await getCollection(COLLECTION);
    return col.find({}).sort({ savedAt: -1 }).toArray();
  }
};

module.exports = store;
