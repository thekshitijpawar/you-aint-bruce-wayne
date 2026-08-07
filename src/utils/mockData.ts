import type { Category, Expense } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#F97316', budget: 0, isDefault: true },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#10B981', budget: 0, isDefault: true },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#3B82F6', budget: 0, isDefault: true },
  { id: 'fuel', name: 'Fuel', icon: 'Fuel', color: '#EF4444', budget: 0, isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', budget: 0, isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8B5CF6', budget: 0, isDefault: true },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#6366F1', budget: 0, isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#14B8A6', budget: 0, isDefault: true },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#F43F5E', budget: 0, isDefault: true },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#0EA5E9', budget: 0, isDefault: true },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#64748B', budget: 0, isDefault: true },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: '#059669', budget: 0, isDefault: true },
  { id: 'emi', name: 'EMI', icon: 'CreditCard', color: '#D97706', budget: 0, isDefault: true },
  { id: 'gifts', name: 'Gifts', icon: 'Gift', color: '#F472B6', budget: 0, isDefault: true },
  { id: 'misc', name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#94A3B8', budget: 0, isDefault: true },
];

export const generateSampleExpenses = (): Expense[] => {
  return [];
};
