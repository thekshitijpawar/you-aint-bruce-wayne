import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import type { Expense } from '../../types';
import { DashboardView } from '../Dashboard/DashboardView';
import { TimelineView } from '../Timeline/TimelineView';
import { CalendarView } from '../Calendar/CalendarView';
import { AnalyticsView } from '../Analytics/AnalyticsView';
import { BudgetView } from '../Budget/BudgetView';
import { ReportsView } from '../Reports/ReportsView';
import { CategoriesView } from '../Categories/CategoriesView';
import { SettingsView } from '../Settings/SettingsView';
import { ExpenseFormModal } from '../ExpenseForm/ExpenseFormModal';
import { SearchFilterModal } from '../SearchFilter/SearchFilterModal';

export const NavigationShell: React.FC = () => {
  const { settings, lastDeleted, undoDelete } = useExpenses();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const openAddExpenseModal = () => {
    setExpenseToEdit(null);
    setIsAddModalOpen(true);
  };

  const openEditExpenseModal = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenAddModal={openAddExpenseModal}
            onEditExpense={openEditExpenseModal}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        );
      case 'timeline':
        return (
          <TimelineView
            onEditExpense={openEditExpenseModal}
            onOpenAddModal={openAddExpenseModal}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
          />
        );
      case 'calendar':
        return <CalendarView onEditExpense={openEditExpenseModal} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'budget':
        return <BudgetView />;
      case 'reports':
        return <ReportsView />;
      case 'categories':
        return <CategoriesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onOpenAddModal={openAddExpenseModal}
            onEditExpense={openEditExpenseModal}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Stitch Glassmorphic Header with Exact Logo Image */}
      <header className="glass-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLpyknJVAtY4UFKawD4WuPFJm6smo0i1eWsb-htmj4EBxKsbnICT3w1Pn2XqMSIc7sVGrdtxL4uMkaNSfsiEpdzlWsfM9Cds2-S9ucCW83g8n21OIpOFI-Qxw4bPLGjevKS6W-yYqhPT8pTfoiEskm6cK43_QJlE9QAjENRKovlgfcf7OAiYhCiNSiBfoWNVpa2Azl4lQzQzYaVXVAAXQLf01_bWPFP_PEKlH4xs1bTioEe_WYGA"
            alt="You Ain't Bruce Wayne Logo"
            style={{ height: 32, width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>
            You Ain't Bruce Wayne
          </span>
        </div>

        <img
          src={settings.profilePhoto || "https://lh3.googleusercontent.com/aida-public/AB6AXuBFz6ZwYxKqDE_VcKK4pktAGb8GoX2lRz2rDkDvpzhHi3dZhL6d-N-fmFEa_fzBd4VfJ5USYJ3vEFeil_psZP0LY9MghFVGlqPXP_X9GGiOEVRLKap7BsN6-9tyM76Zi87mTXupIFFKGPtCQZCsHyQ8Xld43X_cpm_FGCO1I8xGztFq9FnUT24NSypW-mPUyW8P8Qw0tpY_sVaervsIqADLbXzKXrzNfXpnbJVH6dg4UGObeYVMUg"}
          alt="Profile Avatar"
          onClick={() => setActiveTab('settings')}
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--outline-variant)' }}
        />
      </header>

      {/* Main Content Area */}
      <main style={{ paddingTop: 64, flex: 1 }}>
        {renderTabContent()}
      </main>

      {/* Stitch Bottom Fixed Navigation Bar */}
      <nav className="bottom-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span>History</span>
        </button>

        {/* Center Circular Primary Add Button */}
        <div style={{ position: 'relative', top: -20 }}>
          <button
            onClick={openAddExpenseModal}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(53,37,205,0.35)',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add</span>
          </button>
        </div>

        <button
          onClick={() => setActiveTab('budget')}
          className={`nav-item ${activeTab === 'budget' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span>Budgets</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">person</span>
          <span>Profile</span>
        </button>
      </nav>

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />

      {/* Search & Filter Modal */}
      <SearchFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      {/* Undo Delete Toast */}
      {lastDeleted && (
        <div className="toast-undo">
          <span style={{ fontSize: 13 }}>Expense deleted</span>
          <button
            onClick={undoDelete}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--secondary-container)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Undo
          </button>
        </div>
      )}

    </div>
  );
};
