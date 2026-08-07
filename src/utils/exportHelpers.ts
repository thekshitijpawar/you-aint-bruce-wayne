import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Expense, Category } from '../types';
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from './formatters';

export const exportToCSV = (
  expenses: Expense[],
  categoriesMap: Map<string, Category>,
  currencySymbol = '₹',
  filename = 'expenses-report.csv'
) => {
  const headers = ['ID', 'Date', 'Time', 'Category', 'City', 'Amount', 'Payment Method', 'Notes'];
  
  const rows = expenses.map(exp => {
    const category = categoriesMap.get(exp.categoryId);
    return [
      exp.id || '',
      exp.date,
      exp.time,
      category ? category.name : exp.categoryId,
      exp.city || '-',
      `${currencySymbol}${exp.amount}`,
      exp.paymentMethod,
      `"${(exp.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (
  expenses: Expense[],
  categoriesMap: Map<string, Category>,
  currencySymbol = '₹',
  filename = 'expenses-report.xlsx'
) => {
  const data = expenses.map(exp => {
    const category = categoriesMap.get(exp.categoryId);
    return {
      'Transaction ID': exp.id || '',
      'Date': exp.date,
      'Time': exp.time,
      'Category': category ? category.name : exp.categoryId,
      'City / Location': exp.city || '-',
      'Amount': exp.amount,
      'Currency': currencySymbol,
      'Payment Method': exp.paymentMethod,
      'Notes': exp.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 18 },
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
    { wch: 30 },
  ];

  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (
  expenses: Expense[],
  categoriesMap: Map<string, Category>,
  title = 'Expense Report',
  currencySymbol = '₹',
  filename = 'expenses-report.pdf'
) => {
  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()} | Total Expenses: ${expenses.length}`, 14, 26);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(14);
  doc.text(`Total: ${formatCurrency(totalSpent, currencySymbol as any)}`, 140, 20);

  const tableHeaders = [['Date', 'Time', 'Category', 'City', 'Payment Method', 'Amount', 'Notes']];
  const tableData = expenses.map(exp => {
    const category = categoriesMap.get(exp.categoryId);
    return [
      formatDateDisplay(exp.date),
      formatTimeDisplay(exp.time),
      category ? category.name : exp.categoryId,
      exp.city || '-',
      exp.paymentMethod,
      formatCurrency(exp.amount, currencySymbol as any),
      exp.notes || '-',
    ];
  });

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 38,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(filename);
};
