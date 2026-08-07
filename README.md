# 🦇 You Ain't Bruce Wayne — Mobile-First Expense Tracker

A modern, ultra-fast, minimal mobile-first expense tracking application. Built for single users who want to manually record expenses in under 10 seconds and gain clear, actionable insights into daily, weekly, monthly, and yearly spending habits over time.

---

## ✨ Features

- ⚡ **10-Second Expense Entry**: Custom 3x4 numeric keypad, category chips, date picker, photo receipt attachments, and optional notes.
- 🎨 **Google Stitch Material Design 3 UI**: Full "You Ain't Bruce Wayne" aesthetic with dynamic dark/light themes, glassmorphic headers, and micro-animations.
- 📊 **Spending Insights & Analytics**: Real-time spending graphs, category breakdown donut charts, daily trend bar charts, and key stats (average daily spend, highest/lowest spend days).
- 💰 **Budget Limits & Alerts**: Monthly budget gauge, category spending limits, and real-time over-budget warnings.
- 🌐 **Currency & Location Freedom**: Choose any currency symbol or code (`₹`, `$`, `€`, `£`, `AED`, `SAR`, `KSh`, `R$`, `zł`, `₺`, etc.) and default home city tracking.
- 🔒 **Offline-First & Security**: Powered by Dexie IndexedDB for 100% offline data persistence, 4-digit security PIN lock, and multi-format exports (PDF, Excel, CSV, JSON backup & restore).
- 📷 **Custom Profile & Avatars**: Upload custom avatar photos from device, paste image URLs, or select from curated preset avatars.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS + Google Material Symbols Outlined
- **Database**: Dexie IndexedDB (Offline-first local storage)
- **Data Visualization**: Recharts (Pie & Bar charts)
- **Exports**: jsPDF, AutoTable, XLSX, CSV

---

## 🚀 Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/thekshitijpawar/you-aint-bruce-wayne.git
   cd you-aint-bruce-wayne
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your web browser.

---

## ☁️ Deployment on Railway

1. **Log in to Railway**: Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. **New Project**: Click **+ New Project** -> **Deploy from GitHub repo** -> Select `thekshitijpawar/you-aint-bruce-wayne`.
3. **Build & Start Commands**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. **Generate Public Domain**: Go to Project Settings -> **Networking** -> Click **Generate Domain**.

---

## 📱 Publishing to Google Play Store

Refer to the built-in guide or use **Capacitor**:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Bruce Wayne Expense Tracker" "com.brucewayne.moneytracker" --web-dir dist
npm run build
npx cap add android
npx cap open android
```
Build the signed `.aab` in Android Studio and upload to your Google Play Console account!
