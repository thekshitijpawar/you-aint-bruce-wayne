export type PaymentMethod = 
  | 'Cash' 
  | 'UPI' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Bank Transfer' 
  | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  isDefault?: boolean;
}

export interface Expense {
  id?: number;
  amount: number;
  categoryId: string;
  date: string;         // YYYY-MM-DD
  time: string;         // HH:mm
  paymentMethod: PaymentMethod;
  city?: string;        // Optional City location (e.g. Mumbai, New York, Tokyo)
  notes?: string;
  createdAt: number;
  updatedAt?: number;
  userId?: string;      // Identifier for author (e.g. spouse/child ID)
  userName?: string;    // Display name of logger (e.g. Bruce vs Selina)
  userPhoto?: string;   // Avatar photo of logger
  partnerCode?: string; // Shared Partner Room Code (e.g. WAYNE7)
}

export interface Budget {
  id?: number;
  monthlyBudget: number;
  weeklyBudget: number;
  updatedAt: number;
}

export interface ExpenseFilter {
  searchQuery: string;
  startDate: string;
  endDate: string;
  categoryIds: string[];
  paymentMethods: PaymentMethod[];
  city?: string;        // Filter by city
  minAmount: string;
  maxAmount: string;
  authorFilter?: 'all' | 'mine' | 'partner'; // Filter by author
}

export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface SpendingStats {
  totalSpent: number;
  avgDaily: number;
  highestDay: { date: string; amount: number };
  lowestDay: { date: string; amount: number };
  topCategory: { name: string; amount: number; color: string } | null;
  transactionCount: number;
}

export type CurrencySymbol = string; // Allows complete freedom for any currency symbol or code

export interface Partnership {
  partnershipId: string;
  partnerUserId: string;
  partnerName: string;
  partnerPhoto?: string;
  roomCode: string;
  status: 'active' | 'unlinked';
  createdAt: number;
}

export interface AppSettings {
  theme?: 'light' | 'dark';
  profilePhoto?: string;
  userName?: string;
  userId?: string;                     // Unique device/user UUID
  partnerCode?: string;                // Shared Household Sync Code (e.g. WAYNE7)
  partnershipId?: string;              // Active Partnership ID
  partnerUserId?: string;              // Linked Partner's Unique User ID
  partnerName?: string;                // Linked Partner's Display Name
  partnerPhoto?: string;               // Linked Partner's Photo
  syncEnabled?: boolean;               // Whether partner sync is active
  hasCompletedOnboarding?: boolean;
  currency: CurrencySymbol;
  city: string;                        // User's default home city
  firstDayOfWeek: 'Monday' | 'Sunday';
  defaultPaymentMethod: PaymentMethod;
  defaultCategory: string;
  eveningReminder: boolean;
  reminderTime: string;
  pinEnabled: boolean;
  pinCode: string;
}
