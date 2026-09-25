# Personal Management Tracker

A personal finance and expense tracking web application featuring AI categorization, dynamic analytics dashboards, category-based budgeting, and offline-first persistence.

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)

---

## Features

- **Financial Health Dashboard**: Real-time summary cards (Income, Expenses, Savings, Savings Rate), a circular health score gauge, and dynamic charts.
- **Money Pulse Trends**: Visual trend analysis of income, expenses, and savings over time with currency formatting.
- **Spending DNA**: Interactive donut breakdown of expenses by category with percentages and amounts.
- **Full Transaction Management**: Add, edit, filter, search, and delete expenses and income.
- **AI Categorization**: Automatic transaction categorization with confidence badges.
- **Demo Data Management**:
  - Sample records pre-loaded for instant testing.
  - **Dedicated checkbox option** to select all demo records and delete them at once.
  - Multi-select row checkboxes and floating bulk action bar.
  - One-click Load Demo Data / Clear Demo Data toggles.
- **Category Budgeting**: Set monthly spending limits per category and monitor real-time progress.
- **Offline & Local-First Resilience**: Seamless fallback to persistent browser storage (`localStorage`) so transactions and budgets save without Supabase RLS restrictions in local/guest mode.

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/singhsir/Personal-Management-Tracker.git

# Navigate to the project directory
cd Personal-Management-Tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Compile and build production bundle
- `npm run lint`: Run ESLint checks
- `npm run typecheck`: Run TypeScript compiler check without emitting files
- `npm run preview`: Preview the production build locally

---

## Architecture & Revised Prompt

For the complete architectural design and prompt specification, refer to [PROMPT.md](PROMPT.md) and [.bolt/prompt](.bolt/prompt).
