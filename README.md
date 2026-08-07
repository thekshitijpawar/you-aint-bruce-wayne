# 🦇 You Ain't Bruce Wayne — Mobile-First Expense Tracker

A modern, fast, and minimal mobile-first expense tracking application designed for everyone who wants full control over their personal finances. 

Unless you have Wayne Enterprises backing your bank account, staying on top of daily expenses is essential. **You Ain't Bruce Wayne** makes logging transactions effortless, taking less than 10 seconds per entry while providing clear, actionable insights into your spending habits over time.

---

## 🌟 What This App Is About

**You Ain't Bruce Wayne** is built around three core principles: **Speed, Clarity, and Total Privacy**.

- ⚡ **Lightning-Fast 10-Second Expense Entry**: Easily log any purchase on the go using an intuitive 3x4 numeric keypad, quick category pills, date selectors, photo receipt attachments, and optional notes.
- 📊 **Visual Spending Insights**: Instantly see where your money goes with interactive category breakdown charts, daily spending trend graphs, average daily expenses, and your highest/lowest spend days.
- 💰 **Smart Budget Management**: Set monthly spending limits per category, track remaining budget in real-time with visual progress gauges, and receive instant over-budget alerts before overspending.
- 🌐 **Total Currency & Location Freedom**: Personalize your tracker with any global currency symbol (`₹`, `$`, `€`, `£`, `AED`, `SAR`, `KSh`, `R$`, `zł`, `₺`, etc.) and set your home city.
- 🔒 **100% Private & Offline-First**: Your financial data stays entirely on your device. Works seamlessly offline without requiring any cloud account login or mandatory internet connection. Protect your data with an optional 4-digit security PIN lock and export your records anytime into PDF, Excel, CSV, or JSON backups.
- 📷 **Custom Profile & Avatars**: Personalize your profile with custom photo uploads, image URLs, or select from curated preset avatars.

---

## 🔒 Security & Environment Configuration

All environment variables and external endpoints are configured via `.env` files using standard public-safe `VITE_` prefixes:

- Copy `.env.example` to `.env` or `.env.local` for local development.
- `.env` files are ignored by git to prevent secret leaks.

> [!WARNING]
> **Git History Security Notice**: If any secret key, token, or password was previously hardcoded or committed to git history during early development, rotate those credentials immediately in your provider dashboard.
