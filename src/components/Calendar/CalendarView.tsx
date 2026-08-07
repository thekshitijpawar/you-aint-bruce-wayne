import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from '../../utils/formatters';
import { CategoryIcon } from '../UI/CategoryIcon';
import type { Expense } from '../../types';

interface CalendarViewProps {
  onEditExpense?: (expense: Expense) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = () => {
  const { expenses, categoriesMap, settings } = useExpenses();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayExpenses, setSelectedDayExpenses] = useState<Expense[] | null>(null);
  const [selectedDayStr, setSelectedDayStr] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const { calendarDays, dailyTotalsMap } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const totals = new Map<string, number>();
    expenses.forEach(e => {
      if (e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
        totals.set(e.date, (totals.get(e.date) || 0) + e.amount);
      }
    });

    const days = [];
    const adjustedFirstDay = settings.firstDayOfWeek === 'Monday' ? (firstDayIndex === 0 ? 6 : firstDayIndex - 1) : firstDayIndex;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr, total: totals.get(dateStr) || 0 });
    }

    return { calendarDays: days, dailyTotalsMap: totals };
  }, [year, month, expenses, settings.firstDayOfWeek]);

  const maxSpendInMonth = useMemo(() => {
    let max = 0;
    dailyTotalsMap.forEach(val => {
      if (val > max) max = val;
    });
    return max || 1;
  }, [dailyTotalsMap]);

  const handleDayClick = (dateStr: string) => {
    const dayList = expenses.filter(e => e.date === dateStr);
    setSelectedDayStr(dateStr);
    setSelectedDayExpenses(dayList);
  };

  return (
    <div style={{ padding: '16px 16px 100px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Monthly Overview
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
          Calendar View
        </h1>
      </div>

      {/* Month Navigator Toolbar */}
      <div
        className="app-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          marginBottom: 16,
        }}
      >
        <button
          onClick={handlePrevMonth}
          className="active-press"
          style={{
            background: 'var(--bg-card-hover)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
          {monthLabel}
        </span>

        <button
          onClick={handleNextMonth}
          className="active-press"
          style={{
            background: 'var(--bg-card-hover)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of Week Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {(settings.firstDayOfWeek === 'Monday'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        ).map(d => (
          <div key={d} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
        }}
      >
        {calendarDays.map((item, idx) => {
          if (!item) {
            return <div key={`empty-${idx}`} style={{ height: 62 }} />;
          }

          const { day, dateStr, total } = item;
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const ratio = total / maxSpendInMonth;

          let badgeBg = 'transparent';

          if (total > 0) {
            if (ratio > 0.6) {
              badgeBg = 'rgba(244, 63, 94, 0.25)';
            } else if (ratio > 0.3) {
              badgeBg = 'rgba(245, 158, 11, 0.25)';
            } else {
              badgeBg = 'rgba(16, 185, 129, 0.25)';
            }
          }

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className="active-press"
              style={{
                height: 62,
                borderRadius: 'var(--radius-md)',
                background: isToday ? 'var(--primary-light)' : 'var(--bg-card)',
                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 2px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? 'var(--primary)' : 'var(--text-primary)',
                }}
              >
                {day}
              </span>

              {total > 0 ? (
                <div
                  style={{
                    background: badgeBg,
                    padding: '2px 4px',
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 700,
                    color: ratio > 0.6 ? 'var(--danger)' : ratio > 0.3 ? 'var(--warning)' : 'var(--primary)',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {settings.currency}{total > 999 ? `${Math.round(total / 1000)}k` : total}
                </div>
              ) : (
                <div style={{ height: 14 }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Drawer Modal */}
      {selectedDayExpenses !== null && (
        <div className="modal-overlay" onClick={() => setSelectedDayExpenses(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Day Expenses
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>
                  {formatDateDisplay(selectedDayStr)}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDayExpenses(null)}
                style={{
                  background: 'var(--bg-card-hover)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedDayExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                No expenses logged on this day.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedDayExpenses.map(exp => {
                  const category = categoriesMap.get(exp.categoryId);
                  return (
                    <div
                      key={exp.id}
                      className="app-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        margin: 0,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-md)',
                            background: category ? `${category.color}25` : 'var(--bg-card-hover)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: category?.color || 'var(--primary)',
                          }}
                        >
                          <CategoryIcon name={category?.icon || 'Tag'} size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatTimeDisplay(exp.time)} — {category?.name || exp.categoryId}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span>{exp.paymentMethod} {exp.notes ? `• ${exp.notes}` : ''}</span>
                            {exp.userName && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: '9999px', background: 'var(--surface-container-high)', color: 'var(--primary)', border: '1px solid var(--outline-variant)' }}>
                                👤 {exp.userName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatCurrency(exp.amount, settings.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
