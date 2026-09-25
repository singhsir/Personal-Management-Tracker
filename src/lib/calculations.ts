import type { Transaction, SummaryData, CategoryData, MonthlyData } from "./types";

export function calculateSummary(transactions: Transaction[]): SummaryData {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.transaction_type === "income") {
      totalIncome += Number(tx.amount);
    } else {
      totalExpenses += Number(tx.amount);
    }
  }

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return { totalIncome, totalExpenses, savings, savingsRate };
}

export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryData[] {
  const expenses = transactions.filter((t) => t.transaction_type === "expense");
  const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap: Record<string, number> = {};
  for (const tx of expenses) {
    const cat = tx.category || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(tx.amount);
  }

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTransactionsForMonth(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  return transactions.filter((t) => t.transaction_date.startsWith(monthStr));
}

export function getMonthlyData(
  transactions: Transaction[],
  monthsBack: number = 6,
): MonthlyData[] {
  const now = new Date();
  const result: MonthlyData[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const monthTx = transactions.filter((t) => t.transaction_date.startsWith(monthStr));
    const income = monthTx
      .filter((t) => t.transaction_type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthTx
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    result.push({ month: monthStr, label, income, expenses });
  }

  return result;
}

export function formatCurrency(amount: number, currencyCode: string = "INR"): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    AED: "د.إ",
    BHD: ".د.ب",
    EUR: "€",
    GBP: "£",
  };

  const symbol = symbols[currencyCode] || currencyCode;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formatted}`;
}

export function formatSignedAmount(
  amount: number,
  type: "income" | "expense",
  currencyCode: string = "INR",
): string {
  const formatted = formatCurrency(amount, currencyCode);
  return type === "expense" ? `-${formatted}` : `+${formatted}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMonthLabel(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}
