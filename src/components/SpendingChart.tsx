import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import type { Transaction } from "@/lib/types";

export interface MonthlyDataPoint {
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

interface SpendingChartProps {
  transactions?: Transaction[];
  data?: MonthlyDataPoint[];
  currency?: string;
}

export default function SpendingChart({
  transactions,
  data: propData,
  currency = "INR",
}: SpendingChartProps) {
  const currSymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;

  // Compute last 6 months from transactions if provided
  const chartData = useMemo(() => {
    if (propData && propData.length > 0) return propData;

    const now = new Date();
    const months: MonthlyDataPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${monthStr}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      let income = 0;
      let expenses = 0;

      if (transactions && transactions.length > 0) {
        for (const t of transactions) {
          if (t.transaction_date.startsWith(key)) {
            const amt = Number(t.amount) || 0;
            if (t.transaction_type === "income") {
              income += amt;
            } else if (t.transaction_type === "expense") {
              expenses += amt;
            }
          }
        }
      }

      months.push({
        label,
        income,
        expenses,
        savings: Math.max(0, income - expenses),
      });
    }

    return months;
  }, [transactions, propData]);

  const hasAnyData = chartData.some((m) => m.income > 0 || m.expenses > 0);

  const formatYAxis = (val: number) => {
    if (val === 0) return "0";
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expenses)),
    10000,
  );

  return (
    <div className="bg-white dark:bg-[#072428] rounded-3xl p-6 border border-slate-200/80 dark:border-[#0e3b42] shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-800">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Money Pulse</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Income, expenses and savings trend</p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#093238] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#104851]">
          <span>Last 6 months</span>
        </div>
      </div>

      {/* Chart Canvas or Zero Data State */}
      {!hasAnyData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-[#061d21] rounded-2xl border border-dashed border-slate-200 dark:border-[#0e3b42]">
          <TrendingUp className="w-8 h-8 text-teal-500/60 mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No transaction records yet
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Add your income and expenses to view your visual cash flow pulse and savings trend.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-[#0e3b42]" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                domain={[0, Math.ceil(maxVal * 1.15)]}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                formatter={(value) => [
                  `${currSymbol}${Number(value).toLocaleString()}`,
                  "",
                ]}
                contentStyle={{
                  backgroundColor: "#042d2f",
                  borderRadius: "12px",
                  border: "none",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                labelStyle={{ fontWeight: "bold", color: "#2dd4bf", marginBottom: "4px" }}
              />
              <Bar dataKey="income" name="Income" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="savings" name="Savings" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-[#0e3b42] text-xs font-semibold text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
          <span>Expenses</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]" />
          <span>Savings</span>
        </div>
      </div>
    </div>
  );
}
