import type { CurrencySymbol } from '../types';

export const formatCurrency = (amount: number, symbol: CurrencySymbol = '₹'): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  // If symbol is multi-character text code e.g. "AED", "USD", "KSh"
  if (symbol && symbol.length > 2) {
    return `${symbol} ${formatted}`;
  }
  return `${symbol}${formatted}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const today = getTodayDateString();
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';

  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

export const formatTimeDisplay = (timeString: string): string => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const dateObj = new Date();
  dateObj.setHours(hours, minutes);
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getStartOfWeek = (d: Date, firstDay: 'Monday' | 'Sunday' = 'Monday'): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = firstDay === 'Monday' ? (day === 0 ? -6 : 1 - day) : -day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getEndOfWeek = (d: Date, firstDay: 'Monday' | 'Sunday' = 'Monday'): Date => {
  const start = getStartOfWeek(d, firstDay);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const getEndOfMonth = (d: Date): Date => {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const getStartOfYear = (d: Date): Date => {
  return new Date(d.getFullYear(), 0, 1);
};

export const getEndOfYear = (d: Date): Date => {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
};
