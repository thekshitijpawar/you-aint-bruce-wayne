import type { Expense, Partnership } from '../types';

const FIREBASE_BASE_URL = 'https://brucewayne-sync-default-rtdb.firebaseio.com';

export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Pushes a local expense payload to persistent Firebase RTDB + real-time relays
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

  // 1. Firebase RTDB Persistent Store
  try {
    await fetch(`${FIREBASE_BASE_URL}/rooms/${cleanCode}/expenses/${expense.createdAt}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payloadString,
    });
  } catch (e) {
    // ignore
  }

  // 2. ntfy.sh Fast Real-time Relay
  try {
    await fetch(`https://ntfy.sh/brucewayne_sync_${cleanCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadString,
    });
  } catch (e) {
    // ignore
  }

  // 3. Vercel Serverless Function Relay
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
 * Deletes an expense from persistent Firebase RTDB + Vercel relay
 */
export const deleteExpenseFromPartner = async (partnerCode: string, expenseCreatedAt: number): Promise<void> => {
  if (!partnerCode || !expenseCreatedAt) return;
  const cleanCode = partnerCode.trim().toUpperCase();

  // 1. Firebase RTDB Delete
  try {
    await fetch(`${FIREBASE_BASE_URL}/rooms/${cleanCode}/expenses/${expenseCreatedAt}.json`, {
      method: 'DELETE',
    });
  } catch (e) {
    // ignore
  }

  // 2. Vercel Relay Delete
  try {
    await fetch(`/api/sync?room=${cleanCode}&createdAt=${expenseCreatedAt}`, {
      method: 'DELETE',
    });
  } catch (e) {
    // ignore
  }
};

/**
 * Fetches all shared partner expenses from persistent Firebase RTDB + relays
 */
export const fetchRoomExpenses = async (partnerCode: string): Promise<Expense[]> => {
  if (!partnerCode) return [];
  const cleanCode = partnerCode.trim().toUpperCase();
  const itemsMap = new Map<number, Expense>();

  // 1. Primary: Persistent Firebase RTDB
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/rooms/${cleanCode}/expenses.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        Object.values(data).forEach((exp: any) => {
          if (exp && exp.createdAt && exp.amount) {
            itemsMap.set(Number(exp.createdAt), exp as Expense);
          }
        });
      }
    }
  } catch (e) {
    // ignore
  }

  // 2. Secondary: ntfy.sh poll relay
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
              itemsMap.set(Number(exp.createdAt), exp);
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

  // 3. Fallback: Vercel Serverless Function relay
  try {
    const res = await fetch(`/api/sync?room=${cleanCode}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((exp: Expense) => {
          if (exp && exp.createdAt && exp.amount) {
            itemsMap.set(Number(exp.createdAt), exp);
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
 * Creates a single-use 24h invite code in Firebase RTDB
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
    await fetch(`${FIREBASE_BASE_URL}/inviteCodes/${code}.json`, {
      method: 'PUT',
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
  redeemerUserName: string,
  redeemerUserPhoto?: string
): Promise<{ success: boolean; partnership?: Partnership; error?: string }> => {
  const cleanCode = code.trim().toUpperCase();

  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/inviteCodes/${cleanCode}.json`);
    if (!res.ok) {
      return { success: false, error: 'Server error. Please try again.' };
    }

    const inviteData = await res.json();

    if (!inviteData) {
      return { success: false, error: 'Invalid invite code. Please check and try again.' };
    }

    if (inviteData.used) {
      return { success: false, error: 'This invite code has already been redeemed.' };
    }

    if (inviteData.expiresAt && Date.now() > inviteData.expiresAt) {
      return { success: false, error: 'This invite code has expired (valid for 24h).' };
    }

    if (inviteData.inviterUserId === redeemerUserId) {
      return { success: false, error: 'You cannot link to your own invite code.' };
    }

    // Mark code as used
    await fetch(`${FIREBASE_BASE_URL}/inviteCodes/${cleanCode}/used.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(true),
    });

    // Create shared room code & partnership record
    const roomCode = cleanCode;
    const partnershipId = `pship-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const partnership: Partnership = {
      partnershipId,
      partnerUserId: inviteData.inviterUserId,
      partnerName: inviteData.inviterName,
      partnerPhoto: inviteData.inviterPhoto,
      roomCode,
      status: 'active',
      createdAt: Date.now(),
    };

    // Save partnership record to Firebase
    await fetch(`${FIREBASE_BASE_URL}/partnerships/${partnershipId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...partnership,
        redeemerUserId,
        redeemerUserName,
        redeemerUserPhoto: redeemerUserPhoto || '',
      }),
    });

    return { success: true, partnership };
  } catch (e) {
    return { success: false, error: 'Network error. Could not connect to partner server.' };
  }
};

/**
 * Unlinks an active partnership
 */
export const unlinkPartnership = async (partnershipId: string): Promise<void> => {
  if (!partnershipId) return;

  try {
    await fetch(`${FIREBASE_BASE_URL}/partnerships/${partnershipId}/status.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('unlinked'),
    });
  } catch (e) {
    // ignore
  }
};
