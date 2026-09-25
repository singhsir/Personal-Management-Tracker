import { useState, useMemo } from "react";
import { Plus, Trash2, Loader2, PiggyBank } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { formatCurrency } from "@/lib/calculations";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import EmptyState from "@/components/EmptyState";

export default function Budgets() {
  const { profile } = useAuthContext();
  const { transactions } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = profile?.currency || "INR";
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { budgets, loading, addBudget, deleteBudget } = useBudgets(currentMonth);

  const spentByCategory = useMemo(() => {
    const monthStr = currentMonth.substring(0, 7);
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.transaction_type === "expense" && t.transaction_date.startsWith(monthStr))
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + Number(t.amount);
      });
    return map;
  }, [transactions, currentMonth]);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newCategory) {
      setError("Please select a category.");
      return;
    }
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    const result = await addBudget({
      category: newCategory,
      month: currentMonth,
      amount: amt,
    });

    setSaving(false);
    if (result) {
      setNewCategory("");
      setNewAmount("");
      setModalOpen(false);
    } else {
      setError("Failed to save budget. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !budgets.some((b) => b.category === cat),
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        {availableCategories.length > 0 && (
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Budget
          </button>
        )}
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-8 h-8 text-teal-600" />}
          title="No budgets set yet"
          description="Create monthly budgets for your spending categories to track how much you've spent and how much remains."
          actionLabel="Add Budget"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = spentByCategory[budget.category] || 0;
            const remaining = Number(budget.amount) - spent;
            const progress = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0;
            const isOverBudget = progress > 100;

            return (
              <div key={budget.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(Number(budget.amount), currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Spent</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(spent, currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
                    <p className={`text-sm font-semibold ${isOverBudget ? "text-red-600" : "text-teal-600"}`}>
                      {formatCurrency(Math.abs(remaining), currency)}
                      {isOverBudget && " over"}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget ? "bg-red-500" : progress > 80 ? "bg-amber-500" : "bg-teal-500"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="absolute right-0 -top-5 text-xs text-gray-500 font-medium">
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add Budget</h2>
            </div>
            <form onSubmit={handleAddBudget} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">— Select category —</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="10000"
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
