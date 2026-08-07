import React, { useMemo, useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from '../../utils/formatters';
import { getCategoryMaterialIcon, getCategoryIconStyle } from '../UI/CategoryIcon';
import type { Expense } from '../../types';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onOpenFilterModal?: () => void;
  onNavigateTab: (tab: string) => void;
  onEditExpense: (expense: Expense) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onNavigateTab,
  onEditExpense,
}) => {
  const { filteredExpenses, categoriesMap, budget, settings, deleteExpense } = useExpenses();
  const [recentTab, setRecentTab] = useState<'All' | 'In' | 'Out'>('All');

  const summaryMetrics = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7);

    const monthExpenses = filteredExpenses.filter(e => e.date.startsWith(currentMonthPrefix));
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyIncome = budget?.monthlyBudget || 5100;
    const balance = Math.max(0, monthlyIncome - monthTotal);

    return { monthTotal, monthlyIncome, balance };
  }, [filteredExpenses, budget?.monthlyBudget]);

  const recentTransactions = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
      .slice(0, 6);
  }, [filteredExpenses]);

  // Insights breakdown (dynamic per category with exact icons)
  const insights = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;

    return Object.entries(map)
      .map(([id, amount]) => ({
        id,
        category: categoriesMap.get(id),
        amount,
        percentage: Math.min(100, Math.round((amount / total) * 100)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [filteredExpenses, categoriesMap]);

  // Currency breakdown for display
  const balanceFormatted = formatCurrency(summaryMetrics.balance, settings.currency);
  const mainBalanceParts = balanceFormatted.split('.');
  const intPart = mainBalanceParts[0];
  const decPart = mainBalanceParts[1] ? `.${mainBalanceParts[1]}` : '.00';

  return (
    <div style={{ padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Main Balance Card */}
      <div
        style={{
          position: 'relative',
          background: 'var(--primary-container)',
          color: 'var(--on-primary-container)',
          borderRadius: '1rem',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Balance
          </span>

          <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8, marginBottom: 24, letterSpacing: '-0.02em' }}>
            {intPart}
            <span style={{ fontSize: 24, opacity: 0.5 }}>{decPart}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_downward</span>
                Income
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--secondary-container)' }}>
                +{formatCurrency(summaryMetrics.monthlyIncome, settings.currency)}
              </div>
            </div>

            <div style={{ width: 1, height: 40, background: 'rgba(218, 215, 255, 0.2)' }} />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_upward</span>
                Expenses
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                - {formatCurrency(summaryMetrics.monthTotal, settings.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative SVG */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 192,
            height: 192,
            color: 'var(--on-primary-container)',
            opacity: 0.05,
            transform: 'translate(32px, -32px)',
          }}
          fill="currentColor"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="100" />
          <circle style={{ fill: 'var(--primary-container)' }} cx="150" cy="50" r="40" />
        </svg>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <button
          onClick={onOpenAddModal}
          className="active-press"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--surface-container)',
            padding: '12px 0',
            borderRadius: '0.75rem',
            border: '1px solid var(--outline-variant)',
            color: 'var(--on-surface)',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ margin: 'auto' }}>send</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Send</span>
        </button>

        <button
          onClick={() => onNavigateTab('reports')}
          className="active-press"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--surface-container)',
            padding: '12px 0',
            borderRadius: '0.75rem',
            border: '1px solid var(--outline-variant)',
            color: 'var(--on-surface)',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ margin: 'auto' }}>download</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Receive</span>
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="active-press"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--surface-container)',
            padding: '12px 0',
            borderRadius: '0.75rem',
            border: '1px solid var(--outline-variant)',
            color: 'var(--on-surface)',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(251, 113, 133, 0.15)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ margin: 'auto' }}>more_horiz</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>More</span>
        </button>
      </div>

      {/* Spending Insights Card with Exact Category Logos/Icons */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>Insights</h2>
          <span onClick={() => onNavigateTab('analytics')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>See all</span>
        </div>

        {insights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--on-surface-variant)', fontSize: 13 }}>
            No spending recorded yet. Tap the + button to add your first transaction!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {insights.map(item => {
              const catName = item.category?.name || item.id;
              const iconSymbol = getCategoryMaterialIcon(catName);
              const style = getCategoryIconStyle(catName);

              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {catName}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)' }}>
                        {formatCurrency(item.amount, settings.currency)}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'var(--surface-container-high)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.percentage}%`, background: style.color, borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions Card with Exact Category Logos/Icons */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1rem', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>Recent</h2>
          
          {/* Segment Filter Pills */}
          <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: '9999px', padding: 4 }}>
            {(['All', 'In', 'Out'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRecentTab(tab)}
                style={{
                  padding: '4px 12px',
                  background: recentTab === tab ? 'var(--surface-container-lowest)' : 'transparent',
                  color: recentTab === tab ? 'var(--primary)' : 'var(--on-surface-variant)',
                  borderRadius: '9999px',
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  boxShadow: recentTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--on-surface-variant)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
            <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 15 }}>No transactions logged yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap the + button to add your first transaction</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recentTransactions.map(exp => {
              const category = categoriesMap.get(exp.categoryId);
              const catName = category?.name || exp.categoryId;
              const iconSymbol = getCategoryMaterialIcon(catName);
              const style = getCategoryIconStyle(catName);

              return (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {catName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                        {formatDateDisplay(exp.date)}, {formatTimeDisplay(exp.time)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>
                      -{formatCurrency(exp.amount, settings.currency)}
                    </div>
                    <button onClick={() => onEditExpense(exp)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                    </button>
                    <button onClick={() => exp.id && deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => onNavigateTab('timeline')}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '12px',
            border: '1px solid var(--outline-variant)',
            borderRadius: '0.75rem',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: 14,
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          View All Transactions
        </button>
      </div>

    </div>
  );
};
