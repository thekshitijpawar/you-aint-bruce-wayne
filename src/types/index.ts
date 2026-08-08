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
  userId?: string;      // Identifier for author
  userName?: string;    // Display name of logger
  userPhoto?: string;   // Avatar photo of logger
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

export interface AppSettings {
  theme?: 'light' | 'dark';
  profilePhoto?: string;
  userName?: string;
  userId?: string;                     // Unique device/user UUID
  hasCompletedOnboarding?: boolean;
  currency: CurrencySymbol;
  city: string;                        // User's default home city
  firstDayOfWeek: 'Monday' | 'Sunday';
  defaultPaymentMethod: PaymentMethod;
  defaultCategory: string;
  eveningReminder: boolean;
  reminderTime: string;
}
