import { Link } from "react-router-dom";
import { Clock, Utensils, Car, Briefcase, PlayCircle, Receipt, Plus } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface TransactionListProps {
  transactions?: Transaction[];
  currency?: string;
  showViewAll?: boolean;
}

export default function TransactionList({
  transactions,
  currency = "INR",
  showViewAll = true,
}: TransactionListProps) {
  const displayList = transactions && transactions.length > 0
    ? transactions.slice(0, 5).map((tx) => {
        const isIncome = tx.transaction_type === "income";
        const symbol = currency === "INR" ? "₹" : "$";
        return {
          id: tx.id,
          title: tx.description,
          sub: `${tx.category || "General"}${tx.subcategory ? ` · ${tx.subcategory}` : ""}`,
          date: tx.transaction_date,
          amount: `${isIncome ? "+" : "-"}${symbol}${Math.abs(Number(tx.amount)).toLocaleString()}`,
          isIncome,
          badge: tx.ai_categorized ? "✦ AI Categorized" : (isIncome ? "✦ Income" : "✦ Expense"),
          badgeType: isIncome ? "income" : (tx.ai_categorized ? "ai" : "expense"),
          icon: isIncome ? Briefcase : (tx.category === "Transportation" ? Car : (tx.category === "Entertainment" ? PlayCircle : Utensils)),
          iconBg: isIncome ? "bg-teal-50" : "bg-rose-50",
          iconColor: isIncome ? "text-teal-600" : "text-rose-500",
        };
      })
    : [];

  return (
    <div className="bg-white dark:bg-[#072428] rounded-3xl p-6 border border-slate-200/80 dark:border-[#0e3b42] shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Recent Activity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Latest transactions</p>
            </div>
          </div>

          {showViewAll && (
            <Link
              to="/transactions"
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )}
        </div>

        {/* Transactions List or Empty State */}
        {displayList.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 dark:bg-[#061d21] rounded-2xl border border-dashed border-slate-200 dark:border-[#0e3b42] my-2">
            <Receipt className="w-7 h-7 text-blue-500/50 mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No recent activity
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mb-3">
              Your recent entries will appear here once you start adding transactions.
            </p>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((tx) => {
              const Icon = tx.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#093238] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl ${tx.iconBg} dark:bg-teal-950/60 ${tx.iconColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[130px] sm:max-w-[180px]">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {tx.sub}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        tx.isIncome ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {tx.amount}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{tx.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#0e3b42] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Recorded</span>
        <span className="font-bold text-slate-900 dark:text-white">{displayList.length} items</span>
      </div>
    </div>
  );
}
