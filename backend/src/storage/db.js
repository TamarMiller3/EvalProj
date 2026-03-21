const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME   = process.env.DB_NAME   || 'rama_eval';

let client = null;
let db     = null;

async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`✅ MongoDB connected: Connected! / ${DB_NAME}`);
  return db;
}

async function getCollection(name) {
  const database = await connect();
  return database.collection(name);
}

async function close() {
  if (client) await client.close();
}

module.exports = { connect, getCollection, close };
