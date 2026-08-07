import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const PinLockModal: React.FC = () => {
  const { isLocked, verifyPin, pinError } = useSecurity();
  const [enteredPin, setEnteredPin] = useState('');

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);

      if (next.length === 4) {
        setTimeout(() => {
          const success = verifyPin(next);
          if (!success) {
            setEnteredPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#080C14',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F9FAFB' }}>
          Expense Tracker Locked
        </h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
          Enter your 4-digit security PIN to access your financial data
        </p>
      </div>

      {/* PIN Dots Display */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[0, 1, 2, 3].map(index => {
          const isFilled = index < enteredPin.length;
          return (
            <div
              key={index}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: isFilled ? '#10B981' : 'transparent',
                border: '2px solid #374151',
                boxShadow: isFilled ? '0 0 12px rgba(16, 185, 129, 0.5)' : 'none',
                transition: 'all 0.15s ease',
              }}
            />
          );
        })}
      </div>

      {pinError && (
        <div style={{ color: '#FB7185', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          {pinError}
        </div>
      )}

      {/* Keypad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
          maxWidth: 280,
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'].map((k, i) => {
          if (k === '') return <div key={`pin-empty-${i}`} />;
          if (k === 'DEL') {
            return (
              <button
                key="pin-del"
                onClick={handleDelete}
                style={{
                  height: 60,
                  borderRadius: '50%',
                  background: '#1F2937',
                  border: 'none',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Delete size={22} />
              </button>
            );
          }

          return (
            <button
              key={`pin-btn-${k}-${i}`}
              onClick={() => handleDigit(k)}
              style={{
                height: 60,
                borderRadius: '50%',
                background: '#1F2937',
                border: '1px solid #374151',
                color: '#F9FAFB',
                fontSize: 22,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
              }}
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
};
