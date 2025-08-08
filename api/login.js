import getDb from '../helpers/db.js';
import { createToken, setTokenCookie } from '../helpers/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { username, password } = await getPostBody(req);
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const db = await getDb();
    const users = db.collection('users');
    
    const user = await users.findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = createToken({
      userId: user.userId,
      username: user.username,
      userName: user.name,
    });
    
    setTokenCookie(res, token);
    
    res.status(200).json({ success: true, userId: user.userId });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request' });
  }
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