import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  X,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import type { NewTransaction } from "@/lib/types";

import { Link } from "react-router-dom";
import { calculateSummary, formatCurrency } from "@/lib/calculations";
import FinancialHealthCard from "@/components/FinancialHealthCard";
import SummaryCard from "@/components/SummaryCard";
import SpendingChart from "@/components/SpendingChart";
import AIMoneyCoach from "@/components/AIMoneyCoach";
import CategoryChart from "@/components/CategoryChart";
import TransactionList from "@/components/TransactionList";
import BudgetsProgress from "@/components/BudgetsProgress";
import NotificationPopover from "@/components/NotificationPopover";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import ThemeToggle from "@/components/ThemeToggle";
import TransactionModal from "@/components/TransactionModal";

export default function Dashboard() {
  const { profile, user } = useAuthContext();
  const { transactions, addTransaction } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const displayName =
    profile?.full_name?.trim() ||
    (user?.user_metadata?.full_name as string)?.trim() ||
    user?.email?.split("@")[0] ||
    "User";
  const currency = profile?.currency || "INR";
  const summary = calculateSummary(transactions);

  const handleAddTransaction = async (tx: NewTransaction) => {
    return await addTransaction(tx);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-7 relative pb-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Good morning, {displayName}{" "}
            <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Here's your financial overview for {selectedMonth}.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMonthMenuOpen(!monthMenuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#082226] dark:hover:bg-[#0c2c31] dark:border-[#103e45] text-slate-700 dark:text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {monthMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#08262a] border border-slate-200 dark:border-[#103e45] rounded-xl shadow-lg z-30 py-1 text-sm font-medium animate-fade-in text-slate-800 dark:text-slate-200">
                {["September 2026", "August 2026", "July 2026", "June 2026"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setMonthMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between ${
                      m === selectedMonth
                        ? "text-teal-700 bg-teal-50 dark:bg-teal-900/40 dark:text-teal-300 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0c2f34]"
                    }`}
                  >
                    <span>{m}</span>
                    {m === "September 2026" && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-extrabold bg-teal-100/60 dark:bg-teal-950/80 px-1.5 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Transaction Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#095c52] hover:bg-[#074b43] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>

          {/* Theme Toggle (Dark / Light Mode) */}
          <ThemeToggle />

          {/* Interactive Notification Bell (Active Red Dot only when active) */}
          <NotificationPopover />

          {/* Dynamic User Avatar Button & Menu (Replaces hardcoded J) */}
          <UserAvatarMenu />
        </div>
      </header>

      {/* Row 1: Financial Health (7 cols) + 2x2 Stat Cards (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <FinancialHealthCard
            score={summary.totalIncome > 0 ? Math.min(100, Math.max(0, Math.round(50 + summary.savingsRate / 2))) : 0}
            pointsDelta={summary.totalIncome > 0 ? 8 : 0}
            savingsRate={summary.savingsRate}
          />
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard
            title="Total Income"
            value={formatCurrency(summary.totalIncome, currency)}
            icon={TrendingUp}
            trend="up"
            trendLabel={summary.totalIncome > 0 ? "+12.4%" : "0%"}
            accent="emerald"
            sparkColor="green"
          />
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses, currency)}
            icon={TrendingDown}
            trend="down"
            trendLabel={summary.totalExpenses > 0 ? "-4.2%" : "0%"}
            accent="rose"
            sparkColor="red"
          />
          <SummaryCard
            title="Net Savings"
            value={formatCurrency(summary.savings, currency)}
            icon={Wallet}
            trend="up"
            trendLabel={summary.savings > 0 ? "+28.6%" : "0%"}
            accent="blue"
            sparkColor="green"
          />
          <SummaryCard
            title="Savings Rate"
            value={`${summary.savingsRate.toFixed(1)}%`}
            icon={Percent}
            trend="up"
            trendLabel={summary.savingsRate > 0 ? "+6.8%" : "0%"}
            accent="amber"
            sparkColor="green"
          />
        </div>
      </div>

      {/* Row 2: Money Pulse (7 cols) + AI Money Coach (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SpendingChart transactions={transactions} currency={currency} />
        </div>
        <div className="lg:col-span-5">
          <AIMoneyCoach />
        </div>
      </div>

      {/* Row 3: Spending DNA + Recent Activity + Budgets (3 equal columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryChart transactions={transactions} />
        <TransactionList transactions={transactions} currency={currency} />
        <BudgetsProgress />
      </div>

      {/* Floating Action Button (FAB) for AI Assistant */}
      <button
        onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#00695c] hover:bg-[#004d40] text-teal-200 shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 border-2 border-teal-300/40"
        title="AI Assistant Insights"
      >
        <Sparkles className="w-6 h-6 text-white animate-pulse" />
      </button>

      {/* AI Assistant Quick Drawer */}
      {aiDrawerOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#0e3b42] p-5 z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#0e3b42] mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">FinWise AI Assistant</h4>
            </div>
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Hello <b>{displayName}</b>! Based on your {selectedMonth} activity:
          </p>
          {summary.totalExpenses > 0 ? (
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 text-teal-900 dark:text-teal-200">
                💡 You have saved <b>{formatCurrency(summary.savings, currency)}</b> this month. Keep up the balanced budget!
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-rose-900 dark:text-rose-200">
                📊 Total spending: <b>{formatCurrency(summary.totalExpenses, currency)}</b> across your active categories.
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-[#093238] border border-slate-100 dark:border-[#0e434c] text-slate-600 dark:text-slate-300 text-xs">
              No expenses recorded for this period yet. Click <b>Add Transaction</b> to start tracking your finances!
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTransaction}
      />
    </div>
  );
}
