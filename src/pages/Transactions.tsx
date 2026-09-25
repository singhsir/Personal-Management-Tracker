import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, Sparkles, Loader2, Filter, ArrowUpCircle, ArrowDownCircle, Database } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { categorizeTransaction } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import type { Transaction, NewTransaction } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import TransactionModal from "@/components/TransactionModal";
import EmptyState from "@/components/EmptyState";

export default function Transactions() {
  const { profile, user } = useAuthContext();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, updateTransactionCategory, fetchTransactions } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [categorizingId, setCategorizingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const currency = profile?.currency || "INR";

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => { if (t.category) cats.add(t.category); });
    return Array.from(cats).sort();
  }, [transactions]);

  const allMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      months.add(t.transaction_date.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.subcategory || "").toLowerCase().includes(q),
      );
    }

    if (typeFilter) result = result.filter((t) => t.transaction_type === typeFilter);
    if (categoryFilter) result = result.filter((t) => t.category === categoryFilter);
    if (monthFilter) result = result.filter((t) => t.transaction_date.startsWith(monthFilter));

    result.sort((a, b) => {
      const cmp = a.transaction_date.localeCompare(b.transaction_date);
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, monthFilter, sortOrder]);

  const handleSave = async (tx: NewTransaction) => {
    if (editingTx) {
      await updateTransaction(editingTx.id, tx);
      return editingTx;
    }
    const newTx = await addTransaction(tx);
    if (newTx && newTx.transaction_type === "expense" && !newTx.category) {
      setCategorizingId(newTx.id);
      try {
        const result = await categorizeTransaction(newTx.id, newTx.description);
        updateTransactionCategory(newTx.id, result.category, result.subcategory, result.ai_confidence);
      } catch (err) {
        console.error("Auto-categorization failed:", err);
      } finally {
        setCategorizingId(null);
      }
    }
    return newTx;
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleCategorize = async (tx: Transaction) => {
    setCategorizingId(tx.id);
    try {
      const result = await categorizeTransaction(tx.id, tx.description);
      updateTransactionCategory(tx.id, result.category, result.subcategory, result.ai_confidence);
    } catch (err) {
      console.error("Categorization failed:", err);
    } finally {
      setCategorizingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteTransaction(deleteId);
    setDeleteId(null);
  };

  const handleLoadDemo = async () => {
    if (!user) return;
    setLoadingDemo(true);
    const today = new Date().toISOString().split("T")[0];
    const demoData: NewTransaction[] = [
      { transaction_date: today, description: "Salary", amount: 85000, transaction_type: "income", category: "Salary" },
      { transaction_date: today, description: "Rent", amount: 18000, transaction_type: "expense", category: "Housing" },
      { transaction_date: today, description: "Dinner at Barbeque Nation", amount: 1850, transaction_type: "expense" },
      { transaction_date: today, description: "Uber ride", amount: 450, transaction_type: "expense" },
      { transaction_date: today, description: "Netflix", amount: 649, transaction_type: "expense", category: "Subscriptions" },
      { transaction_date: today, description: "Groceries", amount: 4200, transaction_type: "expense", category: "Food" },
      { transaction_date: today, description: "Electricity bill", amount: 1800, transaction_type: "expense", category: "Utilities" },
      { transaction_date: today, description: "Movie tickets", amount: 900, transaction_type: "expense", category: "Entertainment" },
    ];

    const { error } = await supabase.from("transactions").insert(
      demoData.map((d) => ({ ...d, user_id: user.id })),
    );

    if (error) {
      console.error("Demo data insert failed:", error);
    } else {
      await fetchTransactions();
    }
    setLoadingDemo(false);
  };

  const hasFilters = search || typeFilter || categoryFilter || monthFilter;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        </div>
        <EmptyState
          title="No transactions yet"
          description="Add your first transaction to start tracking your spending. FinWise AI will automatically categorize it for you."
          actionLabel="Add Transaction"
          onAction={() => { setEditingTx(null); setModalOpen(true); }}
        />
        <div className="text-center mt-4">
          <button onClick={handleLoadDemo} disabled={loadingDemo} className="text-sm text-gray-400 hover:text-gray-600 inline-flex items-center gap-1.5">
            {loadingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Load Demo Data
          </button>
        </div>
        <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editingTransaction={editingTx} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleLoadDemo} disabled={loadingDemo} className="text-sm text-gray-400 hover:text-gray-600 inline-flex items-center gap-1.5 px-3 py-2">
            {loadingDemo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Demo Data
          </button>
          <button onClick={() => { setEditingTx(null); setModalOpen(true); }} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field py-2 text-sm cursor-pointer">
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field py-2 text-sm cursor-pointer">
            <option value="">All categories</option>
            {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="input-field py-2 text-sm cursor-pointer">
              <option value="">All months</option>
              {allMonths.map((m) => {
                const [y, mo] = m.split("-");
                const date = new Date(Number(y), Number(mo) - 1, 1);
                return <option key={m} value={m}>{date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</option>;
              })}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">{filteredTransactions.length} result{filteredTransactions.length !== 1 ? "s" : ""}</span>
            <button
              onClick={() => { setSearch(""); setTypeFilter(""); setCategoryFilter(""); setMonthFilter(""); }}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table - Desktop */}
      <div className="card overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left font-medium px-5 py-3">Date</th>
              <th className="text-left font-medium px-5 py-3">Description</th>
              <th className="text-left font-medium px-5 py-3">Category</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-right font-medium px-5 py-3">Amount</th>
              <th className="text-right font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.transaction_type === "income";
              return (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(tx.transaction_date)}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900 max-w-xs truncate">{tx.description}</td>
                  <td className="px-5 py-3.5 text-sm">
                    {tx.category ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-700">{tx.category}</span>
                        {tx.ai_categorized && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md font-medium">
                            <Sparkles className="w-3 h-3" /> AI
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCategorize(tx)}
                        disabled={categorizingId === tx.id}
                        className="text-xs font-medium text-teal-600 hover:bg-teal-50 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {categorizingId === tx.id ? "Categorizing..." : "Categorize"}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                      isIncome ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600"
                    }`}>
                      {isIncome ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <ArrowDownCircle className="w-3.5 h-3.5" />}
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-sm font-semibold text-right whitespace-nowrap ${isIncome ? "text-teal-600" : "text-gray-900"}`}>
                    {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount), currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(tx)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(tx.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No transactions match your filters.</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.map((tx) => {
          const isIncome = tx.transaction_type === "income";
          return (
            <div key={tx.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.transaction_date)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {tx.category && <span className="text-xs text-gray-600">{tx.category}</span>}
                    {tx.ai_categorized && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md font-medium">
                        <Sparkles className="w-3 h-3" /> AI
                      </span>
                    )}
                    {!tx.category && tx.transaction_type === "expense" && (
                      <button
                        onClick={() => handleCategorize(tx)}
                        disabled={categorizingId === tx.id}
                        className="text-xs font-medium text-teal-600"
                      >
                        {categorizingId === tx.id ? "Categorizing..." : "Categorize"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${isIncome ? "text-teal-600" : "text-gray-900"}`}>
                    {isIncome ? "+" : "-"}{formatCurrency(Number(tx.amount), currency)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <button onClick={() => handleEdit(tx)} className="p-1.5 text-gray-400 hover:text-teal-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(tx.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredTransactions.length === 0 && (
          <div className="card p-8 text-center text-gray-400 text-sm">No transactions match your filters.</div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete transaction?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl px-4 py-2.5 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        onSave={handleSave}
        editingTransaction={editingTx}
      />
    </div>
  );
}
