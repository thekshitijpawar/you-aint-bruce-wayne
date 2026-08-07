import type { Category, Expense } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'Utensils', color: '#F97316', budget: 12000, isDefault: true },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#10B981', budget: 8000, isDefault: true },
  { id: 'transport', name: 'Transportation', icon: 'Car', color: '#3B82F6', budget: 4000, isDefault: true },
  { id: 'fuel', name: 'Fuel', icon: 'Fuel', color: '#EF4444', budget: 3500, isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', budget: 6000, isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8B5CF6', budget: 3000, isDefault: true },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#6366F1', budget: 5000, isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#14B8A6', budget: 18000, isDefault: true },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#F43F5E', budget: 3000, isDefault: true },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#0EA5E9', budget: 10000, isDefault: true },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#64748B', budget: 5000, isDefault: true },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: '#059669', budget: 15000, isDefault: true },
  { id: 'emi', name: 'EMI', icon: 'CreditCard', color: '#D97706', budget: 10000, isDefault: true },
  { id: 'gifts', name: 'Gifts', icon: 'Gift', color: '#F472B6', budget: 2000, isDefault: true },
  { id: 'misc', name: 'Miscellaneous', icon: 'MoreHorizontal', color: '#94A3B8', budget: 2500, isDefault: true },
];

export const generateSampleExpenses = (): Expense[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const getDateStr = (offsetDays: number) => {
    const d = new Date(year, month, day - offsetDays);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  const sampleItems: Omit<Expense, 'id' | 'createdAt'>[] = [
    // Today
    { amount: 180, categoryId: 'food', date: getDateStr(0), time: '08:30', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Morning Coffee & Croissant' },
    { amount: 420, categoryId: 'food', date: getDateStr(0), time: '13:15', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Lunch with colleagues' },
    { amount: 320, categoryId: 'transport', date: getDateStr(0), time: '19:45', paymentMethod: 'Credit Card', city: 'Mumbai', notes: 'Uber ride home' },
    
    // Yesterday
    { amount: 2450, categoryId: 'groceries', date: getDateStr(1), time: '18:10', paymentMethod: 'Debit Card', city: 'Mumbai', notes: 'Weekly grocery refill at Mart' },
    { amount: 1200, categoryId: 'fuel', date: getDateStr(1), time: '09:00', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Petrol full tank' },
    
    // 2 days ago
    { amount: 850, categoryId: 'entertainment', date: getDateStr(2), time: '20:30', paymentMethod: 'Credit Card', city: 'Mumbai', notes: 'Movie tickets & popcorn' },
    { amount: 350, categoryId: 'food', date: getDateStr(2), time: '14:00', paymentMethod: 'Cash', city: 'Mumbai', notes: 'Snacks & smoothies' },

    // 3 days ago
    { amount: 3200, categoryId: 'shopping', date: getDateStr(3), time: '16:45', paymentMethod: 'Credit Card', city: 'Mumbai', notes: 'New running shoes' },
    { amount: 190, categoryId: 'transport', date: getDateStr(3), time: '10:15', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Metro auto fare' },

    // 4 days ago
    { amount: 1800, categoryId: 'bills', date: getDateStr(4), time: '11:00', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Electricity & Wifi Bill' },
    { amount: 450, categoryId: 'health', date: getDateStr(4), time: '17:20', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Vitamin supplements' },

    // 5 days ago
    { amount: 5000, categoryId: 'investment', date: getDateStr(5), time: '10:00', paymentMethod: 'Bank Transfer', city: 'Mumbai', notes: 'Monthly SIP Investment' },

    // 7 days ago
    { amount: 1500, categoryId: 'groceries', date: getDateStr(7), time: '12:30', paymentMethod: 'UPI', city: 'Mumbai', notes: 'Fresh fruits and veggies' },
    
    // 10 days ago (Travel expense)
    { amount: 15000, categoryId: 'rent', date: getDateStr(10), time: '09:00', paymentMethod: 'Bank Transfer', city: 'Mumbai', notes: 'Apartment rent transfer' },
    
    // 12 days ago
    { amount: 4500, categoryId: 'emi', date: getDateStr(12), time: '10:00', paymentMethod: 'Bank Transfer', city: 'Mumbai', notes: 'Laptop EMI payment' },

    // 15 days ago (Travel)
    { amount: 2800, categoryId: 'travel', date: getDateStr(15), time: '07:30', paymentMethod: 'Credit Card', city: 'Dubai', notes: 'Weekend hotel & tour booking' },
  ];

  return sampleItems.map((item, index) => ({
    ...item,
    id: index + 1,
    createdAt: Date.now() - index * 3600000 * 24,
  }));
};
