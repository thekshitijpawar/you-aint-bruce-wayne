import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabaseIfEmpty } from '../db/database';
import type { Expense, Category, Budget, AppSettings, ExpenseFilter } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/mockData';
import { fetchRoomExpenses, pushExpenseToPartner, deleteExpenseFromPartner } from '../services/partnerSyncService';

interface ExpenseContextType {
  expenses: Expense[];
  partnerExpenses: Expense[];
  allExpenses: Expense[];
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
  syncPartnerRoom: () => Promise<void>;
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
  authorFilter: 'all',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSeeded, setIsSeeded] = useState(false);
  const [filter, setFilterState] = useState<ExpenseFilter>(defaultFilter);
  const [lastDeleted, setLastDeleted] = useState<Expense | null>(null);
  const [partnerExpenses, setPartnerExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    seedDatabaseIfEmpty().then(() => setIsSeeded(true));
  }, []);

  const expensesList = useLiveQuery(() => db.expenses.orderBy('createdAt').reverse().toArray(), [], []);
  const categoriesList = useLiveQuery(() => db.categories.toArray(), [], []);
  const budgetsList = useLiveQuery(() => db.budgets.toArray(), [], []);
  const settingsList = useLiveQuery(() => db.settings.toArray(), [], []);

  const localExpenses = useMemo(() => expensesList || [], [expensesList]);
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
    const defaultSettings: AppSettings = {
      theme: 'dark',
      currency: '$',
      city: 'New York',
      userName: 'Valued User',
      userId: `user-${Date.now()}`,
      partnerCode: '',
      syncEnabled: false,
      firstDayOfWeek: 'Monday',
      defaultPaymentMethod: 'Cash',
      defaultCategory: 'food',
      eveningReminder: true,
      reminderTime: '21:00',
      pinEnabled: false,
      pinCode: '',
    };

    if (settingsList && settingsList.length > 0) {
      const s = settingsList[0];
      if (!s.userId) {
        s.userId = defaultSettings.userId;
      }
      return { ...defaultSettings, ...s };
    }
    return defaultSettings;
  }, [settingsList]);

  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  // Partner Room Polling Sync
  const syncPartnerRoom = useCallback(async () => {
    if (!settings.partnerCode) {
      setPartnerExpenses([]);
      return;
    }

    const fetched = await fetchRoomExpenses(settings.partnerCode);
    const localUser = settings.userName || 'User';
    
    // Filter out expenses logged by current device so we only get partner's expenses
    const roomPartnerItems = fetched.filter(item => {
      if (item.userName && item.userName === localUser) return false;
      return true;
    });

    setPartnerExpenses(roomPartnerItems);
  }, [settings.partnerCode, settings.userName]);

  useEffect(() => {
    if (settings.partnerCode) {
      syncPartnerRoom();
      const interval = setInterval(syncPartnerRoom, 8000);
      return () => clearInterval(interval);
    } else {
      setPartnerExpenses([]);
    }
  }, [settings.partnerCode, syncPartnerRoom]);

  // All combined expenses (mine + partner's)
  const allExpenses = useMemo(() => {
    const combined = [...localExpenses];
    const localCreatedAts = new Set(localExpenses.map(e => e.createdAt));

    partnerExpenses.forEach(pe => {
      if (!localCreatedAts.has(pe.createdAt)) {
        combined.push(pe);
      }
    });

    return combined.sort((a, b) => b.createdAt - a.createdAt);
  }, [localExpenses, partnerExpenses]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      const isMine = !exp.userName || exp.userName === settings.userName;

      if (filter.authorFilter === 'mine' && !isMine) return false;
      if (filter.authorFilter === 'partner' && isMine) return false;

      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const categoryName = categoriesMap.get(exp.categoryId)?.name.toLowerCase() || '';
        const notes = (exp.notes || '').toLowerCase();
        const city = (exp.city || '').toLowerCase();
        const author = (exp.userName || '').toLowerCase();
        const amountStr = exp.amount.toString();
        const matches = categoryName.includes(query) || notes.includes(query) || city.includes(query) || amountStr.includes(query) || author.includes(query);
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
  }, [allExpenses, filter, categoriesMap, settings.userName]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<number> => {
    const createdAt = Date.now();
    const newExpenseData: Expense = {
      city: settings.city || 'Home City',
      userId: settings.userId,
      userName: settings.userName || 'Valued User',
      userPhoto: settings.profilePhoto,
      partnerCode: settings.partnerCode,
      ...expenseData,
      createdAt,
    };

    const id = await db.expenses.add(newExpenseData);

    if (settings.partnerCode) {
      pushExpenseToPartner(settings.partnerCode, newExpenseData);
    }

    return id as number;
  };

  const updateExpense = async (id: number, expenseData: Partial<Expense>): Promise<void> => {
    const existing = await db.expenses.get(id);
    const updated = {
      ...expenseData,
      updatedAt: Date.now(),
    };

    await db.expenses.update(id, updated);

    if (settings.partnerCode && existing) {
      const fullUpdated = { ...existing, ...updated };
      pushExpenseToPartner(settings.partnerCode, fullUpdated);
    }
  };

  const deleteExpense = async (id: number): Promise<void> => {
    const target = await db.expenses.get(id);
    if (target) {
      setLastDeleted(target);
      await db.expenses.delete(id);

      if (settings.partnerCode && target.createdAt) {
        deleteExpenseFromPartner(settings.partnerCode, target.createdAt);
      }
    }
  };

  const undoDelete = async (): Promise<void> => {
    if (lastDeleted) {
      const { id, ...rest } = lastDeleted;
      const createdAt = Date.now();
      const restored = {
        ...rest,
        createdAt,
      };

      await db.expenses.add(restored);

      if (settings.partnerCode) {
        pushExpenseToPartner(settings.partnerCode, restored);
      }

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
        currency: '$',
        city: 'New York',
        firstDayOfWeek: 'Monday',
        defaultPaymentMethod: 'Cash',
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
    const allExp = await db.expenses.toArray();
    const allCategories = await db.categories.toArray();
    const allBudgets = await db.budgets.toArray();
    const allSettings = await db.settings.toArray();

    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      expenses: allExp,
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
        expenses: localExpenses,
        partnerExpenses,
        allExpenses,
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
        syncPartnerRoom,
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
