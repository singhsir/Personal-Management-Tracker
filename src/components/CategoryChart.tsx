import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { PieChart as PieIcon } from "lucide-react";

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

const DEFAULT_SPENDING_DNA: CategoryItem[] = [
  { category: "Food", amount: 10250, percentage: 35.8, color: "#10b981" },
  { category: "Housing", amount: 7000, percentage: 24.5, color: "#f97316" },
  { category: "Transportation", amount: 3420, percentage: 11.9, color: "#8b5cf6" },
  { category: "Shopping", amount: 2500, percentage: 8.7, color: "#38bdf8" },
  { category: "Entertainment", amount: 2150, percentage: 7.5, color: "#f43f5e" },
  { category: "Others", amount: 3329, percentage: 11.6, color: "#94a3b8" },
];

export default function CategoryChart() {
  const totalExpenses = 28599;

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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Where your money goes this month</p>
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

        {/* Donut and Legend List */}
        <div className="flex items-center gap-4 my-2">
          {/* Donut with center text */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEFAULT_SPENDING_DNA}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="none"
                >
                  {DEFAULT_SPENDING_DNA.map((item) => (
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
          <div className="flex-1 space-y-1.5 text-xs">
            {DEFAULT_SPENDING_DNA.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">{item.percentage}%</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
