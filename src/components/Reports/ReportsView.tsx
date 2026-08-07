import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileCode } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { exportToPDF, exportToCSV, exportToExcel } from '../../utils/exportHelpers';
import { formatCurrency } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { expenses, categoriesMap, settings } = useExpenses();

  const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'category' | 'all'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const reportExpenses = expenses.filter(e => {
    if (reportType === 'monthly') {
      return e.date.startsWith(selectedMonth);
    } else if (reportType === 'yearly') {
      return e.date.startsWith(selectedYear);
    }
    return true;
  });

  const totalSpent = reportExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExportPDF = () => {
    const title = `${reportType.toUpperCase()} EXPENSE REPORT (${reportExpenses.length} Items)`;
    exportToPDF(reportExpenses, categoriesMap, title, settings.currency, `expense-report-${reportType}.pdf`);
  };

  const handleExportCSV = () => {
    exportToCSV(reportExpenses, categoriesMap, settings.currency, `expense-report-${reportType}.csv`);
  };

  const handleExportExcel = () => {
    exportToExcel(reportExpenses, categoriesMap, settings.currency, `expense-report-${reportType}.xlsx`);
  };

  return (
    <div style={{ padding: '16px 16px 100px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Data Export & Summary
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface)', marginTop: 2 }}>
          Financial Reports
        </h1>
      </div>

      {/* Report Type Selector Pills */}
      <div style={{ background: 'var(--surface-container-lowest)', borderRadius: '0.75rem', padding: 16, border: '1px solid var(--outline-variant)' }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>
          Select Report Scope
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {[
            { id: 'monthly', label: 'Monthly Report' },
            { id: 'yearly', label: 'Yearly Report' },
            { id: 'all', label: 'All Expenses' },
          ].map(r => {
            const isActive = reportType === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setReportType(r.id as any)}
                className="active-press"
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  background: isActive ? 'var(--primary)' : 'var(--surface-container-high)',
                  color: isActive ? 'var(--on-primary)' : 'var(--on-surface)',
                  border: '1px solid var(--outline-variant)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Month or Year Input selector */}
        {reportType === 'monthly' && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)' }}>Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container-high)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 14,
                fontWeight: 600,
                marginTop: 6,
                outline: 'none',
              }}
            />
          </div>
        )}

        {reportType === 'yearly' && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)' }}>Select Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              placeholder="e.g. 2026"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '0.5rem',
                background: 'var(--surface-container-high)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)',
                fontSize: 14,
                fontWeight: 600,
                marginTop: 6,
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Summary Box */}
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.12)',
          borderRadius: '0.75rem',
          border: '1px solid var(--primary)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Report Summary
            </div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {reportExpenses.length} Total Transactions
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Total Amount</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
              {formatCurrency(totalSpent, settings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Export Action Buttons */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginTop: 8 }}>
        Download Report Formats
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* PDF Export */}
        <button
          onClick={handleExportPDF}
          className="active-press"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: '0.75rem',
            background: 'var(--surface-container-lowest)',
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '0.5rem',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
                Export as PDF Document
              </div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                Formatted PDF with title header & auto-table breakdown
              </div>
            </div>
          </div>
          <Download size={20} color="var(--primary)" />
        </button>

        {/* Excel Export */}
        <button
          onClick={handleExportExcel}
          className="active-press"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: '0.75rem',
            background: 'var(--surface-container-lowest)',
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '0.5rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
                Export as Excel (.xlsx)
              </div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                Native spreadsheet workbook ready for Microsoft Excel
              </div>
            </div>
          </div>
          <Download size={20} color="var(--primary)" />
        </button>

        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          className="active-press"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: '0.75rem',
            background: 'var(--surface-container-lowest)',
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '0.5rem',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCode size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
                Export as CSV File
              </div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                Universal raw comma-separated data table
              </div>
            </div>
          </div>
          <Download size={20} color="var(--primary)" />
        </button>
      </div>
    </div>
  );
};
