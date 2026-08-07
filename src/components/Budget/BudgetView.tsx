import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryMaterialIcon, getCategoryIconStyle } from '../UI/CategoryIcon';
import type { Category } from '../../types';

export const BudgetView: React.FC = () => {
  const { budget, updateBudget, categories, addCategory, updateCategory, filteredExpenses, settings } = useExpenses();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [limitInput, setLimitInput] = useState<string>('0');
  
  const [isTotalBudgetModalOpen, setIsTotalBudgetModalOpen] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState<string>('0');

  // Create New Budget Category State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('0');

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  // Spent per category for current month
  const categorySpentMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .forEach(e => {
        const curr = map.get(e.categoryId) || 0;
        map.set(e.categoryId, curr + e.amount);
      });
    return map;
  }, [filteredExpenses, currentMonthPrefix]);

  const totalSpent = useMemo(() => {
    return filteredExpenses
      .filter(e => e.date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses, currentMonthPrefix]);

  const totalMonthlyLimit = budget?.monthlyBudget || 0;
  const remainingTotal = Math.max(0, totalMonthlyLimit - totalSpent);
  const totalPercentage = totalMonthlyLimit > 0 ? Math.min(100, Math.round((totalSpent / totalMonthlyLimit) * 100)) : 0;

  const openCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    setLimitInput((cat.budget ?? 0).toString());
    setIsEditModalOpen(true);
  };

  const handleSaveCategoryLimit = async () => {
    if (!editingCategory) return;
    const val = parseFloat(limitInput);
    const newBudget = isNaN(val) || val < 0 ? 0 : val;
    await updateCategory(editingCategory.id, { budget: newBudget });
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const openTotalBudgetEdit = () => {
    setTotalBudgetInput((budget?.monthlyBudget || 0).toString());
    setIsTotalBudgetModalOpen(true);
  };

  const handleSaveTotalBudget = async () => {
    const val = parseFloat(totalBudgetInput);
    const newTotal = isNaN(val) || val < 0 ? 0 : val;
    await updateBudget({ monthlyBudget: newTotal });
    setIsTotalBudgetModalOpen(false);
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const limitNum = parseFloat(newCatLimit);
    const budgetVal = isNaN(limitNum) || limitNum < 0 ? 0 : limitNum;

    const assignedIcon = getCategoryMaterialIcon(newCatName.trim());
    const assignedStyle = getCategoryIconStyle(newCatName.trim());

    await addCategory({
      name: newCatName.trim(),
      icon: assignedIcon,
      color: assignedStyle.color,
      budget: budgetVal,
    });

    setNewCatName('');
    setNewCatLimit('0');
    setIsCreateModalOpen(false);
  };

  return (
    <div style={{ padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header / Summary Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--on-surface)' }}>Your Budgets</h1>
        <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Track spending limits per category for this month.</p>
      </div>

      {/* Budget Summary Widget */}
      <div style={{ background: 'var(--surface-container)', borderRadius: '1rem', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL MONTHLY BUDGET
            </span>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--on-surface)' }}>
              {formatCurrency(totalMonthlyLimit, settings.currency)}
            </span>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REMAINING
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: totalMonthlyLimit > 0 && totalSpent > totalMonthlyLimit ? 'var(--error)' : 'var(--secondary)' }}>
              {formatCurrency(remainingTotal, settings.currency)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'var(--outline-variant)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: '100%', width: `${totalPercentage}%`, background: totalPercentage >= 100 ? 'var(--error)' : 'var(--primary)', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--on-surface-variant)' }}>
          <span>{formatCurrency(totalSpent, settings.currency)} spent this month</span>
          <button
            onClick={openTotalBudgetEdit}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
          >
            ✏️ Set Total Limit
          </button>
        </div>
      </div>

      {/* Categories Bar & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--on-surface)' }}>Categories</h2>
        <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Tap category to edit limit</span>
      </div>

      {/* Dynamic Category Budget Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {categories.map(cat => {
          const spent = categorySpentMap.get(cat.id) || 0;
          const limit = cat.budget ?? 0;
          const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
          const isOver = limit > 0 && spent > limit;
          const isWarning = limit > 0 && percent >= 85 && !isOver;
          const iconSymbol = getCategoryMaterialIcon(cat.name);
          const iconStyle = getCategoryIconStyle(cat.name);

          return (
            <div
              key={cat.id}
              onClick={() => openCategoryEdit(cat)}
              className="active-press"
              style={{
                background: isOver
                  ? 'rgba(239, 68, 68, 0.12)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'var(--surface-container-lowest)',
                borderRadius: '0.85rem',
                padding: 16,
                border: isOver ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--outline-variant)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: cat.color ? `${cat.color}25` : iconStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: cat.color || iconStyle.color, fontVariationSettings: "'FILL' 1" }}>
                      {iconSymbol}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Tap to edit limit</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: isOver ? 'var(--error)' : 'var(--on-surface)' }}>
                    {formatCurrency(spent, settings.currency)} / <span style={{ color: limit === 0 ? 'var(--on-surface-variant)' : 'var(--on-surface)' }}>{formatCurrency(limit, settings.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 8, borderRadius: '9999px', background: 'var(--surface-container-high)', overflow: 'hidden', margin: '8px 0' }}>
                <div
                  style={{
                    height: '100%',
                    width: limit === 0 ? '0%' : `${percent}%`,
                    background: isOver ? 'var(--error)' : isWarning ? '#F59E0B' : 'var(--secondary)',
                    borderRadius: '9999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* Footer Status Message */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, alignItems: 'center' }}>
                {limit === 0 ? (
                  <span style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>Default Limit: {formatCurrency(0, settings.currency)} (Tap to set)</span>
                ) : isOver ? (
                  <span style={{ color: 'var(--error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span> Over budget by {formatCurrency(spent - limit, settings.currency)}
                  </span>
                ) : isWarning ? (
                  <span style={{ color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span> Nearing limit
                  </span>
                ) : (
                  <span style={{ color: 'var(--on-surface-variant)' }}>{100 - percent}% remaining</span>
                )}

                <span style={{ fontWeight: 700, color: isOver ? 'var(--error)' : isWarning ? '#F59E0B' : 'var(--on-surface)' }}>
                  {limit === 0 ? '0%' : `${percent}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button: Create New Budget Category */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="active-press"
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '0.85rem',
          border: '2px dashed var(--outline-variant)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 15,
          fontWeight: 700,
          background: 'var(--surface-container-lowest)',
          cursor: 'pointer',
          marginTop: 4,
          transition: 'all 0.15s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
        Create New Budget Category
      </button>

      {/* Modal: Create New Category */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24, maxWidth: 360 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--on-surface)', marginBottom: 6 }}>
              Create Budget Category
            </h3>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 18 }}>
              Enter name and optional spending limit. A matching logo will be assigned automatically!
            </p>

            {/* Category Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>
                CATEGORY NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Dining Out, Gaming, Pets"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-high)',
                  color: 'var(--on-surface)',
                  fontSize: 15,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Auto Logo Live Preview Badge */}
            {newCatName.trim() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface-container)', borderRadius: '0.75rem', marginBottom: 14, border: '1px solid var(--outline-variant)' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: getCategoryIconStyle(newCatName).bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: getCategoryIconStyle(newCatName).color, fontVariationSettings: "'FILL' 1" }}>
                    {getCategoryMaterialIcon(newCatName)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  Assigned Logo: <strong style={{ color: 'var(--on-surface)' }}>{getCategoryMaterialIcon(newCatName)}</strong>
                </div>
              </div>
            )}

            {/* Category Limit Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>
                MONTHLY LIMIT ({settings.currency}) (Default is 0)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={newCatLimit}
                onChange={e => setNewCatLimit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-high)',
                  color: 'var(--on-surface)',
                  fontSize: 16,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  border: '1px solid var(--outline-variant)',
                  background: 'transparent',
                  color: 'var(--on-surface)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCatName.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: !newCatName.trim() ? 'var(--outline)' : 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 700,
                  cursor: !newCatName.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Specific Category Limit */}
      {isEditModalOpen && editingCategory && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24, maxWidth: 360 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--on-surface)', marginBottom: 8 }}>
              Set Limit for {editingCategory.name}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
              Enter monthly budget limit in {settings.currency} (Set to 0 for no limit).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>
                MONTHLY LIMIT ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={limitInput}
                onChange={e => setLimitInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-high)',
                  color: 'var(--on-surface)',
                  fontSize: 18,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  border: '1px solid var(--outline-variant)',
                  background: 'transparent',
                  color: 'var(--on-surface)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategoryLimit}
                style={{
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Total Monthly Budget */}
      {isTotalBudgetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTotalBudgetModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: 24, maxWidth: 360 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--on-surface)', marginBottom: 8 }}>
              Total Monthly Budget Limit
            </h3>
            <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
              Set overall spending limit across all categories in {settings.currency}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <input
                type="number"
                min="0"
                step="500"
                value={totalBudgetInput}
                onChange={e => setTotalBudgetInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--outline-variant)',
                  background: 'var(--surface-container-high)',
                  color: 'var(--on-surface)',
                  fontSize: 18,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsTotalBudgetModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  border: '1px solid var(--outline-variant)',
                  background: 'transparent',
                  color: 'var(--on-surface)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTotalBudget}
                style={{
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
