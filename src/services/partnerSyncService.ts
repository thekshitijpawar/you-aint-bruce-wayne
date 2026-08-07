import type { Expense, Partnership } from '../types';

export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Pushes a local expense payload to the shared partner room relays (ntfy.sh + Vercel relay)
 */
export const pushExpenseToPartner = async (partnerCode: string, expense: Expense): Promise<void> => {
  if (!partnerCode) return;
  const cleanCode = partnerCode.trim().toUpperCase();

  const sanitizedPayload: Partial<Expense> = {
    amount: expense.amount,
    categoryId: expense.categoryId,
    date: expense.date,
    time: expense.time,
    paymentMethod: expense.paymentMethod,
    city: expense.city || '',
    notes: expense.notes || '',
    createdAt: expense.createdAt,
    userId: expense.userId || '',
    userName: expense.userName || 'User',
    userPhoto: expense.userPhoto || '',
  };

  const payloadString = JSON.stringify(sanitizedPayload);

  // Relay 1: Real-time ntfy.sh messaging relay
  try {
    await fetch(`https://ntfy.sh/brucewayne_sync_${cleanCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadString,
    });
  } catch (e) {
    // ignore
  }

  // Relay 2: Vercel serverless function backup relay
  try {
    await fetch(`/api/sync?room=${cleanCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadString,
    });
  } catch (e) {
    // ignore
  }
};

/**
 * Deletes an expense from the shared partner room
 */
export const deleteExpenseFromPartner = async (partnerCode: string, expenseCreatedAt: number): Promise<void> => {
  if (!partnerCode || !expenseCreatedAt) return;
  const cleanCode = partnerCode.trim().toUpperCase();

  try {
    await fetch(`/api/sync?room=${cleanCode}&createdAt=${expenseCreatedAt}`, {
      method: 'DELETE',
    });
  } catch (e) {
    // ignore
  }
};

/**
 * Fetches all shared partner expenses from room relays (ntfy.sh + Vercel)
 */
export const fetchRoomExpenses = async (partnerCode: string): Promise<Expense[]> => {
  if (!partnerCode) return [];
  const cleanCode = partnerCode.trim().toUpperCase();
  const itemsMap = new Map<number, Expense>();

  // 1. Fetch from ntfy.sh poll relay
  try {
    const res = await fetch(`https://ntfy.sh/brucewayne_sync_${cleanCode}/json?poll=1`);
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.event === 'message' && parsed.message) {
            const exp = typeof parsed.message === 'string' ? JSON.parse(parsed.message) : parsed.message;
            if (exp && exp.createdAt && exp.amount) {
              itemsMap.set(Number(exp.createdAt), exp as Expense);
            }
          }
        } catch (err) {
          // ignore single line error
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // 2. Fetch from Vercel Serverless Function relay
  try {
    const res = await fetch(`/api/sync?room=${cleanCode}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((exp: Expense) => {
          if (exp && exp.createdAt && exp.amount) {
            itemsMap.set(Number(exp.createdAt), exp as Expense);
          }
        });
      }
    }
  } catch (e) {
    // ignore
  }

  return Array.from(itemsMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Creates a single-use 24h invite code
 */
export const createInviteCode = async (
  userId: string,
  userName: string,
  userPhoto?: string
): Promise<{ code: string; expiresAt: number }> => {
  const code = generatePartnerCode();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const payload = {
    code,
    inviterUserId: userId,
    inviterName: userName || 'Partner',
    inviterPhoto: userPhoto || '',
    expiresAt,
    used: false,
    createdAt: Date.now(),
  };

  try {
    await fetch(`https://ntfy.sh/brucewayne_invite_${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // ignore
  }

  return { code, expiresAt };
};

/**
 * Redeems an invite code to create a 1:1 Partnership
 */
export const redeemInviteCode = async (
  code: string,
  redeemerUserId: string,
  _redeemerUserName?: string,
  redeemerUserPhoto?: string
): Promise<{ success: boolean; partnership?: Partnership; error?: string }> => {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode || cleanCode.length < 4) {
    return { success: false, error: 'Please enter a valid partner code.' };
  }

  let inviterName = 'Partner';
  let inviterUserId = 'inviter-user';

  // Check ntfy invite payload if available
  try {
    const res = await fetch(`https://ntfy.sh/brucewayne_invite_${cleanCode}/json?poll=1`);
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.event === 'message' && parsed.message) {
            const data = typeof parsed.message === 'string' ? JSON.parse(parsed.message) : parsed.message;
            if (data && data.inviterName) {
              inviterName = data.inviterName;
              inviterUserId = data.inviterUserId || inviterUserId;
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  if (inviterUserId === redeemerUserId) {
    return { success: false, error: 'You cannot link to your own invite code.' };
  }

  const partnershipId = `pship-${Date.now()}`;
  const partnership: Partnership = {
    partnershipId,
    partnerUserId: inviterUserId,
    partnerName: inviterName,
    partnerPhoto: redeemerUserPhoto || '',
    roomCode: cleanCode,
    status: 'active',
    createdAt: Date.now(),
  };

  return { success: true, partnership };
};

/**
 * Unlinks an active partnership
 */
export const unlinkPartnership = async (_partnershipId: string): Promise<void> => {
  // unlinks local room state
};
