// /api/me.js
import getDb from '../db.js';
import { allowed } from '../helpers/auth.js';
import updateLastSeen from '../helpers/updateLastSeen.js';

export default async function handler(req, res) {
  if (!allowed(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = await getDb();
  const { userId, name } = req.user;

  // Update lastSeen in actives
  await updateLastSeen(userId, name);

  const meColl = db.collection('me');
  const me = await meColl.findOne({ _id: userId }); // _id used as main identifier

  res.status(200).json(me);
}