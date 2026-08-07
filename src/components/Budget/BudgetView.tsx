import React, { useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

export const BudgetView: React.FC = () => {
  const { budget, updateBudget, filteredExpenses, settings } = useExpenses();

  const totalMonthlyLimit = budget?.monthlyBudget || 3200;

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
  const totalSpent = useMemo(() => {
    return filteredExpenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses, currentMonthPrefix]);

  const remaining = Math.max(0, totalMonthlyLimit - totalSpent);
  const percentage = Math.min(100, Math.round((totalSpent / totalMonthlyLimit) * 100));

  return (
    <div style={{ padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header / Summary Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>Your Budgets</h1>
        <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Keep track of your spending limits for this month.</p>
      </div>

      {/* Budget Summary Widget */}
      <div style={{ background: 'var(--surface-container)', borderRadius: '0.75rem', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL MONTHLY BUDGET
            </span>
            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--on-surface)' }}>
              {formatCurrency(totalMonthlyLimit, settings.currency)}
            </span>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REMAINING
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--secondary)' }}>
              {formatCurrency(remaining, settings.currency)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'var(--outline-variant)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--primary)', borderRadius: '9999px', transition: 'width 0.8s cubic-bezier(0.2, 0, 0, 1)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)' }}>
          <span>{formatCurrency(totalSpent, settings.currency)} spent</span>
          <span>{percentage}% of total</span>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>Categories</h2>
        <button
          onClick={() => {
            const newLimit = prompt('Enter new Monthly Total Budget Limit:', totalMonthlyLimit.toString());
            if (newLimit && !isNaN(Number(newLimit))) {
              updateBudget({ monthlyBudget: Number(newLimit) });
            }
          }}
          className="active-press"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 12px',
            color: 'var(--primary)',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: '9999px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
          Edit Limits
        </button>
      </div>

      {/* Budget Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Card 1: Groceries (Normal) */}
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>Groceries</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>
              {formatCurrency(450, settings.currency)} / {formatCurrency(600, settings.currency)}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'var(--surface-variant)', overflow: 'hidden', margin: '8px 0', position: 'relative' }}>
            <div style={{ height: '100%', width: '75%', background: 'var(--secondary)', borderRadius: '9999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)' }}>
            <span>2 weeks left</span>
            <span style={{ fontWeight: 600 }}>75%</span>
          </div>
        </div>

        {/* Card 2: Entertainment (Warning) */}
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, width: 128, height: 128, background: 'rgba(255, 185, 95, 0.2)', borderBottomLeftRadius: 100, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--tertiary-fixed)', color: 'var(--on-tertiary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">movie</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>Entertainment</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>
              {formatCurrency(280, settings.currency)} / {formatCurrency(300, settings.currency)}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'var(--surface-variant)', overflow: 'hidden', margin: '8px 0', position: 'relative', zIndex: 10 }}>
            <div style={{ height: '100%', width: '93%', background: 'var(--tertiary)', borderRadius: '9999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, position: 'relative', zIndex: 10 }}>
            <span style={{ color: 'var(--tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span> Nearing limit
            </span>
            <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>93%</span>
          </div>
        </div>

        {/* Card 3: Subscriptions (Safe) */}
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">subscriptions</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>Subscriptions</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>
              {formatCurrency(85, settings.currency)} / {formatCurrency(100, settings.currency)}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'var(--surface-variant)', overflow: 'hidden', margin: '8px 0', position: 'relative' }}>
            <div style={{ height: '100%', width: '85%', background: 'var(--primary)', borderRadius: '9999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)' }}>
            <span>Fixed monthly</span>
            <span style={{ fontWeight: 600 }}>85%</span>
          </div>
        </div>

        {/* Card 4: Dining Out (Over Budget) */}
        <div style={{ background: 'rgba(255, 218, 214, 0.3)', borderRadius: '0.75rem', padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--error-container)', color: 'var(--on-error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>Dining Out</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--error)' }}>
              {formatCurrency(420, settings.currency)} / {formatCurrency(400, settings.currency)}
            </span>
          </div>
          <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'rgba(186, 26, 26, 0.2)', overflow: 'hidden', margin: '8px 0', position: 'relative', zIndex: 10 }}>
            <div style={{ height: '100%', width: '100%', background: 'var(--error)', borderRadius: '9999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, position: 'relative', zIndex: 10 }}>
            <span style={{ color: 'var(--error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span> Over budget by {formatCurrency(20, settings.currency)}
            </span>
            <span style={{ color: 'var(--error)', fontWeight: 600 }}>105%</span>
          </div>
        </div>

      </div>

      {/* Create New Budget Category Button */}
      <button
        onClick={() => {
          const catName = prompt('Enter new budget category name:');
          if (catName) {
            alert(`Category "${catName}" added!`);
          }
        }}
        className="active-press"
        style={{
          marginTop: 16,
          width: '100%',
          padding: '16px',
          borderRadius: '0.75rem',
          border: '2px dashed var(--outline-variant)',
          color: 'var(--on-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <span className="material-symbols-outlined">add_circle</span>
        Create New Budget Category
      </button>

    </div>
  );
};
