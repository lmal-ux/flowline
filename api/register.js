// /api/register.js
import getDb from '../db.js';
import genId from '../helpers/genId.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { name, username, password } = await getBody(req);
    
    if (!name || !username || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    const db = await getDb();
    const users = db.collection('users');
    
    const existing = await users.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    const userId = await genId(); // defaults to "user"
    
    await users.insertOne({
      _id: userId,
      userId,
      name,
      username,
      password, // for now: stored raw; consider hashing
      createdAt: new Date().toISOString()
    });
    
    return res.status(201).json({
      userId,
      name,
      username
    });
    
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
}

// Utility to read POST body
async function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}