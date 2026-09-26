import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { Transaction, NewTransaction, TransactionType } from "@/lib/types";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tx: NewTransaction) => Promise<Transaction | null>;
  editingTransaction?: Transaction | null;
}

export default function TransactionModal({ open, onClose, onSave, editingTransaction }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.transaction_type);
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setDate(editingTransaction.transaction_date);
      setCategory(editingTransaction.category || "");
    } else {
      setType("expense");
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
    }
    setError(null);
  }, [editingTransaction, open]);

  if (!open) return null;

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }

    setSaving(true);
    const newTx: NewTransaction = {
      transaction_date: date,
      description: description.trim(),
      amount: amt,
      transaction_type: type,
      category: type === "income" ? (category || "Salary") : (category || null),
    };

    const result = await onSave(newTx);
    setSaving(false);

    if (result) {
      onClose();
    } else {
      setError("Failed to save transaction. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#072428] rounded-2xl shadow-xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#0e3b42]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setType("expense"); setCategory(""); }}
                className={`rounded-xl py-2.5 text-sm font-medium border transition-all ${
                  type === "expense"
                    ? "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300"
                    : "bg-white dark:bg-[#082226] border-gray-300 dark:border-[#103e45] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0c2c31]"
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => { setType("income"); setCategory(""); }}
                className={`rounded-xl py-2.5 text-sm font-medium border transition-all ${
                  type === "income"
                    ? "bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                    : "bg-white dark:bg-[#082226] border-gray-300 dark:border-[#103e45] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0c2c31]"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner at Barbeque Nation"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Category {type === "expense" && <span className="text-gray-400 dark:text-gray-500 font-normal">(optional — AI will categorize)</span>}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field cursor-pointer"
            >
              <option value="">— Select category —</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : editingTransaction ? "Update" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
