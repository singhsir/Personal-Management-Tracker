export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category: string | null;
  subcategory: string | null;
  ai_confidence: number | null;
  ai_categorized: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewTransaction {
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: TransactionType;
  category?: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  currency: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  month: string;
  amount: number;
  created_at: string;
}

export interface NewBudget {
  category: string;
  month: string;
  amount: number;
}

export interface CategorizeResponse {
  category: string;
  subcategory: string | null;
  ai_confidence: number;
  ai_categorized: boolean;
}

export interface InsightResponse {
  headline: string;
  summary: string;
  observations: string[];
  areas_to_review: string[];
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  label: string;
  income: number;
  expenses: number;
}

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Travel",
  "Subscriptions",
  "Personal Care",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Gift",
  "Other Income",
] as const;

export const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "BHD", symbol: ".د.ب", label: "Bahraini Dinar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
] as const;
