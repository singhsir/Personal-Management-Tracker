import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Plus,
  Bell,
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
import TransactionModal from "@/components/TransactionModal";

export default function Dashboard() {
  const { profile } = useAuthContext();
  const { transactions, hasDemoData, addTransaction } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const displayName = profile?.full_name || "Jaggan";
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
          <h1 className="text-2xl lg:text-[28px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, {displayName}{" "}
            <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">
            Here's your financial overview for {selectedMonth}.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMonthMenuOpen(!monthMenuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {monthMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-sm font-medium animate-fade-in">
                {["September 2026", "August 2026", "July 2026", "June 2026"].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setMonthMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between ${
                      m === selectedMonth
                        ? "text-teal-700 bg-teal-50 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{m}</span>
                    {m === "September 2026" && (
                      <span className="text-[10px] text-teal-600 uppercase font-extrabold bg-teal-100/60 px-1.5 py-0.5 rounded">
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

          {/* Notification Bell */}
          <button className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 relative transition-all">
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-2.5 ring-2 ring-white" />
          </button>

          {/* User Avatar Initial */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-800 font-bold text-sm shadow-sm select-none cursor-pointer">
            J
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      {hasDemoData && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Sample Demo Data Active:</strong> Displaying pre-loaded records. You can delete all demo data at once using the checkbox option in Transactions.
            </span>
          </div>
          <Link
            to="/transactions"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl whitespace-nowrap transition-colors"
          >
            Manage Demo Data →
          </Link>
        </div>
      )}

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
          <SpendingChart currency={currency} />
        </div>
        <div className="lg:col-span-5">
          <AIMoneyCoach />
        </div>
      </div>

      {/* Row 3: Spending DNA + Recent Activity + Budgets (3 equal columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryChart />
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
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900">FinWise AI Assistant</h4>
            </div>
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hello <b>Jaggan</b>! Based on your September 2026 data:
          </p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-900">
              💡 You have saved <b>₹56,401</b> this month. Keep it invested in liquid or index funds.
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900">
              🍔 Dining out took ₹10,250. Reducing weekend dine-outs could add ₹3,000 to net savings.
            </div>
          </div>
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
