import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { PieChart as PieIcon } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import type { Transaction } from "@/lib/types";

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#10b981",
  Housing: "#f97316",
  Transportation: "#8b5cf6",
  Shopping: "#38bdf8",
  Entertainment: "#f43f5e",
  Healthcare: "#ef4444",
  Education: "#14b8a6",
  Utilities: "#06b6d4",
  Salary: "#22c55e",
  Investment: "#a855f7",
  Other: "#94a3b8",
};

interface CategoryChartProps {
  transactions?: Transaction[];
}

export default function CategoryChart({ transactions: propTransactions }: CategoryChartProps) {
  const { transactions: hookTransactions } = useTransactions();
  const txList = propTransactions || hookTransactions;

  const { items, totalExpenses } = useMemo(() => {
    const expenseTxs = txList.filter((t) => t.transaction_type === "expense");
    const total = expenseTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    if (total === 0) {
      return { items: [], totalExpenses: 0 };
    }

    const catMap: Record<string, number> = {};
    expenseTxs.forEach((t) => {
      const cat = t.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + (Number(t.amount) || 0);
    });

    const list: CategoryItem[] = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Number(((amount / total) * 100).toFixed(1)),
        color: CATEGORY_COLORS[category] || "#64748b",
      }))
      .sort((a, b) => b.amount - a.amount);

    return { items: list, totalExpenses: total };
  }, [txList]);

  return (
    <div className="bg-white dark:bg-[#072428] rounded-3xl p-6 border border-slate-200/80 dark:border-[#0e3b42] shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Spending DNA</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Where your money goes</p>
            </div>
          </div>

          <Link
            to="/transactions"
            className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 group"
          >
            <span>View Details</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-[#061d21] rounded-2xl border border-dashed border-slate-200 dark:border-[#0e3b42] my-2">
            <PieIcon className="w-7 h-7 text-amber-500/50 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No expenses recorded yet
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Add expense transactions to see your personalized category breakdown.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 my-2">
            {/* Donut with center text */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {items.map((item) => (
                      <Cell key={item.category} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, ""]}
                    contentStyle={{
                      backgroundColor: "#042d2f",
                      borderRadius: "10px",
                      border: "none",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                  ₹{totalExpenses.toLocaleString("en-IN")}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Total Expenses</span>
              </div>
            </div>

            {/* Legend Items */}
            <div className="flex-1 space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
              {items.slice(0, 5).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#0e3b42] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Active Categories</span>
        <span className="font-bold text-slate-900 dark:text-white">{items.length}</span>
      </div>
    </div>
  );
}
