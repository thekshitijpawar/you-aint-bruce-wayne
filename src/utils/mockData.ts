import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#F97316', isDefault: true },
  { id: 'transport', name: 'Transport', icon: 'directions_car', color: '#3B82F6', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'shopping_bag', color: '#EC4899', isDefault: true },
  { id: 'bills', name: 'Bills & Utilities', icon: 'electric_bolt', color: '#818CF8', isDefault: true },
  { id: 'health', name: 'Health', icon: 'medical_services', color: '#F43F5E', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'subscriptions', color: '#8B5CF6', isDefault: true },
  { id: 'groceries', name: 'Groceries', icon: 'shopping_cart', color: '#10B981', isDefault: true },
  { id: 'other', name: 'Other', icon: 'more_horiz', color: '#64748B', isDefault: true },
];
