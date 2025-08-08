// /api/actives.js
import getDb from '../db.js';
import { allowed } from '../helpers/auth.js';
import updateLastSeen from '../helpers/lastSeen.js';

export default async function handler(req, res) {
  if (!allowed(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const db = await getDb();
  const actives = db.collection('actives');
  
  updateLastSeen(req.user.userId, req.user.name)
  
  if (req.method === 'GET') {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const users = await actives
      .find({
        lastSeen: { $gte: fiveMinutesAgo },
        userId: { $ne: req.user.userId },
      })
      .project({ _id: 0, userId: 1, name: 1, lastSeen: 1 })
      .toArray();
    
    return res.status(200).json(users);
  }
  
  if (req.method === 'POST') {
    try {
      const { userId } = await getPostBody(req);
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      
      const user = await actives.findOne({ userId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({
        userId: user.userId,
        name: user.name,
        lastSeen: user.lastSeen,
      });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

// vanilla POST body reader
async function getPostBody(req) {
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