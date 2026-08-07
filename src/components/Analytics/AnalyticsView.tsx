import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
} from 'recharts';
import { useExpenses } from '../../context/ExpenseContext';
import type { TimeRange } from '../../types';
import { formatCurrency, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { expenses, categoriesMap, settings } = useExpenses();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const now = new Date();

  // Filter expenses by selected time range
  const filteredData = useMemo(() => {
    return expenses.filter(e => {
      if (timeRange === 'week') {
        const start = getStartOfWeek(now, settings.firstDayOfWeek).toISOString().split('T')[0];
        const end = getEndOfWeek(now, settings.firstDayOfWeek).toISOString().split('T')[0];
        return e.date >= start && e.date <= end;
      } else if (timeRange === 'month') {
        const start = getStartOfMonth(now).toISOString().split('T')[0];
        const end = getEndOfMonth(now).toISOString().split('T')[0];
        return e.date >= start && e.date <= end;
      } else if (timeRange === 'quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const start = new Date(now.getFullYear(), quarterMonth, 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), quarterMonth + 3, 0).toISOString().split('T')[0];
        return e.date >= start && e.date <= end;
      } else if (timeRange === 'year') {
        const start = getStartOfYear(now).toISOString().split('T')[0];
        const end = getEndOfYear(now).toISOString().split('T')[0];
        return e.date >= start && e.date <= end;
      } else if (timeRange === 'custom') {
        if (customStart && e.date < customStart) return false;
        if (customEnd && e.date > customEnd) return false;
        return true;
      }
      return true;
    });
  }, [expenses, timeRange, customStart, customEnd, now, settings.firstDayOfWeek]);

  const totalSpent = useMemo(() => {
    return filteredData.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredData]);

  // Category Pie Chart Data
  const categoryPieData = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach(e => {
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount);
    });

    const result = Array.from(map.entries()).map(([catId, amount]) => {
      const cat = categoriesMap.get(catId);
      return {
        name: cat?.name || catId,
        amount,
        color: cat?.color || '#6366f1',
        icon: cat?.icon || 'Tag',
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      };
    });

    return result.sort((a, b) => b.amount - a.amount);
  }, [filteredData, categoriesMap, totalSpent]);

  // Monthly Spending Trend Data
  const trendData = useMemo(() => {
    const map = new Map<string, number>();
    filteredData.forEach(e => {
      map.set(e.date, (map.get(e.date) || 0) + e.amount);
    });

    const sortedDates = Array.from(map.keys()).sort();
    return sortedDates.map(date => ({
      date: date.slice(5),
      amount: map.get(date) || 0,
    }));
  }, [filteredData]);

  // Key Statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgDaily: 0,
        highestDay: { date: 'N/A', amount: 0 },
        lowestDay: { date: 'N/A', amount: 0 },
      };
    }

    const dayMap = new Map<string, number>();
    filteredData.forEach(e => {
      dayMap.set(e.date, (dayMap.get(e.date) || 0) + e.amount);
    });

    let maxDay = { date: '', amount: 0 };
    let minDay = { date: '', amount: Infinity };

    dayMap.forEach((amt, d) => {
      if (amt > maxDay.amount) maxDay = { date: d, amount: amt };
      if (amt < minDay.amount) minDay = { date: d, amount: amt };
    });

    const totalDays = dayMap.size || 1;
    const avgDaily = totalSpent / totalDays;

    return {
      avgDaily,
      highestDay: maxDay,
      lowestDay: minDay.amount === Infinity ? { date: 'N/A', amount: 0 } : minDay,
    };
  }, [filteredData, totalSpent]);

  return (
    <div style={{ padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Insights & Analytics
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface)', marginTop: 2 }}>
          Spending Analytics
        </h1>
      </div>

      {/* Time Range Selector Pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {(['week', 'month', 'quarter', 'year', 'custom'] as TimeRange[]).map(r => {
          const isActive = timeRange === r;
          return (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className="active-press"
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '9999px',
                background: isActive ? 'var(--primary)' : 'var(--surface-container-high)',
                color: isActive ? 'var(--on-primary)' : 'var(--on-surface)',
                border: '1px solid var(--outline-variant)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker */}
      {timeRange === 'custom' && (
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)' }}>From Date</label>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 13,
                marginTop: 4,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)' }}>To Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 13,
                marginTop: 4,
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Top Stat Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 600 }}>
            <Zap size={16} color="var(--primary)" /> Avg Daily Spend
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>
            {formatCurrency(stats.avgDaily, settings.currency)}
          </div>
        </div>

        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 600 }}>
            <Award size={16} color="var(--secondary)" /> Transactions
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>
            {filteredData.length} Items
          </div>
        </div>
      </div>

      {/* Category Breakdown Donut Chart */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <PieIcon size={18} color="var(--primary)" />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
            Spending by Category
          </span>
        </div>

        {categoryPieData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--on-surface-variant)' }}>
            No data for this time period.
          </div>
        ) : (
          <>
            <div style={{ height: 220, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="amount"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(val, settings.currency), 'Amount']}
                    contentStyle={{
                      backgroundColor: 'var(--surface-container-high)',
                      borderColor: 'var(--outline-variant)',
                      borderRadius: '12px',
                      color: 'var(--on-surface)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                    labelStyle={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}
                    itemStyle={{ color: 'var(--secondary)', fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Categories Breakdown List */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoryPieData.slice(0, 5).map(cat => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: cat.color,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                      {cat.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      {cat.percentage}%
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>
                      {formatCurrency(cat.amount, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Spending Trend Bar Chart */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <TrendingUp size={18} color="var(--secondary)" />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
            Spending Timeline Trend
          </span>
        </div>

        <div style={{ height: 190, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis
                dataKey="date"
                stroke="var(--on-surface-variant)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--outline-variant)' }}
                tick={{ fill: 'var(--on-surface-variant)' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.12)' }}
                formatter={(val: any) => [formatCurrency(val, settings.currency), 'Spent']}
                contentStyle={{
                  backgroundColor: 'var(--surface-container-high)',
                  borderColor: 'var(--outline-variant)',
                  borderRadius: '12px',
                  color: 'var(--on-surface)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: 'var(--on-surface-variant)', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
              />
              <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Highest & Lowest Spend Days */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--error)', fontSize: 12, fontWeight: 600 }}>
            <ArrowUpRight size={16} /> Highest Spend Day
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--on-surface)' }}>
            {formatCurrency(stats.highestDay.amount, settings.currency)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>
            {stats.highestDay.date || 'N/A'}
          </div>
        </div>

        <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--secondary)', fontSize: 12, fontWeight: 600 }}>
            <ArrowDownRight size={16} /> Lowest Spend Day
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--on-surface)' }}>
            {formatCurrency(stats.lowestDay.amount, settings.currency)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>
            {stats.lowestDay.date || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
