import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExpenses } from './ExpenseContext';

interface SecurityContextType {
  isLocked: boolean;
  pinError: string;
  verifyPin: (pin: string) => boolean;
  unlockApp: () => void;
  lockApp: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useExpenses();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');

  // Lock app when minimized / backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && settings.pinEnabled) {
        setIsUnlocked(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.pinEnabled]);

  const isLocked = Boolean(settings.pinEnabled && settings.pinCode && settings.pinCode.length === 4 && !isUnlocked);

  const verifyPin = (enteredPin: string): boolean => {
    if (enteredPin === settings.pinCode) {
      setIsUnlocked(true);
      setPinError('');
      return true;
    } else {
      setPinError('Incorrect PIN. Please try again.');
      return false;
    }
  };

  const unlockApp = () => {
    setIsUnlocked(true);
  };

  const lockApp = () => {
    setIsUnlocked(false);
  };

  return (
    <SecurityContext.Provider value={{ isLocked, pinError, verifyPin, unlockApp, lockApp }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
