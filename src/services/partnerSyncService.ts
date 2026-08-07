import type { Expense } from '../types';

const SYNC_RELAY_BASE = import.meta.env.VITE_PARTNER_SYNC_URL || 'https://brucewayne-sync-default-rtdb.firebaseio.com/rooms';

export const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Pushes a local expense to the shared partner room endpoint
 */
export const pushExpenseToPartner = async (partnerCode: string, expense: Expense): Promise<void> => {
  if (!partnerCode) return;
  const cleanCode = partnerCode.trim().toUpperCase();
  const expId = expense.createdAt ? String(expense.createdAt) : String(Date.now());
  const url = `${SYNC_RELAY_BASE}/${cleanCode}/expenses/${expId}.json`;

  try {
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
  } catch (error) {
    // Silent error handling - do not print sensitive payload data
  }
};

/**
 * Deletes an expense from the shared partner room
 */
export const deleteExpenseFromPartner = async (partnerCode: string, expenseCreatedAt: number): Promise<void> => {
  if (!partnerCode || !expenseCreatedAt) return;
  const cleanCode = partnerCode.trim().toUpperCase();
  const url = `${SYNC_RELAY_BASE}/${cleanCode}/expenses/${expenseCreatedAt}.json`;

  try {
    await fetch(url, { method: 'DELETE' });
  } catch (error) {
    // Silent error handling
  }
};

/**
 * Fetches all shared partner expenses from the room
 */
export const fetchRoomExpenses = async (partnerCode: string): Promise<Expense[]> => {
  if (!partnerCode) return [];
  const cleanCode = partnerCode.trim().toUpperCase();
  const url = `${SYNC_RELAY_BASE}/${cleanCode}/expenses.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];

    return Object.values(data) as Expense[];
  } catch (error) {
    return [];
  }
};
