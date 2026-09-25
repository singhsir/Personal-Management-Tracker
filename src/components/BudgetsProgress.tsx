import { Link } from "react-router-dom";
import { Wallet, Utensils, Home, Car, Film, BookOpen, ShoppingBag, Heart, HelpCircle } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";

interface BudgetItem {
  name: string;
  spent: number;
  total: number;
  percentage: number;
  color: string;
  icon: typeof Utensils;
  iconColor: string;
  iconBg: string;
}

const CATEGORY_ICONS: Record<string, { icon: typeof Utensils; color: string; bg: string }> = {
  Food: { icon: Utensils, color: "text-amber-600", bg: "bg-amber-50" },
  Housing: { icon: Home, color: "text-rose-600", bg: "bg-rose-50" },
  Transportation: { icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
  Entertainment: { icon: Film, color: "text-purple-600", bg: "bg-purple-50" },
  Education: { icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
  Shopping: { icon: ShoppingBag, color: "text-sky-600", bg: "bg-sky-50" },
  Healthcare: { icon: Heart, color: "text-red-600", bg: "bg-red-50" },
};

const DEFAULT_BUDGETS: BudgetItem[] = [
  {
    name: "Food",
    spent: 10250,
    total: 15000,
    percentage: 68,
    color: "#0d9488",
    icon: Utensils,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    name: "Housing",
    spent: 7000,
    total: 10000,
    percentage: 70,
    color: "#0d9488",
    icon: Home,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    name: "Transportation",
    spent: 3420,
    total: 5000,
    percentage: 68,
    color: "#0d9488",
    icon: Car,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    name: "Entertainment",
    spent: 2150,
    total: 3000,
    percentage: 72,
    color: "#f87171",
    icon: Film,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
];

export default function BudgetsProgress() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const { budgets } = useBudgets(currentMonth);
  const { transactions } = useTransactions();

  const monthStr = currentMonth.substring(0, 7);
  const spentMap: Record<string, number> = {};
  transactions
    .filter((t) => t.transaction_type === "expense" && t.transaction_date.startsWith(monthStr))
    .forEach((t) => {
      const cat = t.category || "Other";
      spentMap[cat] = (spentMap[cat] || 0) + Number(t.amount);
    });

  const displayBudgets: BudgetItem[] =
    budgets.length > 0
      ? budgets.map((b) => {
          const spent = spentMap[b.category] || 0;
          const pct = Math.min(100, b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0);
          const iconConf = CATEGORY_ICONS[b.category] || { icon: HelpCircle, color: "text-slate-600", bg: "bg-slate-100" };
          return {
            name: b.category,
            spent,
            total: Number(b.amount),
            percentage: pct,
            color: pct > 90 ? "#f87171" : pct > 75 ? "#fbbf24" : "#0d9488",
            icon: iconConf.icon,
            iconColor: iconConf.color,
            iconBg: iconConf.bg,
          };
        })
      : DEFAULT_BUDGETS;
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Budgets</h2>
              <p className="text-xs text-slate-500 font-medium">Monthly budget progress</p>
            </div>
          </div>

          <Link
            to="/budgets"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Progress List */}
        <div className="space-y-4">
          {displayBudgets.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">
                      ₹{item.spent.toLocaleString("en-IN")} / ₹{item.total.toLocaleString("en-IN")}
                    </span>
                    <span className="font-bold text-slate-500 text-[11px]">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
