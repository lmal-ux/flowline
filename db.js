// db.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'flowline';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const options = {};

const client = new MongoClient(uri, options);
const getDb = client.connect().then(client => client.db(dbName));

export default getDb;