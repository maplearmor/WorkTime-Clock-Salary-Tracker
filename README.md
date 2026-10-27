# WorkTime Clock & Salary Tracker

> **Executive work time tracking, multi-job management, real-time punch clock, statutory tax calculations, personal expense tracking, and punch audit timesheets.**

WorkTime is a responsive web application and Progressive Web App (PWA) tailored for professionals, contractors, shift workers, and multi-job freelancers who need precision shift timing, flexible break management (paid vs. unpaid), statutory tax deductions, timesheet auditing, and personal budget management in one unified application.

**Target Repository**: [https://github.com/maplearmor/WorkTime-Clock-Salary-Tracker](https://github.com/maplearmor/WorkTime-Clock-Salary-Tracker)

---

## Key Features

### 1. Real-Time Punch Clock & Flexible Break Management
- **Tactile Punch Actions**: Punch In, Start Break, End Break, and Punch Out with live digital clock, elapsed second counter, and active shift state.
- **Flexible Break System**: Supports paid breaks (counted as compensable work time) and unpaid breaks (deducted from billable hours).
- **Statutory Break Presets**: Built-in compliance presets including Quebec Standards (CNESST 30m unpaid meal + two 15m paid breaks), Standard Workplace, and custom configurable policies.
- **Dynamic Break Tracking**: Live break duration timer with auto-deduct rules and manual override options.
- **Forgotten Clock-Out Detection**: Automated time-guard notifications alert when shifts extend past scheduled hours without checkout stamps.
- **Audit Logging**: Every manual punch correction, break addition, or time adjustment logs original timestamps, altered values, reason for change, and modifier identity.

### 2. Multi-Job & Multi-Currency Management
- **Seamless Job Profile Switching**: Instant switching between roles (e.g., *Acme Tech Solutions* in CAD, *Creative Studio NYC* in USD, *Shaanxi Tech* in CNY, *Berlin Engineering* in EUR).
- **Independent Jurisdiction Settings**: Custom hourly rate, annual salary, pay frequency (weekly, biweekly, semi-monthly, monthly), standard daily/weekly hours, and overtime multipliers.
- **Adaptive Header Dropdown**: Viewport-aware positioning ensures the job selector never clips on iPhone or Android mobile displays.

### 3. Statutory Tax & Salary Estimation Engine
- **Cross-Jurisdiction Tax Brackets**:
  - **Canada (Quebec & Ontario)**: CRA Federal Tax, Revenu Québec (TP-1015), QPP/CPP Retirement Pension, EI & QPIP parental insurance, and group benefits.
  - **United States (NY, CA, TX)**: IRS Federal Withholding, State Income Tax (including zero-income-tax states like TX), Social Security (FICA), Medicare, and 401(k) deductions.
  - **International**: UK PAYE and German standard statutory models.
- **Net Take-Home Projections**: Visual proportion waterfalls comparing Gross Earnings, Statutory Taxes, Voluntary Deductions, and Net Pay.
- **Printable Pay Stub Statements**: Generate official PDF/HTML payroll statements ready for download and printing.

### 4. Timesheets & Reporting
- **Period Navigation**: Browse active and historical biweekly cycles with cumulative billable hours, regular hours, and overtime hours.
- **Timesheet Filter Pills**: Instant filtering for All Shifts, Missing Punches, Overtime Days, and Approved Shifts.
- **Reports & Analytics Integration**: Direct access to executive payroll breakdowns and expense summaries from the Timesheet view.
- **CSV & JSON Exports**: Download detailed audit trails and timesheet ledgers formatted with UTF-8 BOM (`\uFEFF`) for seamless Microsoft Excel compatibility.

### 5. Expenses & Monthly Spending Donut Chart
- **Three Core Spending Categories**:
  - **Mandatory Bills**: Rent, internet, mobile phone, utilities, insurance, and essential recurring commitments.
  - **Groceries & Daily Expenses**: Supermarket groceries, food items, and everyday necessities.
  - **Miscellaneous Expenses**: Shopping, transportation, entertainment, and non-essential spend.
- **Interactive SVG Donut Chart**: Hover and tap slices to inspect category totals, percentages, and record counts. Includes clean empty-state fallback when no expenses are recorded.
- **Recurring Commitments Tracker**: Manage upcoming bills, due dates, reminder intervals, and mark-as-paid actions without duplicate counting.
- **Bank Feed & CSV Import**: Import bank statements or batch CSV transactions with automated categorization, duplication checks, and category overrides.

### 6. Interactive Calendar & Holiday Rules
- **Monthly Shift Matrix**: Calendar view displaying worked shifts, recorded hours, and statutory holidays with month navigation safeguards.
- **Regional Public Holidays**: Automatically populates provincial and national public holidays with overtime multiplier rules (1.5x / 2.0x).
- **Custom Holiday Management**: Add custom company observances or local holiday dates.

### 7. Multilingual Support (5 Languages)
WorkTime features a localized interface across 5 languages with 100% dictionary key parity:
- **English** (`en`)
- **Français** (`fr`)
- **Español** (`es`)
- **中文 (简体)** (`zh`)
- **Deutsch** (`de`)

Language preferences persist across sessions, dynamically updating dates, times, currencies, charts, modals, and export documents.

---

## Mobile & Device Compatibility

WorkTime operates as a single, shared responsive web application and Progressive Web App (PWA) across all form factors.

### iPhone (iOS Safari)
- Supports iOS safe areas (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
- Apple Touch Icon (`/apple-touch-icon.png`) and standalone web app configuration.
- To install on iPhone:
  1. Open Safari and navigate to the application URL.
  2. Tap the **Share** button (box with upward arrow).
  3. Scroll down and tap **Add to Home Screen**.
  4. Tap **Add** in the upper right. Launch WorkTime directly from the iOS Home Screen.

### Android (Google Chrome & Modern Mobile Browsers)
- Adaptive layout with Material 3 styling and navigation.
- Web App Manifest (`/manifest.webmanifest`) with Android theme color (`#006c4a`), maskable icons (`pwa-maskable-512x512.png`), and quick app shortcuts:
  - **Punch Clock**: Jump straight to clock-in/out.
  - **View Timesheets**: Inspect shift records.
  - **Add Expense**: Rapidly log a purchase or receipt.
- To install on Android:
  1. Open Google Chrome on your Android device and visit the app URL.
  2. Tap the **Install** prompt banner at the bottom, or tap the three dots menu (**⋮**) in the top right.
  3. Select **Add to Home screen** or **Install app**.
  4. Confirm **Install**. The app will appear in your Android app drawer with full standalone display mode.

### Desktop Device Simulator
On desktop displays, a top-right floating toolbar allows toggling between:
- **iPhone 16 Pro**: Simulates iOS status bar, Dynamic Island state indicator, and iOS home bar.
- **Google Pixel 9**: Simulates Android Material 3 status bar, camera punch hole, and gesture navigation.
- **Desktop**: Full-width executive dashboard layout.

---

## Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/) + [tsx](https://github.com/privatenumber/tsx)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PWA Tooling**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Icons**: Google Material Symbols
- **Testing**: Node.js Test Runner (`node:test`, `node:assert`)
- **Storage**: Browser LocalStorage with automatic schema versioning

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher; Node 22 recommended)
- npm (version 9 or higher)

### Installation

1. Clone or download the repository:
   ```bash
   git clone https://github.com/maplearmor/WorkTime-Clock-Salary-Tracker.git
   cd WorkTime-Clock-Salary-Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for AI assistant proxy):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Assurance

Run the automated test suite, type-checking, and production build checks:

```bash
# 1. Run unit and integration tests (46 automated test cases)
npm test

# 2. Run TypeScript type-checking and lint validation
npm run lint

# 3. Compile production build and PWA service worker
npm run build
```

---

## Security & Privacy

- **Local-First Architecture**: All employee time records, hourly wages, tax breakdowns, and expenses reside strictly within browser LocalStorage (`worktime_clock_app_v2`).
- **Zero Client Credential Leaks**: No secret API keys or private tokens are embedded in frontend source files.
- **Server Proxy Route**: Any optional AI-assisted features route exclusively through the backend proxy (`/api/ai/*`) without exposing server keys.

---

## License Notice

A formal open source or commercial software license has not yet been applied to this repository. The project owner (`maplearmor`) will select and apply an appropriate license (e.g., MIT, Apache-2.0, or All Rights Reserved) prior to public contribution or distribution.
