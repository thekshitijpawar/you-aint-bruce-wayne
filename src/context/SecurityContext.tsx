import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExpenses } from './ExpenseContext';

interface SecurityContextType {
  isLocked: boolean;
  pinError: string;
  failedAttempts: number;
  lockoutSeconds: number;
  verifyPin: (pin: string) => boolean;
  unlockApp: () => void;
  lockApp: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useExpenses();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

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

  // Handle countdown timer for rate limiting lockout
  useEffect(() => {
    let interval: any = null;
    if (lockoutSeconds > 0) {
      interval = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            setFailedAttempts(0);
            setPinError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutSeconds]);

  const isLocked = Boolean(settings.pinEnabled && settings.pinCode && settings.pinCode.length === 4 && !isUnlocked);

  const verifyPin = (enteredPin: string): boolean => {
    if (lockoutSeconds > 0) {
      setPinError(`Too many failed attempts. Please wait ${lockoutSeconds}s.`);
      return false;
    }

    if (enteredPin === settings.pinCode) {
      setIsUnlocked(true);
      setPinError('');
      setFailedAttempts(0);
      return true;
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        setLockoutSeconds(30);
        setPinError('Too many failed attempts. Locked out for 30s.');
      } else {
        setPinError(`Incorrect PIN. ${5 - nextAttempts} attempts remaining.`);
      }
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
    <SecurityContext.Provider value={{ isLocked, pinError, failedAttempts, lockoutSeconds, verifyPin, unlockApp, lockApp }}>
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
