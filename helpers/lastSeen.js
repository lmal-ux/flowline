// helpers/updateLastSeen.js
import getDb from '../db.js';

export default async function UpdateLastSeen(userId, name) {
  const db = await getDb();
  const actives = db.collection('actives');

  await actives.updateOne(
    { userId },
    {
      $set: {
        name,
        lastSeen: new Date().toISOString(), // always UTC
      },
    },
    { upsert: true }
  );
}