# Revised Project Specification & Prompt: Personal Management Tracker

## Objective
Build **Personal Management Tracker**, a production-grade personal finance, spending, and budget management web application featuring AI-assisted expense categorization, real-time financial health analytics, and local-first resilience.

---

## Architecture & Technology Stack
- **Framework & Runtime**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom color palette and responsive layouts
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (Money Pulse Bar Charts & Spending DNA Donut Charts)
- **Routing**: React Router DOM (v7)
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security)
- **Local Persistence**: Browser `localStorage` fallback layer for offline & unauthenticated sessions
- **Code Organization**: `@/` path alias mapped to `src/`

---

## Core Features & Capabilities

### 1. Dynamic Financial Dashboard
- **Live Summary Metrics**: Real-time Total Income, Total Expenses, Net Savings, and Savings Rate dynamically calculated from live transactions.
- **Financial Health Score**: Circular score gauge evaluating overall financial health based on savings rate.
- **Money Pulse**: Multi-month comparative bar chart tracking Income vs. Expenses vs. Savings with dynamic currency formatting.
- **Spending DNA**: Donut chart displaying category-wise expenditure breakdown with percentages and totals.
- **Monthly Budgets Widget**: Real-time spending progress against allocated category budgets.
- **Recent Activity**: Quick view of latest transactions with category icons, AI tags, and income/expense color coding.

### 2. Income & Expense Transaction Management
- Full CRUD operations for both Income and Expense transactions.
- Add Transaction modal with type, description, amount, date, and category selection.
- Automatic AI categorization with confidence score badges.
- Advanced filtering: free-text search, type filter (income/expense), category filter, month filter, and date ordering (newest/oldest).

### 3. Demo Data Management & Checkbox Bulk Deletion
- Pre-loaded sample transactions for instant demonstration of reports and analytics.
- **Checkbox Option to Delete All Demo Data at Once**:
  - Interactive banner with checkbox `[ ] Select all demo data ({count})`.
  - Checking the box highlights and selects every demo record simultaneously.
  - "Delete all demo data at once" button with confirmation modal.
- Row-level selection checkboxes and master select-all header checkbox for granular or bulk management.
- Floating bulk action bar displaying selection count and delete actions.
- Clear/Load toggles: users can wipe demo data to start with a clean ledger, or reload sample data anytime to test features.
- User-created transactions are safeguarded and never removed when demo data is cleared.

### 4. Category Budgeting
- Set monthly budget limits per expense category.
- Real-time comparison against actual spending with color-coded progress bars (safe, warning, alert thresholds).
- Clean creation and deletion workflows.

### 5. Offline & Local-First Resilience
- Seamless dual-mode architecture:
  - When authenticated: Syncs directly to Supabase Postgres tables.
  - When in local/guest mode: Transparent fallback to `localStorage` (`finwise_user_transactions`, `finwise_user_budgets`, `finwise_demo_data_cleared`).
  - Eliminates Row Level Security (RLS 42501) insert/update errors when running unauthenticated.

---

## Local Setup & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Build for production
npm run build
```
