import { Link } from "react-router-dom";
import { Clock, Utensils, Car, Briefcase, PlayCircle } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface TransactionListProps {
  transactions?: Transaction[];
  currency?: string;
  showViewAll?: boolean;
}

const DEFAULT_RECENT = [
  {
    id: "tx-1",
    title: "Dinner at Barbeque Nation",
    sub: "Food · Dining",
    date: "Sep 24",
    amount: "-₹1,850",
    isIncome: false,
    badge: "✦ AI Categorized",
    badgeType: "ai",
    icon: Utensils,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  {
    id: "tx-2",
    title: "Uber Ride",
    sub: "Transportation · Ride Sharing",
    date: "Sep 23",
    amount: "-₹420",
    isIncome: false,
    badge: "✦ AI Categorized",
    badgeType: "ai",
    icon: Car,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "tx-3",
    title: "Monthly Salary",
    sub: "Income · Salary",
    date: "Sep 1",
    amount: "+₹85,000",
    isIncome: true,
    badge: "✦ Income",
    badgeType: "income",
    icon: Briefcase,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    id: "tx-4",
    title: "Netflix Subscription",
    sub: "Entertainment · Streaming",
    date: "Sep 20",
    amount: "-₹649",
    isIncome: false,
    badge: "✦ AI Categorized",
    badgeType: "ai",
    icon: PlayCircle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
];

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
          amount: `${isIncome ? "+" : "-"}${symbol}${Math.abs(tx.amount).toLocaleString()}`,
          isIncome,
          badge: tx.ai_categorized ? "✦ AI Categorized" : (isIncome ? "✦ Income" : "✦ Expense"),
          badgeType: isIncome ? "income" : (tx.ai_categorized ? "ai" : "expense"),
          icon: isIncome ? Briefcase : (tx.category === "Transportation" ? Car : (tx.category === "Entertainment" ? PlayCircle : Utensils)),
          iconBg: isIncome ? "bg-teal-50" : "bg-rose-50",
          iconColor: isIncome ? "text-teal-600" : "text-rose-500",
        };
      })
    : DEFAULT_RECENT;
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Recent Activity</h2>
              <p className="text-xs text-slate-500 font-medium">Your latest transactions</p>
            </div>
          </div>

          {showViewAll && (
            <Link
              to="/transactions"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-3.5">
          {displayList.map((tx) => {
            const Icon = tx.icon;
            return (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${tx.iconBg} ${tx.iconColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{tx.title}</h4>
                    <p className="text-[11px] text-slate-500">{tx.sub}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${tx.isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.amount}
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className="text-[10px] text-slate-400">{tx.date}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        tx.badgeType === "income"
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                          : "text-teal-700 bg-teal-50 border-teal-200/60"
                      }`}
                    >
                      {tx.badge}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
