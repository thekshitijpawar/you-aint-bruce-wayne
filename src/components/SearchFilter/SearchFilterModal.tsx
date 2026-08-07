import React from 'react';
import { X, Search, RotateCcw, Filter, MapPin } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import type { PaymentMethod } from '../../types';
import { CategoryIcon } from '../UI/CategoryIcon';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'];

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({ isOpen, onClose }) => {
  const { filter, setFilter, resetFilter, categories } = useExpenses();

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    const current = filter.categoryIds;
    if (current.includes(id)) {
      setFilter({ categoryIds: current.filter(c => c !== id) });
    } else {
      setFilter({ categoryIds: [...current, id] });
    }
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const current = filter.paymentMethods;
    if (current.includes(method)) {
      setFilter({ paymentMethods: current.filter(m => m !== method) });
    } else {
      setFilter({ paymentMethods: [...current, method] });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={20} color="var(--primary)" />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Search & Filter</h2>
          </div>
          <button
            onClick={onClose}
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

        {/* Live Search Bar */}
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Search notes, category, city, amount..."
            value={filter.searchQuery}
            onChange={e => setFilter({ searchQuery: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        {/* City Filter */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <MapPin size={14} color="var(--accent)" /> Filter by City
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai, Dubai, London..."
            value={filter.city || ''}
            onChange={e => setFilter({ city: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Date Range Filter */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Date Range
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Start Date</span>
              <input
                type="date"
                value={filter.startDate}
                onChange={e => setFilter({ startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  marginTop: 4,
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>End Date</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={e => setFilter({ endDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  marginTop: 4,
                }}
              />
            </div>
          </div>
        </div>

        {/* Amount Range Filter */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Amount Boundaries
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              type="number"
              placeholder="Min Amount"
              value={filter.minAmount}
              onChange={e => setFilter({ minAmount: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: 12,
              }}
            />
            <input
              type="number"
              placeholder="Max Amount"
              value={filter.maxAmount}
              onChange={e => setFilter({ maxAmount: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: 12,
              }}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Filter by Categories
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
            {categories.map(cat => {
              const isSelected = filter.categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? `${cat.color}25` : 'var(--bg-card-hover)',
                    border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
                    color: isSelected ? cat.color : 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <CategoryIcon name={cat.icon} size={14} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Filter Pills */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Filter by Payment Method
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PAYMENT_METHODS.map(method => {
              const isSelected = filter.paymentMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => togglePaymentMethod(method)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? 'var(--accent)' : 'var(--bg-card-hover)',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    border: isSelected ? 'none' : '1px solid var(--border-color)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
          <button
            type="button"
            onClick={resetFilter}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <RotateCcw size={16} /> Reset
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
