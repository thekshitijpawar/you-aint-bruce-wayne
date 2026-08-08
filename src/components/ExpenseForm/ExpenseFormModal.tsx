import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { getCategoryMaterialIcon, getCategoryIconStyle } from '../UI/CategoryIcon';
import { getTodayDateString } from '../../utils/formatters';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: any;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { addExpense, updateExpense, categories, settings } = useExpenses();

  const [amountStr, setAmountStr] = useState<string>(expenseToEdit ? expenseToEdit.amount.toString() : '0');
  const [selectedCatId, setSelectedCatId] = useState<string>(expenseToEdit ? expenseToEdit.categoryId : (settings.defaultCategory || 'food'));
  const [date, setDate] = useState<string>(expenseToEdit ? expenseToEdit.date : getTodayDateString());
  const [notes, setNotes] = useState<string>(expenseToEdit ? expenseToEdit.notes || '' : '');

  React.useEffect(() => {
    if (isOpen && expenseToEdit && expenseToEdit.userName && expenseToEdit.userName !== settings.userName) {
      alert("Partner's expenses can only be edited or deleted on their own phone.");
      onClose();
    }
  }, [isOpen, expenseToEdit, settings.userName, onClose]);

  if (!isOpen) return null;

  const handleKeypadVal = (val: string) => {
    if (val === 'backspace') {
      setAmountStr(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(prev => prev + '.');
      }
    } else {
      setAmountStr(prev => (prev === '0' ? val : prev + val));
    }
  };

  const handleSave = async () => {
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) return;

    if (expenseToEdit && expenseToEdit.id) {
      await updateExpense(expenseToEdit.id, {
        amount: num,
        categoryId: selectedCatId,
        date,
        notes,
      });
    } else {
      await addExpense({
        amount: num,
        categoryId: selectedCatId,
        date,
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: settings.defaultPaymentMethod || 'UPI',
        city: settings.city || 'Mumbai',
        notes,
      });
    }

    onClose();
  };

  // Amount display formatting
  const mainParts = amountStr.split('.');
  const intDisplay = mainParts[0] || '0';
  const decDisplay = mainParts.length > 1 ? `.${mainParts[1]}` : '.00';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          padding: 0,
          borderRadius: '1.5rem 1.5rem 0 0',
          background: 'var(--surface)',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <header
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 16,
            background: 'var(--surface)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--surface-container-high)',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--on-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>
            {expenseToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </span>
        </header>

        <div style={{ padding: '16px 16px 24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Amount Display Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Enter Amount
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginRight: 4 }}>
                {settings.currency}
              </span>
              <span style={{ fontSize: 44, fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
                {intDisplay}
              </span>
              <span style={{ fontSize: 24, fontWeight: 700, color: mainParts.length > 1 ? 'var(--on-surface)' : 'var(--outline-variant)', marginLeft: 2 }}>
                {decDisplay}
              </span>
            </div>
          </div>

          {/* Category Selector (Horizontal Scroll) */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
              {categories.map(cat => {
                const isSelected = selectedCatId === cat.id;
                const iconSymbol = getCategoryMaterialIcon(cat.name);
                const iconStyle = getCategoryIconStyle(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      border: 'none',
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary)' : 'var(--surface-container)',
                      color: isSelected ? 'var(--on-primary)' : 'var(--on-surface)',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0", color: isSelected ? 'var(--on-primary)' : iconStyle.color }}>
                      {iconSymbol}
                    </span>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Bento Box */}
          <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            {/* Date Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface)' }}>calendar_today</span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer' }}
                />
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>chevron_right</span>
            </div>

            <div style={{ height: 1, width: '100%', background: 'var(--surface-container-high)' }} />

            {/* Note Input */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface)' }}>notes</span>
              </div>
              <input
                type="text"
                placeholder="Add a note (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 14, color: 'var(--on-surface)', outline: 'none' }}
              />
            </div>

            {/* Photo Attachments Row */}
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px 16px', overflowX: 'auto' }}>
              <button
                type="button"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '0.5rem',
                  background: 'var(--surface-container)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--outline)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined">add_a_photo</span>
              </button>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '0.5rem',
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKmx9TEM0RsqO88qPzLpDYfU4tXy4nCps6ncnnsvkeD0pOaoMMZM1NLSRBo2gjuCIvxjYYcHTiusMOQbICwaXWI4urFYSQYDjZY7TgZ7BFQa9QW46IVfj5eOH3dZi829Tnr-hNk9yCjJ0-xSZCYo0_ZmgFvI8MiOCAs2jHBNL97VDUBfg9Gi44DiO8RPCbjnDT9t6pQNr-Xjx5OIvbq5fJzNf-VUQtkc-JjEuvrGTkgstweMD5Kw')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              />

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '0.5rem',
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuApMWFEAv1JSEMsRWGcwedMckxj8Qj47YCuH_QElYepW2KK50Wh51N_sTIV_euvTwGv-uKy05MSss3Q3ee1mOceOzfuSbgClZUFh_ngmr1z2dVAAYpe1vatQe0rEchqPuRX9bw8KrMfUaaInUVoos6EhXsMVs0tLRYglnqlWV0chCU7xH5P9ikZ23zKhl8E2rTP3ZPXcXWLrG0crhJkmYGwLh8XA45ehOY_xv1S9bL407SwrvJTDA')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              />
            </div>
          </div>

          {/* Keypad */}
          <div className="keypad-grid">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((btn, idx) => (
              <button
                key={`keypad-${btn}-${idx}`}
                type="button"
                className="keypad-btn"
                onClick={() => handleKeypadVal(btn)}
              >
                {btn === 'backspace' ? (
                  <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>backspace</span>
                ) : (
                  btn
                )}
              </button>
            ))}
          </div>

          {/* Save Transaction Button */}
          <button
            type="button"
            onClick={handleSave}
            className="active-press"
            style={{
              width: '100%',
              height: 56,
              borderRadius: '0.5rem',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
            }}
          >
            Save Transaction
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
          </button>
        </div>

      </div>
    </div>
  );
};
