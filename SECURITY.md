# Security Policy

## Supported Versions

Only the latest release version on the `main` branch of this repository is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| >= 2.0  | :white_check_mark: |
| < 2.0   | :x:                |

---

## Reporting a Vulnerability

The WorkTime Clock & Salary Tracker team takes data security and user privacy seriously. If you discover a security vulnerability, please do NOT create a public GitHub issue.

Instead, please report vulnerabilities privately:

1. **Email**: Send a detailed report to the repository owner at `maplearmor4@gmail.com`.
2. **Subject Line**: `[SECURITY VULNERABILITY] WorkTime Clock - <Brief summary>`
3. **Include in your report**:
   - Description of the vulnerability and its potential impact.
   - Exact steps or proof-of-concept (PoC) script to reproduce the issue.
   - Affected files, functions, or dependencies.
   - Any suggested mitigations or patches if available.

### Response Timeline
- **Initial Acknowledgement**: Within 48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Remediation & Patch Release**: Scheduled according to vulnerability severity.

---

## Security Architecture & Best Practices

1. **Local-First Data Storage**:
   - User timesheets, punch records, hourly wages, and expense entries are stored locally on the user's device via browser `localStorage`.
   - Data is never automatically uploaded to an external server or third-party database.

2. **Zero Hardcoded Secrets**:
   - No private API keys, tokens, or credentials are baked into client-side production bundles.
   - Any external AI proxy services are handled via server-side environment variables (`.env`) running behind Express routes.

3. **Safe Export Generation**:
   - CSV and PDF export generators sanitize text values and prepend UTF-8 Byte Order Marks (`\uFEFF`) to prevent CSV formula injection (DDE attacks) when files are opened in spreadsheet software like Microsoft Excel.

4. **Dependencies**:
   - Dependencies are monitored and updated regularly. Contributors should run `npm audit` before submitting dependency changes.
