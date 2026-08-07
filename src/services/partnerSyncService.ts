import type { Expense } from '../types';

export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Pushes a local expense payload to the shared partner room relays
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
 * Fetches all shared partner expenses from room relays
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
              itemsMap.set(exp.createdAt, exp);
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
            itemsMap.set(exp.createdAt, exp);
          }
        });
      }
    }
  } catch (e) {
    // ignore
  }

  return Array.from(itemsMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};
