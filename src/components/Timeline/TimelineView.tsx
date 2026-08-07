import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatTimeDisplay } from '../../utils/formatters';
import { getCategoryMaterialIcon, getCategoryIconStyle } from '../UI/CategoryIcon';
import type { Expense } from '../../types';

interface TimelineViewProps {
  onEditExpense: (expense: Expense) => void;
  onOpenAddModal: () => void;
  onOpenFilterModal: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  onEditExpense,
  onOpenAddModal,
  onOpenFilterModal,
}) => {
  const { filteredExpenses, categoriesMap, deleteExpense, settings } = useExpenses();
  const [activeChip, setActiveChip] = useState<string>('All');
  const [searchInput, setSearchInput] = useState<string>('');

  // Group transactions by date heading (Today, Yesterday, Date)
  const groupedExpenses = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const filtered = filteredExpenses.filter(exp => {
      // Search text filter
      if (searchInput) {
        const q = searchInput.toLowerCase();
        const cat = (categoriesMap.get(exp.categoryId)?.name || '').toLowerCase();
        const notes = (exp.notes || '').toLowerCase();
        const city = (exp.city || '').toLowerCase();
        if (!cat.includes(q) && !notes.includes(q) && !city.includes(q) && !exp.amount.toString().includes(q)) {
          return false;
        }
      }

      // Chip filter
      if (activeChip === 'Income') return false; // single-user expense app focus
      if (activeChip === 'Expenses') return true;
      if (activeChip !== 'All') {
        const catName = categoriesMap.get(exp.categoryId)?.name || '';
        if (!catName.toLowerCase().includes(activeChip.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    const groups: { [key: string]: { label: string; items: Expense[] } } = {};

    filtered.forEach(exp => {
      let label = exp.date;
      if (exp.date === todayStr) {
        label = 'Today';
      } else if (exp.date === yesterdayStr) {
        label = 'Yesterday';
      } else {
        const d = new Date(exp.date);
        label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      }

      if (!groups[label]) {
        groups[label] = { label, items: [] };
      }
      groups[label].items.push(exp);
    });

    return Object.values(groups);
  }, [filteredExpenses, categoriesMap, searchInput, activeChip]);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Sticky Search & Filter Header */}
      <div style={{ position: 'sticky', top: 64, zIndex: 40, background: 'var(--surface)', backdropFilter: 'blur(12px)', padding: '12px 16px 8px 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              flex: 1,
              background: 'var(--surface-container-high)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              height: 48,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--outline)', marginRight: 8 }}>search</span>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: 14,
                color: 'var(--on-surface)',
              }}
            />
          </div>

          <button
            onClick={onOpenFilterModal}
            className="active-press"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--surface-container-high)',
              border: 'none',
              color: 'var(--on-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            marginTop: 12,
            paddingBottom: 4,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {['All', 'Income', 'Expenses', 'Food & Dining', 'Shopping', 'Transport'].map(chip => {
            const isActive = activeChip === chip;
            return (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary)' : 'var(--surface-container)',
                  color: isActive ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  boxShadow: isActive ? '0 2px 8px rgba(53,37,205,0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List Grouped by Date */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {groupedExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--surface-container-lowest)', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>No transactions found</h3>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 16 }}>We couldn't find any transactions matching your search criteria.</p>
            <button
              onClick={onOpenAddModal}
              style={{
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'var(--on-primary)',
                borderRadius: '9999px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Add Transaction
            </button>
          </div>
        ) : (
          groupedExpenses.map(group => (
            <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Group Heading */}
              <h3 style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: 4 }}>
                {group.label}
              </h3>

              {/* Group Card Container */}
              <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.items.map(exp => {
                  const category = categoriesMap.get(exp.categoryId);
                  const catName = category?.name || exp.categoryId;
                  const iconSymbol = getCategoryMaterialIcon(catName);
                  const style = getCategoryIconStyle(catName);

                  return (
                    <div
                      key={exp.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        borderRadius: '0.5rem',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '0.75rem',
                            background: style.bg,
                            color: style.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {iconSymbol}
                          </span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {catName}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {catName} • {formatTimeDisplay(exp.time)} {exp.city ? `• ${exp.city}` : ''}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, flexShrink: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>
                          -{formatCurrency(exp.amount, settings.currency)}
                        </p>
                        <button onClick={() => onEditExpense(exp)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 2 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                        </button>
                        <button onClick={() => exp.id && deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 2 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
