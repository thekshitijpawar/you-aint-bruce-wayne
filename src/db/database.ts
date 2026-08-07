import Dexie, { type Table } from 'dexie';
import type { Expense, Category, Budget, AppSettings } from '../types';
import { DEFAULT_CATEGORIES, generateSampleExpenses } from '../utils/mockData';

export class ExpenseDatabase extends Dexie {
  expenses!: Table<Expense, number>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, number>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super('ExpenseTrackerDB');
    this.version(1).stores({
      expenses: '++id, date, categoryId, paymentMethod, city, amount, createdAt',
      categories: 'id, name',
      budgets: '++id',
      settings: 'id',
    });
  }
}

export const db = new ExpenseDatabase();

export const seedDatabaseIfEmpty = async (): Promise<void> => {
  const categoriesCount = await db.categories.count();
  if (categoriesCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  const expensesCount = await db.expenses.count();
  if (expensesCount === 0) {
    const samples = generateSampleExpenses();
    await db.expenses.bulkAdd(samples);
  }

  const budgetCount = await db.budgets.count();
  if (budgetCount === 0) {
    await db.budgets.add({
      monthlyBudget: 50000,
      weeklyBudget: 12500,
      updatedAt: Date.now(),
    });
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      currency: '₹',
      city: 'Mumbai',
      firstDayOfWeek: 'Monday',
      defaultPaymentMethod: 'UPI',
      defaultCategory: 'food',
      eveningReminder: true,
      reminderTime: '21:00',
      pinEnabled: false,
      pinCode: '',
    });
  }
};
