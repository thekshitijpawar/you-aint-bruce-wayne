import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
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
  requestNotificationPermission: () => Promise<void>;
  scheduleNotifications: () => Promise<void>;
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
      firstDayOfWeek: 'Monday',
      defaultPaymentMethod: 'Cash',
      defaultCategory: 'food',
      eveningReminder: true,
      reminderTime: '21:00',
      notificationEnabled: false,
      notificationTimes: ['21:00'],
      notificationFrequency: 1,
    };

    if (settingsList && settingsList.length > 0) {
      const s = settingsList[0];
      if (!s.userId) {
        s.userId = defaultSettings.userId;
      }
      // Migrate old settings
      return { 
        ...defaultSettings, 
        ...s,
        notificationEnabled: s.notificationEnabled ?? false,
        notificationTimes: s.notificationTimes ?? ['21:00'],
        notificationFrequency: s.notificationFrequency ?? 1,
      };
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

  const filteredExpenses = useMemo(() => {
    return localExpenses.filter(exp => {
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
  }, [localExpenses, filter, categoriesMap]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<number> => {
    const createdAt = Date.now();
    const newExpenseData: Expense = {
      city: settings.city || 'Home City',
      userId: settings.userId,
      userName: settings.userName || 'Valued User',
      ...expenseData,
      createdAt,
    };

    const id = await db.expenses.add(newExpenseData);
    return id as number;
  };

  const updateExpense = async (id: number, expenseData: Partial<Expense>): Promise<void> => {
    const updated = {
      ...expenseData,
      updatedAt: Date.now(),
    };

    await db.expenses.update(id, updated);
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
      const { id: _id, ...rest } = lastDeleted;
      const createdAt = Date.now();
      const restored = {
        ...rest,
        createdAt,
      };

      await db.expenses.add(restored);
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
        notificationEnabled: false,
        notificationTimes: ['21:00'],
        notificationFrequency: 1,
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

  // Notification functions
  const isNative = async (): Promise<boolean> => {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  };

  const requestNotificationPermission = useCallback(async (): Promise<void> => {
    try {
      const native = await isNative();
      
      if (native) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const result = await LocalNotifications.requestPermissions();
        if (result.display !== 'granted') {
          await updateSettings({ notificationEnabled: false });
        }
      } else {
        if (!('Notification' in window)) return;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          await updateSettings({ notificationEnabled: false });
        }
      }
    } catch (e) {
      console.error('Notification permission error:', e);
      await updateSettings({ notificationEnabled: false });
    }
  }, [updateSettings]);

  const scheduleNotifications = useCallback(async (): Promise<void> => {
    try {
      const native = await isNative();
      const times = settings.notificationTimes.slice(0, settings.notificationFrequency);
      
      if (native) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        // Cancel existing notifications
        await LocalNotifications.cancel({ notifications: times.map((_, i) => ({ id: i + 1 })) });
        
        // Schedule new notifications
        for (let i = 0; i < times.length; i++) {
          const [hours, minutes] = times[i].split(':').map(Number);
          const now = new Date();
          const scheduledDate = new Date();
          scheduledDate.setHours(hours, minutes, 0, 0);
          
          if (scheduledDate <= now) {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
          }
          
          await LocalNotifications.schedule({
            notifications: [
              {
                id: i + 1,
                title: "You Ain't Bruce Wayne",
                body: "Time to record your expenses! 💰",
                schedule: { at: scheduledDate },
                sound: 'default',
                autoCancel: true
              }
            ]
          });
        }
      } else {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        times.forEach(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const notificationTime = new Date(today);
          notificationTime.setHours(hours, minutes, 0, 0);
          
          if (notificationTime <= now) {
            notificationTime.setDate(notificationTime.getDate() + 1);
          }
          
          const delay = notificationTime.getTime() - now.getTime();
          
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
              if (Notification.permission === 'granted') {
                new Notification('You Ain\'t Bruce Wayne', {
                  body: 'Time to record your expenses! 💰',
                  icon: '/vite.svg',
                  tag: 'expense-reminder',
                  requireInteraction: false,
                });
              }
            }, delay);
          }
        });
      }
    } catch (e) {
      console.error('Schedule notifications error:', e);
    }
  }, [settings.notificationTimes, settings.notificationFrequency]);

  useEffect(() => {
    if (settings.notificationEnabled) {
      scheduleNotifications();
    }
  }, [settings.notificationEnabled, settings.notificationTimes, settings.notificationFrequency, scheduleNotifications]);

  useEffect(() => {
    if (settings.notificationEnabled && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  }, [settings.notificationEnabled, requestNotificationPermission]);

  return (
    <ExpenseContext.Provider
      value={{
        expenses: localExpenses,
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
        requestNotificationPermission,
        scheduleNotifications,
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
