// helpers/genId.js
import getDb from '../db.js';

export default async function genId(counterName = 'user') {
  const db = await getDb();
  const counters = db.collection('counters');

  const result = await counters.findOneAndUpdate(
    { _id: counterName },
    { $inc: { value: 1 } },
    {
      upsert: true,
      returnDocument: 'after', // get the incremented value
    }
  );

  return result.value.value;
}