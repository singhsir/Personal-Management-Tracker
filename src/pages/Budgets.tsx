import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  PiggyBank,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronDown,
  TrendingUp,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { formatCurrency } from "@/lib/calculations";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import type { Budget } from "@/lib/types";

const MONTH_OPTIONS = [
  { label: "September 2026", value: "2026-09-01" },
  { label: "August 2026", value: "2026-08-01" },
  { label: "July 2026", value: "2026-07-01" },
  { label: "June 2026", value: "2026-06-01" },
];

export default function Budgets() {
  const { profile } = useAuthContext();
  const { transactions } = useTransactions();
  const [selectedMonthVal, setSelectedMonthVal] = useState("2026-09-01");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCatInput, setCustomCatInput] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const currency = profile?.currency || "INR";
  const { budgets, loading, addBudget, updateBudget, deleteBudget } = useBudgets(selectedMonthVal);

  const selectedMonthObj = MONTH_OPTIONS.find((m) => m.value === selectedMonthVal) || {
    label: "September 2026",
    value: selectedMonthVal,
  };

  const spentByCategory = useMemo(() => {
    const monthStr = selectedMonthVal.substring(0, 7);
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.transaction_type === "expense" && t.transaction_date.startsWith(monthStr))
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions, selectedMonthVal]);

  const totalBudgeted = useMemo(() => {
    return budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets.reduce((sum, b) => sum + (spentByCategory[b.category] || 0), 0);
  }, [budgets, spentByCategory]);

  const remainingBudget = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setNewCategory("");
    setIsCustomCategory(false);
    setCustomCatInput("");
    setNewAmount("");
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setNewCategory(b.category);
    setIsCustomCategory(!EXPENSE_CATEGORIES.includes(b.category as any));
    setCustomCatInput(b.category);
    setNewAmount(String(b.amount));
    setError(null);
    setModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const categoryToSave = isCustomCategory ? customCatInput.trim() : newCategory.trim();
    if (!categoryToSave) {
      setError("Please select or enter a category.");
      return;
    }

    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid positive budget amount.");
      return;
    }

    setSaving(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, {
          category: categoryToSave,
          amount: amt,
        });
      } else {
        await addBudget({
          category: categoryToSave,
          month: selectedMonthVal,
          amount: amt,
        });
      }

      setModalOpen(false);
      setEditingBudget(null);
      setNewCategory("");
      setCustomCatInput("");
      setNewAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
    setDeleteConfirmId(null);
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !budgets.some((b) => b.category === cat && (!editingBudget || editingBudget.category !== cat)),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Budgets</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-xs">
            Plan, monitor, and control your monthly expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setMonthMenuOpen(!monthMenuOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-[#082226] dark:hover:bg-[#0c2c31] text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#103e45] shadow-xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{selectedMonthObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {monthMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#08262a] border border-slate-200 dark:border-[#103e45] rounded-xl shadow-lg z-30 py-1 text-xs font-medium animate-fade-in text-slate-800 dark:text-slate-200">
                {MONTH_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setSelectedMonthVal(m.value);
                      setMonthMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between ${
                      m.value === selectedMonthVal
                        ? "text-teal-700 bg-teal-50 dark:bg-teal-900/40 dark:text-teal-300 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0c2f34]"
                    }`}
                  >
                    <span>{m.label}</span>
                    {m.value === "2026-09-01" && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-extrabold bg-teal-100/60 dark:bg-teal-950/80 px-1 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-primary text-xs font-bold flex items-center gap-1.5 px-3.5 py-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Budgeted</span>
            <Wallet className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalBudgeted, currency)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Across {budgets.length} categories
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Spent</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSpent, currency)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {overallPercentage}% of total allocation
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Remaining Budget</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className={`text-lg font-bold ${totalSpent > totalBudgeted ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {totalSpent > totalBudgeted
              ? `-${formatCurrency(totalSpent - totalBudgeted, currency)}`
              : formatCurrency(remainingBudget, currency)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {totalSpent > totalBudgeted ? "Over budget limit" : "Available to spend"}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Budget Health</span>
            <PiggyBank className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {totalBudgeted === 0 ? "Not Set" : overallPercentage > 100 ? "Exceeded" : overallPercentage > 85 ? "Caution" : "Healthy"}
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#0c3137] mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overallPercentage > 100 ? "bg-rose-500" : overallPercentage > 80 ? "bg-amber-500" : "bg-teal-500"
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budgets List or Empty State */}
      {budgets.length === 0 ? (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 dark:border-teal-800">
            <PiggyBank className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No budgets set for {selectedMonthObj.label}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Create monthly budgets for food, housing, travel, and shopping to keep your spending controlled and receive proactive alerts.
          </p>
          <button
            onClick={handleOpenAdd}
            className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Budget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const spent = spentByCategory[b.category] || 0;
            const target = Number(b.amount);
            const remaining = target - spent;
            const pct = target > 0 ? (spent / target) * 100 : 0;
            const isOver = pct > 100;
            const isNear = pct >= 80 && !isOver;

            return (
              <div
                key={b.id}
                className="card p-5 hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-100 dark:border-teal-800">
                        {b.category.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {b.category}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {selectedMonthObj.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-[#0c2f34] rounded-lg transition-colors"
                        title="Edit Budget"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts breakdown */}
                  <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-50/70 dark:bg-[#061d21] rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Budget</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(target, currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Spent</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(spent, currency)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Remaining</span>
                      <p
                        className={`text-xs font-bold mt-0.5 ${
                          isOver ? "text-rose-600 dark:text-rose-400" : "text-teal-600 dark:text-teal-400"
                        }`}
                      >
                        {isOver ? `-${formatCurrency(Math.abs(remaining), currency)}` : formatCurrency(remaining, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {isOver ? (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Over Budget
                          </span>
                        ) : isNear ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            Nearing Limit
                          </span>
                        ) : (
                          <span className="text-teal-600 dark:text-teal-400">On Track</span>
                        )}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#0c3137] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? "bg-rose-500" : isNear ? "bg-amber-500" : "bg-teal-500"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 dark:border-[#0e3b42]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBudget ? "Edit Budget" : "Add Budget"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target month: {selectedMonthObj.label}
              </p>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                {!isCustomCategory ? (
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomCategory(true);
                        setCustomCatInput("");
                      } else {
                        setNewCategory(e.target.value);
                      }
                    }}
                    className="input-field text-sm cursor-pointer"
                    required
                  >
                    <option value="">— Select Category —</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Category...</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Subscriptions, Fitness, Pet Care"
                      value={customCatInput}
                      onChange={(e) => setCustomCatInput(e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                    >
                      ← Choose from predefined categories
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Monthly Limit Amount ({currency})
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 15000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="input-field text-sm font-semibold"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? "Saving..." : editingBudget ? "Update Budget" : "Save Budget"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-sm p-6 text-center animate-scale-up">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Delete this budget?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              This will remove the spending cap for this category. Your transactions will not be deleted.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
