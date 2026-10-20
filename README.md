# WorkTime Clock & Salary Tracker

> **Executive work time tracking, multi-job management, real-time punch clock, statutory tax calculations, and personal expense tracking.**

WorkTime is a modern, responsive web application and Progressive Web App (PWA) tailored for professionals, contractors, and multi-job freelancers who need precision shift timing, statutory tax deductions, timesheet auditing, and monthly spending visibility in one unified dashboard.

---

## Key Features

### 1. Real-Time Punch Clock & Shift Timing
- **Tactile Punch Actions**: Punch In, Start Break, End Break, and Punch Out with live digital clock, elapsed second counter, and active shift state.
- **Forgotten Clock-Out Detection**: Automated time-guard notifications alert when shifts extend past scheduled hours without checkout stamps.
- **Audit Logging**: Every manual punch correction or time adjustment logs original timestamps, altered values, reason for change, and modifier identity.

### 2. Multi-Job & Multi-Currency Management
- **Seamless Job Profile Switching**: Instant switching between roles (e.g., *Acme Tech Solutions* in CAD, *Creative Studio NYC* in USD, *Shaanxi Tech* in CNY).
- **Independent Jurisdiction Settings**: Custom hourly rate, annual salary, pay frequency (weekly, biweekly, semi-monthly, monthly), standard daily/weekly hours, and overtime multipliers.
- **Non-Clipping Mobile Header Dropdown**: Intelligent viewport-aware positioning ensures the job selector is never cut off on iPhone screens of any size.

### 3. Statutory Tax & Salary Estimation Engine
- **Cross-Jurisdiction Tax Brackets**:
  - **Canada (Quebec & Ontario)**: CRA Federal Tax, Revenu Québec (TP-1015), QPP/CPP Retirement Pension, EI & QPIP parental insurance, and group benefits.
  - **United States (NY, CA, TX)**: IRS Federal Withholding, State Income Tax (including zero-tax states like TX), Social Security (FICA), Medicare, and 401(k) deductions.
  - **International**: UK PAYE and German standard statutory models.
- **Net Take-Home Projections**: Visual proportion waterfalls comparing Gross Earnings, Statutory Taxes, Voluntary Deductions, and Net Pay.
- **Printable Pay Stub Statements**: Generate official PDF/HTML payroll statements ready for download and printing.

### 4. Timesheets & Reporting
- **Period Navigation**: Browse active and historical biweekly cycles with cumulative billable hours, regular hours, and overtime hours.
- **Timesheet Filter Pills**: Instant filtering for All Shifts, Missing Punches, Overtime Days, and Approved Shifts.
- **Reports & Analytics Integration**: Direct access to executive payroll breakdowns and expense summaries from the Timesheet view.
- **CSV & JSON Exports**: Download detailed audit trails and timesheet ledgers formatted for payroll processing.

### 5. Expenses & Monthly Spending Pie Chart
- **Three Core Spending Categories**:
  - **Mandatory Bills**: Rent, internet, mobile phone, utilities, insurance, and essential recurring commitments.
  - **Groceries & Daily Expenses**: Supermarket groceries, food items, and everyday necessities.
  - **Miscellaneous Expenses**: Shopping, transportation, entertainment, and non-essential spend.
- **Interactive SVG Donut Chart**: Hover and tap slices to inspect category totals, percentages, and record counts. Includes clean empty-state fallback when no expenses are recorded.
- **Recurring Commitments Tracker**: Manage upcoming bills, due dates, reminder intervals, and mark-as-paid actions without duplicate counting.
- **Bank Feed & CSV Import**: Import bank statements or batch CSV transactions with automated categorization, duplication checks, and category overrides.

### 6. Interactive Calendar & Holiday Rules
- **Monthly Shift Matrix**: Calendar view displaying worked shifts, recorded hours, and statutory holidays.
- **Regional Public Holidays**: Automatically populates provincial and national public holidays with overtime multiplier rules (1.5x / 2.0x).
- **Custom Holiday Management**: Add custom company observances or local holiday dates.

---

## Mobile & iPhone Compatibility

- **Native Full-Bleed Mobile View**: Automatically detects mobile screens (including iPhone Safari) to provide a 100% full-screen experience respecting iOS safe areas (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
- **Desktop Simulator**: On desktop computers, an optional iPhone 16 Pro chassis simulator allows testing the mobile experience directly within a browser.
- **Progressive Web App (PWA)**:
  - Installable directly to the iOS Home Screen via Safari (`Share -> Add to Home Screen`).
  - Native standalone display mode with zero browser address bar interference.
  - Offline asset precaching and instant launch via service worker.

---

## Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: Google Material Symbols & Brand Vector Assets
- **PWA Tooling**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Storage**: Browser LocalStorage with automatic schema versioning

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or yarn / bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/worktime-clock-app.git
   cd worktime-clock-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing Commands

- **Run Automated Tests**:
  ```bash
  npm test
  ```
  Executes unit tests verifying salary calculations, overtime math, tax engine deductions, expense category sums, and recurring frequency normalizations.

- **Type-Check / Lint**:
  ```bash
  npm run lint
  ```

- **Build Production Bundle**:
  ```bash
  npm run build
  ```

---

## Testing on iPhone

1. Ensure the app is served over HTTPS (or open the shared/preview URL provided by your deployment).
2. Open **Safari** on your iPhone and navigate to the application URL.
3. Tap the **Share** button in the Safari bottom toolbar.
4. Scroll down and select **Add to Home Screen**.
5. Tap **Add** in the top right corner.
6. Launch **WorkTime** from your home screen to enjoy the standalone app experience.

---

## Data Privacy & Security

- **Local-First Architecture**: All employee time entries, job accounts, salaries, and expense records are stored securely in browser LocalStorage.
- **Zero Third-Party Telemetry**: No tracking beacons, analytics scripts, or unnecessary external network requests are executed.
- **No Secret Exposure**: No client-side credentials or personal tokens are bundled or committed.

---

## License

MIT License. Designed and engineered for professional work time management.
