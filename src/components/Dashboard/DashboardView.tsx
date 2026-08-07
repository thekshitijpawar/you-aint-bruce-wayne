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
    let list = [...filteredExpenses].sort(
      (a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
    );
    if (recentTab === 'Out') list = list.filter(e => e.amount > 0);
    return list.slice(0, 6);
  }, [filteredExpenses, recentTab]);

  const insights = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.categoryId] = (map[e.categoryId] || 0) + e.amount; });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .map(([id, amount]) => ({ id, category: categoriesMap.get(id), amount, percentage: Math.min(100, Math.round((amount / total) * 100)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [filteredExpenses, categoriesMap]);

  const userName = settings.userName || 'Friend';
  const firstName = userName.split(' ')[0];
  const balanceStr = formatCurrency(summaryMetrics.balance, settings.currency);

  return (
    <div style={{ paddingBottom: 100, background: 'var(--surface)', minHeight: '100%' }}>

      {/* Greeting Header */}
      <div style={{ padding: '20px 20px 8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Good day,</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.02em' }}>
            Hi, {firstName} 👋
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--on-surface-variant)' }}
            onClick={() => onNavigateTab('settings')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
          </button>
          <img
            src={settings.profilePhoto || "https://lh3.googleusercontent.com/aida-public/AB6AXuBFz6ZwYxKqDE_VcKK4pktAGb8GoX2lRz2rDkDvpzhHi3dZhL6d-N-fmFEa_fzBd4VfJ5USYJ3vEFeil_psZP0LY9MghFVGlqPXP_X9GGiOEVRLKap7BsN6-9tyM76Zi87mTXupIFFKGPtCQZCsHyQ8Xld43X_cpm_FGCO1I8xGztFq9FnUT24NSypW-mPUyW8P8Qw0tpY_sVaervsIqADLbXzKXrzNfXpnbJVH6dg4UGObeYVMUg"}
            alt="Profile"
            onClick={() => onNavigateTab('settings')}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid var(--primary)' }}
          />
        </div>
      </div>

      {/* Premium Balance Card */}
      <div style={{ padding: '8px 20px 0 20px' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: '1.5rem',
            padding: '28px 24px 24px 24px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #3522cd 0%, #5b46f5 45%, #7c6fff 100%)',
            boxShadow: '0 20px 40px rgba(53, 34, 205, 0.45)',
            minHeight: 200,
          }}
        >
          {/* Floating decorative circles */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 40, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: 40, right: 100, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Current Balance
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: 20 }}>
              {balanceStr}
            </div>

            {/* Card Number Style */}
            <div style={{ fontSize: 15, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 20 }}>
              •••• •••• •••• 8398
            </div>

            {/* Income / Expense Row */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#6ee7b7' }}>arrow_downward</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Income</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>
                  +{formatCurrency(summaryMetrics.monthlyIncome, settings.currency)}
                </div>
              </div>

              <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.2)', margin: '0 16px' }} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#fca5a5' }}>arrow_upward</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Expenses</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>
                  -{formatCurrency(summaryMetrics.monthTotal, settings.currency)}
                </div>
              </div>

              {/* Mastercard-style logo */}
              <div style={{ display: 'flex', marginLeft: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F79E1B', opacity: 0.9, marginLeft: -10 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div style={{ padding: '24px 20px 8px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { icon: 'send', label: 'Send', color: '#818CF8', bg: 'rgba(129,140,248,0.12)', action: onOpenAddModal },
            { icon: 'payments', label: 'Pay', color: '#34D399', bg: 'rgba(52,211,153,0.12)', action: () => onNavigateTab('timeline') },
            { icon: 'phone_iphone', label: 'Recharge', color: '#F97316', bg: 'rgba(249,115,22,0.12)', action: () => onNavigateTab('budget') },
            { icon: 'bolt', label: 'Electricity\nBill', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', action: () => onNavigateTab('analytics') },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '1rem', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textAlign: 'center', maxWidth: 60, lineHeight: 1.2, whiteSpace: 'pre-line' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spending Insights (Top Categories) */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1.25rem', padding: '20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--on-surface)' }}>Top Categories</h2>
            <span onClick={() => onNavigateTab('analytics')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>See More ↓</span>
          </div>

          {insights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--on-surface-variant)', fontSize: 13 }}>
              No spending recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {insights.map(item => {
                const catName = item.category?.name || item.id;
                const iconSymbol = getCategoryMaterialIcon(catName);
                const style = getCategoryIconStyle(catName);
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>{iconSymbol}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>{catName}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)' }}>{item.percentage}%</span>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: style.color }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)' }}>
                            {formatCurrency(item.amount, settings.currency)}
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'var(--surface-container-high)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: style.color, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '1.25rem', padding: '20px', border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                This month
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--on-surface)' }}>Transactions</h2>
            </div>
            {/* Segment pills */}
            <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: '9999px', padding: 3 }}>
              {(['All', 'In', 'Out'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRecentTab(tab)}
                  style={{
                    padding: '4px 12px',
                    background: recentTab === tab ? 'var(--primary)' : 'transparent',
                    color: recentTab === tab ? '#ffffff' : 'var(--on-surface-variant)',
                    borderRadius: '9999px',
                    fontSize: 11,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
              <div style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: 15 }}>No transactions yet</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>Tap the + button to add your first</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentTransactions.map((exp, idx) => {
                const category = categoriesMap.get(exp.categoryId);
                const catName = category?.name || exp.categoryId;
                const iconSymbol = getCategoryMaterialIcon(catName);
                const style = getCategoryIconStyle(catName);
                const isMine = !exp.userName || exp.userName === settings.userName;

                return (
                  <div
                    key={exp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: idx < recentTransactions.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                    }}
                  >
                    {/* Icon avatar */}
                    <div style={{ position: 'relative', marginRight: 14, flexShrink: 0 }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 22 }}>{iconSymbol}</span>
                      </div>
                      {!isMine && (
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: '#818CF8', border: '2px solid var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
                          👤
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {catName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>{formatDateDisplay(exp.date)}, {formatTimeDisplay(exp.time)}</span>
                        {exp.userName && !isMine && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: '9999px', background: 'rgba(129,140,248,0.12)', color: '#818CF8' }}>
                            {exp.userName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount + edit/delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: isMine ? 'var(--on-surface)' : '#818CF8' }}>
                        -{formatCurrency(exp.amount, settings.currency)}
                      </div>
                      {isMine && (
                        <>
                          <button onClick={() => onEditExpense(exp)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
                          </button>
                          <button onClick={() => exp.id && deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => onNavigateTab('timeline')}
            style={{ width: '100%', marginTop: 16, padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: 14, background: 'transparent', cursor: 'pointer' }}
          >
            View All Transactions
          </button>
        </div>
      </div>

    </div>
  );
};
