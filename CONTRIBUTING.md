# Contributing to WorkTime Clock & Salary Tracker

Thank you for your interest in contributing to **WorkTime Clock & Salary Tracker**! We welcome community contributions to improve calculation precision, expand statutory tax rules, enhance multilingual translations, and refine mobile UX.

Please take a moment to review these guidelines before submitting an issue or pull request.

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect, professionalism, and empathy.

---

## Development Workflow

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22.x LTS recommended)
- **npm**: v9.0.0 or higher
- Modern browser (Chrome, Firefox, Safari, or Edge) with mobile responsive simulation tools

### 2. Fork and Clone
```bash
git clone https://github.com/maplearmor/WorkTime-Clock-Salary-Tracker.git
cd WorkTime-Clock-Salary-Tracker
git checkout -b feature/your-feature-name
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the Local Dev Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to test your changes.

---

## Quality & Verification Standards

Before submitting any Pull Request, you must verify that all baseline checks pass with zero warnings or errors:

### 1. Automated Tests
```bash
npm test
```
- All test suites in `tests/` must pass.
- If you modify or introduce new calculation logic (e.g. break deductions, overtime rules, tax brackets, or currency conversions), add corresponding unit tests in `tests/audit_and_calculations.test.js`.

### 2. Type Checking & Linting
```bash
npm run lint
```
- The codebase uses strict TypeScript (`tsc --noEmit`). No type assertions to `any` should be introduced without justification.

### 3. Production Build
```bash
npm run build
```
- Verify that Vite and `vite-plugin-pwa` build the client bundle and service worker without warnings.

---

## Coding Guidelines

1. **Multilingual Parity**:
   - Never hardcode user-facing strings into JSX or HTML.
   - All text must use translation keys from `src/services/i18n.ts`.
   - When adding a new key, you must provide localized strings across all 5 supported languages: `en`, `fr`, `es`, `zh`, and `de`.

2. **Mobile-First & Touch Targets**:
   - Ensure touch targets are at least 44x44px for comfortable operation on mobile devices.
   - Respect viewport safe areas (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
   - Test UI in both the iPhone 16 Pro and Google Pixel 9 simulator frames as well as full-width desktop view.

3. **Break Calculations**:
   - Unpaid breaks must be deducted from recorded shift hours.
   - Paid breaks count toward compensable working hours and must not reduce gross pay.
   - Midnight-crossing shifts must be computed using normalized 24-hour cycle math.

4. **Security & Data Privacy**:
   - Do not commit `.env` files, API keys, credentials, or private tokens.
   - Do not introduce client-side analytics trackers or external scripts.

---

## Submitting Pull Requests

1. Commit your changes with clear, descriptive commit messages following the Conventional Commits specification (e.g., `feat:`, `fix:`, `docs:`, `test:`).
2. Push your branch to your fork.
3. Open a Pull Request against the `main` branch.
4. Fill out the [Pull Request Template](.github/pull_request_template.md) completely, describing the problem solved and test steps followed.
5. Link any relevant GitHub issues.

---

## License Notice

Before submitting contributions, please note that the repository owner (`maplearmor`) will select and apply an official software license prior to public release. All contributions submitted will fall under the terms of the project's eventual license.
