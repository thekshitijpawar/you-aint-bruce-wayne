import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabaseIfEmpty } from '../db/database';
import type { Expense, Category, Budget, AppSettings, ExpenseFilter } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/mockData';

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  categoriesMap: Map<string, Category>;
  budget: Budget;
  settings: AppSettings;
  filter: ExpenseFilter;
  filteredExpenses: Expense[];
  isLoading: boolean;
  lastDeleted: Expense | null;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<number>;
  updateExpense: (id: number, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  undoDelete: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateBudget: (budgetData: Partial<Budget>) => Promise<void>;
  updateSettings: (settingsData: Partial<AppSettings>) => Promise<void>;
  setFilter: (newFilter: Partial<ExpenseFilter>) => void;
  resetFilter: () => void;
  importBackupJSON: (jsonString: string) => Promise<boolean>;
  exportBackupJSON: () => Promise<string>;
  resetAllData: () => Promise<void>;
}

const defaultFilter: ExpenseFilter = {
  searchQuery: '',
  startDate: '',
  endDate: '',
  categoryIds: [],
  paymentMethods: [],
  city: '',
  minAmount: '',
  maxAmount: '',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSeeded, setIsSeeded] = useState(false);
  const [filter, setFilterState] = useState<ExpenseFilter>(defaultFilter);
  const [lastDeleted, setLastDeleted] = useState<Expense | null>(null);

  useEffect(() => {
    seedDatabaseIfEmpty().then(() => setIsSeeded(true));
  }, []);

  const expensesList = useLiveQuery(() => db.expenses.orderBy('createdAt').reverse().toArray(), [], []);
  const categoriesList = useLiveQuery(() => db.categories.toArray(), [], []);
  const budgetsList = useLiveQuery(() => db.budgets.toArray(), [], []);
  const settingsList = useLiveQuery(() => db.settings.toArray(), [], []);

  const expenses = useMemo(() => expensesList || [], [expensesList]);
  const categories = useMemo(() => categoriesList || DEFAULT_CATEGORIES, [categoriesList]);
  
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  const budget: Budget = useMemo(() => {
    return budgetsList && budgetsList.length > 0
      ? budgetsList[0]
      : { monthlyBudget: 50000, weeklyBudget: 12500, updatedAt: Date.now() };
  }, [budgetsList]);

  const settings: AppSettings = useMemo(() => {
    return settingsList && settingsList.length > 0
      ? settingsList[0]
      : {
          theme: 'dark',
          currency: '₹',
          city: 'Mumbai',
          firstDayOfWeek: 'Monday',
          defaultPaymentMethod: 'UPI',
          defaultCategory: 'food',
          eveningReminder: true,
          reminderTime: '21:00',
          pinEnabled: false,
          pinCode: '',
        };
  }, [settingsList]);

  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const categoryName = categoriesMap.get(exp.categoryId)?.name.toLowerCase() || '';
        const notes = (exp.notes || '').toLowerCase();
        const city = (exp.city || '').toLowerCase();
        const amountStr = exp.amount.toString();
        const matches = categoryName.includes(query) || notes.includes(query) || city.includes(query) || amountStr.includes(query);
        if (!matches) return false;
      }

      if (filter.startDate && exp.date < filter.startDate) return false;
      if (filter.endDate && exp.date > filter.endDate) return false;

      if (filter.categoryIds.length > 0 && !filter.categoryIds.includes(exp.categoryId)) {
        return false;
      }

      if (filter.paymentMethods.length > 0 && !filter.paymentMethods.includes(exp.paymentMethod)) {
        return false;
      }

      if (filter.city && exp.city && exp.city.toLowerCase() !== filter.city.toLowerCase()) {
        return false;
      }

      if (filter.minAmount && exp.amount < parseFloat(filter.minAmount)) return false;
      if (filter.maxAmount && exp.amount > parseFloat(filter.maxAmount)) return false;

      return true;
    });
  }, [expenses, filter, categoriesMap]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<number> => {
    const id = await db.expenses.add({
      city: settings.city || 'Home City',
      ...expenseData,
      createdAt: Date.now(),
    });
    return id as number;
  };

  const updateExpense = async (id: number, expenseData: Partial<Expense>): Promise<void> => {
    await db.expenses.update(id, {
      ...expenseData,
      updatedAt: Date.now(),
    });
  };

  const deleteExpense = async (id: number): Promise<void> => {
    const target = await db.expenses.get(id);
    if (target) {
      setLastDeleted(target);
      await db.expenses.delete(id);
    }
  };

  const undoDelete = async (): Promise<void> => {
    if (lastDeleted) {
      const { id, ...rest } = lastDeleted;
      await db.expenses.add({
        ...rest,
        createdAt: Date.now(),
      });
      setLastDeleted(null);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<string> => {
    const id = categoryData.name.toLowerCase().replace(/\s+/g, '-');
    const newCategory: Category = { ...categoryData, id, isDefault: false };
    await db.categories.add(newCategory);
    return id;
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<void> => {
    await db.categories.update(id, categoryData);
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await db.categories.delete(id);
  };

  const updateBudget = async (budgetData: Partial<Budget>): Promise<void> => {
    const existing = await db.budgets.toArray();
    if (existing.length > 0) {
      await db.budgets.update(existing[0].id!, { ...budgetData, updatedAt: Date.now() });
    } else {
      await db.budgets.add({
        monthlyBudget: 50000,
        weeklyBudget: 12500,
        ...budgetData,
        updatedAt: Date.now(),
      });
    }
  };

  const updateSettings = async (settingsData: Partial<AppSettings>): Promise<void> => {
    const existing = await db.settings.get('default');
    if (existing) {
      await db.settings.update('default', settingsData);
    } else {
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
        ...settingsData,
      });
    }
  };

  const setFilter = (newFilter: Partial<ExpenseFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  const resetFilter = () => {
    setFilterState(defaultFilter);
  };

  const exportBackupJSON = async (): Promise<string> => {
    const allExpenses = await db.expenses.toArray();
    const allCategories = await db.categories.toArray();
    const allBudgets = await db.budgets.toArray();
    const allSettings = await db.settings.toArray();

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      expenses: allExpenses,
      categories: allCategories,
      budgets: allBudgets,
      settings: allSettings,
    };

    return JSON.stringify(data, null, 2);
  };

  const importBackupJSON = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.expenses && Array.isArray(parsed.expenses)) {
        await db.expenses.clear();
        await db.expenses.bulkAdd(parsed.expenses);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        await db.categories.clear();
        await db.categories.bulkAdd(parsed.categories);
      }
      if (parsed.budgets && Array.isArray(parsed.budgets)) {
        await db.budgets.clear();
        await db.budgets.bulkAdd(parsed.budgets);
      }
      if (parsed.settings && Array.isArray(parsed.settings)) {
        await db.settings.clear();
        await db.settings.bulkAdd(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error('Backup restore failed', e);
      return false;
    }
  };

  const resetAllData = async (): Promise<void> => {
    await db.expenses.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await db.settings.clear();
    await seedDatabaseIfEmpty();
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        categoriesMap,
        budget,
        settings,
        filter,
        filteredExpenses,
        isLoading: !isSeeded,
        lastDeleted,
        addExpense,
        updateExpense,
        deleteExpense,
        undoDelete,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBudget,
        updateSettings,
        setFilter,
        resetFilter,
        importBackupJSON,
        exportBackupJSON,
        resetAllData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
