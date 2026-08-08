import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon, AVAILABLE_ICONS } from '../UI/CategoryIcon';
import type { Category } from '../../types';

const COLOR_PALETTE = [
  '#F97316', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6',
  '#6366F1', '#14B8A6', '#F43F5E', '#0EA5E9', '#64748B', '#059669',
  '#D97706', '#F472B6', '#94A3B8', '#84CC16', '#A855F7', '#06B6D4'
];

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, expenses } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10B981');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Tag');
    setColor('#10B981');
    setBudget('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setBudget(cat.budget ? cat.budget.toString() : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const budgetNum = budget ? parseFloat(budget) : undefined;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          icon,
          color,
          budget: budgetNum,
        });
      } else {
        await addCategory({
          name: name.trim(),
          icon,
          color,
          budget: budgetNum,
        });
      }
      setIsModalOpen(false);
    } catch {
      setError('Failed to save category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isUsed = expenses.some(e => e.categoryId === id);
    if (isUsed) {
      if (!window.confirm(`Category "${name}" is assigned to existing transactions. Are you sure you want to delete it?`)) {
        return;
      }
    }
    await deleteCategory(id);
  };

  return (
    <div style={{ padding: '16px 16px 100px 16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Customize & Manage
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
            Categories ({categories.length})
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="active-press"
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(53, 37, 205, 0.25)',
          }}
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.7 }}>🏷️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No categories yet</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>Create categories to organize your expenses better.</p>
          <button
            onClick={openAddModal}
            style={{
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(53, 37, 205, 0.25)',
            }}
          >
            + Create Category
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {categories.map(cat => {
            const transactionCount = expenses.filter(e => e.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                className="app-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  margin: 0,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: `${cat.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color,
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={22} />
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => openEditModal(cat)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: 4,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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

            {error && (
              <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', marginBottom: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* Category Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subscriptions, Pet Care..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Color Picker Swatches */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Select Accent Color
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COLOR_PALETTE.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: hex,
                        border: color === hex ? '3px solid white' : 'none',
                        boxShadow: color === hex ? '0 0 0 2px var(--primary)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {color === hex && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker Grid */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Select Icon
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
                  {AVAILABLE_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      style={{
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: icon === iconName ? `${color}20` : 'var(--bg-card-hover)',
                        border: icon === iconName ? `2px solid ${color}` : '1px solid var(--border-color)',
                        color: icon === iconName ? color : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <CategoryIcon name={iconName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="active-press"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
