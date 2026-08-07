import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory room store for paired partner devices
const roomStore = new Map<string, Map<string, any>>();

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const room = String(req.query.room || 'DEFAULT').trim().toUpperCase();

  if (!roomStore.has(room)) {
    roomStore.set(room, new Map<string, any>());
  }
  const roomItemsMap = roomStore.get(room)!;

  if (req.method === 'GET') {
    const items = Array.from(roomItemsMap.values());
    return res.status(200).json(items);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignore parse error
      }
    }

    if (!body || (!body.createdAt && !body.id)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const key = String(body.createdAt || body.id);
    roomItemsMap.set(key, body);

    return res.status(200).json({ success: true, count: roomItemsMap.size });
  }

  if (req.method === 'DELETE') {
    const createdAt = String(req.query.createdAt || '');
    if (createdAt && roomItemsMap.has(createdAt)) {
      roomItemsMap.delete(createdAt);
    }
    return res.status(200).json({ success: true, count: roomItemsMap.size });
  }

  return res.status(405).end();
}
