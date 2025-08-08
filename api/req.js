// /api/req.js
import getDb from '../db.js';
import { allowed } from '../helpers/auth.js';

export default async function handler(req, res) {
  if (!allowed(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const db = await getDb();
  const meColl = db.collection('me');
  const { userId: fromUser } = req.user;

  const body = await getPostBody(req);
  const { type, toUser, sessionId, payload, status } = body;
  const timestamp = new Date().toISOString();

  const fullMessage = {
    type,
    fromUser,
    toUser,
    sessionId,
    payload,
    status,
    timestamp,
  };

  const fromDoc = await meColl.findOne({ userId: fromUser });
  const toDoc = await meColl.findOne({ userId: toUser });

  if (!toDoc) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  // Remove old entries from appropriate array in `toDoc`
  const updateTo = {};
  const updateFrom = {};

  if (type === 'offer') {
    updateTo.$pull = {
      incomingRequests: { fromUser },
    };
    updateTo.$push = {
      incomingRequests: fullMessage,
    };
    updateFrom.$pull = {
      waiting: { sessionId },
    };
    updateFrom.$push = {
      waiting: fullMessage,
    };
  }

  else if (type === 'answer') {
    updateTo.$pull = {
      incomingAnswers: { fromUser },
    };
    updateTo.$push = {
      incomingAnswers: fullMessage,
    };
    updateFrom.$pull = {
      waiting: { sessionId },
    };
    updateFrom.$push = {
      waiting: fullMessage,
    };
  }

  else if (type === 'answerReply') {
    updateTo.$pull = {
      incomingAnswerReplies: { fromUser },
    };
    updateTo.$push = {
      incomingAnswerReplies: fullMessage,
    };
    updateFrom.$pull = {
      waiting: { sessionId },
    };

    if (status === 'accepted') {
      updateFrom.$push = {
        activeSessions: {
          peer: toUser,
          sessionId,
          connectedAt: timestamp,
        },
      };
    }
  } else {
    return res.status(400).json({ error: 'Unknown type' });
  }

  await Promise.all([
    meColl.updateOne({ userId: toUser }, updateTo),
    meColl.updateOne({ userId: fromUser }, updateFrom),
  ]);

  res.status(200).json({ ok: true });
}

// Read raw POST body
async function getPostBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
}