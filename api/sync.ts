import type { VercelRequest, VercelResponse } from '@vercel/node';

const FIREBASE_BASE_URL = 'https://brucewayne-sync-default-rtdb.firebaseio.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = String(req.query.action || '').toLowerCase();
  const room = String(req.query.room || 'DEFAULT').trim().toUpperCase();

  // Action: Generate Invite Code
  if (action === 'generate') {
    const { userId, userName, userPhoto } = req.body || {};
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const payload = {
      code,
      inviterUserId: userId || 'unknown',
      inviterName: userName || 'Partner',
      inviterPhoto: userPhoto || '',
      expiresAt,
      used: false,
      createdAt: Date.now(),
    };

    try {
      await fetch(`${FIREBASE_BASE_URL}/inviteCodes/${code}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.status(200).json({ success: true, code, expiresAt });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create code' });
    }
  }

  // Action: Redeem Invite Code
  if (action === 'redeem') {
    const { code, userId, userName, userPhoto } = req.body || {};
    const cleanCode = String(code || '').trim().toUpperCase();

    try {
      const fetchRes = await fetch(`${FIREBASE_BASE_URL}/inviteCodes/${cleanCode}.json`);
      const inviteData = await fetchRes.json();

      if (!inviteData) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }
      if (inviteData.used) {
        return res.status(400).json({ error: 'Invite code already used' });
      }
      if (inviteData.expiresAt && Date.now() > inviteData.expiresAt) {
        return res.status(400).json({ error: 'Invite code expired' });
      }
      if (inviteData.inviterUserId === userId) {
        return res.status(400).json({ error: 'Cannot link to your own code' });
      }

      await fetch(`${FIREBASE_BASE_URL}/inviteCodes/${cleanCode}/used.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(true),
      });

      const partnershipId = `pship-${Date.now()}`;
      const partnership = {
        partnershipId,
        partnerUserId: inviteData.inviterUserId,
        partnerName: inviteData.inviterName,
        partnerPhoto: inviteData.inviterPhoto,
        roomCode: cleanCode,
        status: 'active',
        createdAt: Date.now(),
      };

      return res.status(200).json({ success: true, partnership });
    } catch (e) {
      return res.status(500).json({ error: 'Redemption failed' });
    }
  }

  // Regular Expense Sync Endpoints
  if (req.method === 'GET') {
    try {
      const fbRes = await fetch(`${FIREBASE_BASE_URL}/rooms/${room}/expenses.json`);
      const data = await fbRes.json();
      const items = data && typeof data === 'object' ? Object.values(data) : [];
      return res.status(200).json(items);
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    if (!body || (!body.createdAt && !body.id)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const key = String(body.createdAt || body.id);
    try {
      await fetch(`${FIREBASE_BASE_URL}/rooms/${room}/expenses/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to write' });
    }
  }

  if (req.method === 'DELETE') {
    const createdAt = String(req.query.createdAt || '');
    if (createdAt) {
      try {
        await fetch(`${FIREBASE_BASE_URL}/rooms/${room}/expenses/${createdAt}.json`, {
          method: 'DELETE',
        });
      } catch (e) {}
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
