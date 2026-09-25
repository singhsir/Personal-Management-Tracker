import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Database,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions, isDemoTransaction } from "@/hooks/useTransactions";
import { categorizeTransaction } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/calculations";
import type { Transaction, NewTransaction } from "@/lib/types";
import TransactionModal from "@/components/TransactionModal";
import EmptyState from "@/components/EmptyState";

export default function Transactions() {
  const { profile } = useAuthContext();
  const {
    transactions,
    loading,
    hasDemoData,
    demoTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    clearAllDemoData,
    loadDemoData,
    updateTransactionCategory,
  } = useTransactions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [categorizingId, setCategorizingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDemoModal, setShowDeleteDemoModal] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currency = profile?.currency || "INR";

  const allDemoIds = useMemo(() => demoTransactions.map((d) => d.id), [demoTransactions]);
  const allDemoSelected =
    allDemoIds.length > 0 && allDemoIds.every((id) => selectedIds.has(id));

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
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
      result = result.filter(
        (t) =>
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

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteId);
      return next;
    });
    setDeleteId(null);
    showNotification("Transaction deleted.");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllDemo = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allDemoSelected) {
        allDemoIds.forEach((id) => next.delete(id));
      } else {
        allDemoIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    const allFilteredSelected =
      filteredTransactions.length > 0 &&
      filteredTransactions.every((t) => selectedIds.has(t.id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredTransactions.forEach((t) => next.delete(t.id));
      } else {
        filteredTransactions.forEach((t) => next.add(t.id));
      }
      return next;
    });
  };

  const handleDeleteAllDemo = async () => {
    const count = demoTransactions.length;
    await clearAllDemoData();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allDemoIds.forEach((id) => next.delete(id));
      return next;
    });
    setShowDeleteDemoModal(false);
    showNotification(`Deleted all ${count} demo transactions.`);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    await deleteMultipleTransactions(ids);
    setSelectedIds(new Set());
    setShowDeleteSelectedModal(false);
    showNotification(`Deleted ${ids.length} selected transaction(s).`);
  };

  const handleRestoreDemo = () => {
    loadDemoData();
    showNotification("Demo data restored.");
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
      <div className="max-w-6xl mx-auto space-y-6">
        {statusMessage && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm font-semibold flex items-center justify-between animate-fade-in shadow-xs">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-teal-600 hover:text-teal-900 text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your income and expenses ledger</p>
          </div>
          <button
            onClick={handleRestoreDemo}
            className="px-3.5 py-2 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>
        </div>

        <EmptyState
          title="No transactions yet"
          description="Your transactions ledger is completely clear. Add your first real transaction or load demo data to preview features."
          actionLabel="Add Transaction"
          onAction={() => {
            setEditingTx(null);
            setModalOpen(true);
          }}
        />

        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 text-center space-y-2">
          <p className="text-xs text-slate-600 font-medium">
            Demo data has been cleared. You can load sample transactions anytime to test categorization, analytics, and bulk deletion.
          </p>
          <button
            onClick={handleRestoreDemo}
            className="text-xs text-teal-700 hover:text-teal-800 font-bold inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-200 rounded-lg shadow-2xs hover:bg-teal-50 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            Load Sample Demo Data
          </button>
        </div>

        <TransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          editingTransaction={editingTx}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-teal-600 hover:text-teal-900 text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Demo Data Banner with Checkbox Option to Delete All at Once */}
      {hasDemoData && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-amber-950">Demo Data Active</span>
                <span className="text-[11px] font-extrabold bg-amber-200/80 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {demoTransactions.length} demo records
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 max-w-xl font-normal">
                Pre-loaded sample transactions are currently in your ledger. Use the checkbox option below to select and delete all demo transactions at once.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Checkbox option to select all demo data */}
            <label className="flex items-center gap-2.5 px-3.5 py-2 bg-white/95 hover:bg-white rounded-xl border border-amber-300 text-xs font-bold text-amber-950 cursor-pointer transition-all shadow-2xs select-none hover:border-amber-400">
              <input
                type="checkbox"
                id="select-all-demo-checkbox"
                checked={allDemoSelected}
                onChange={handleToggleSelectAllDemo}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
              />
              <span>Select all demo data ({demoTransactions.length})</span>
            </label>

            {/* Delete all demo data button */}
            <button
              onClick={() => setShowDeleteDemoModal(true)}
              id="delete-all-demo-data-btn"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete all demo data at once</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {transactions.length} total transaction{transactions.length !== 1 ? "s" : ""}
            {hasDemoData && ` (${demoTransactions.length} demo)`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasDemoData ? (
            <button
              onClick={() => setShowDeleteDemoModal(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Demo Data
            </button>
          ) : (
            <button
              onClick={handleRestoreDemo}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Load Demo Data
            </button>
          )}

          <button
            onClick={() => {
              setEditingTx(null);
              setModalOpen(true);
            }}
            className="btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-slate-700 animate-slide-up">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span>
              {selectedIds.size} transaction{selectedIds.size > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Deselect all
            </button>

            {hasDemoData && allDemoSelected && (
              <button
                onClick={() => setShowDeleteDemoModal(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete all demo data at once</span>
              </button>
            )}

            <button
              onClick={() => setShowDeleteSelectedModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field py-2 text-sm cursor-pointer"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field py-2 text-sm cursor-pointer"
          >
            <option value="">All categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input-field py-2 text-sm cursor-pointer"
            >
              <option value="">All months</option>
              {allMonths.map((m) => {
                const [y, mo] = m.split("-");
                const date = new Date(Number(y), Number(mo) - 1, 1);
                return (
                  <option key={m} value={m}>
                    {date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </option>
                );
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
            <span className="text-gray-500">
              {filteredTransactions.length} result{filteredTransactions.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("");
                setCategoryFilter("");
                setMonthFilter("");
              }}
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
              <th className="w-12 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={
                    filteredTransactions.length > 0 &&
                    filteredTransactions.every((t) => selectedIds.has(t.id))
                  }
                  onChange={handleToggleSelectAllFiltered}
                  title="Select all filtered transactions"
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                />
              </th>
              <th className="text-left font-medium px-4 py-3">Date</th>
              <th className="text-left font-medium px-4 py-3">Description</th>
              <th className="text-left font-medium px-4 py-3">Category</th>
              <th className="text-left font-medium px-4 py-3">Type</th>
              <th className="text-right font-medium px-4 py-3">Amount</th>
              <th className="text-right font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.transaction_type === "income";
              const isDemo = isDemoTransaction(tx);
              const isSelected = selectedIds.has(tx.id);

              return (
                <tr
                  key={tx.id}
                  className={`transition-colors ${
                    isSelected ? "bg-teal-50/50" : "hover:bg-gray-50/50"
                  }`}
                >
                  <td className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(tx.id)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                    />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(tx.transaction_date)}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-gray-900 max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <span>{tx.description}</span>
                      {isDemo && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm">
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
                  <td className="px-4 py-3.5 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                        isIncome ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                      )}
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-sm font-semibold text-right whitespace-nowrap ${
                      isIncome ? "text-teal-600" : "text-gray-900"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Number(tx.amount), currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit transaction"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete transaction"
                      >
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
          <div className="text-center py-12 text-gray-400 text-sm">
            No transactions match your filters.
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.map((tx) => {
          const isIncome = tx.transaction_type === "income";
          const isDemo = isDemoTransaction(tx);
          const isSelected = selectedIds.has(tx.id);

          return (
            <div
              key={tx.id}
              className={`card p-4 transition-all ${
                isSelected ? "border-teal-500 bg-teal-50/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(tx.id)}
                    className="w-4 h-4 mt-1 rounded text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.description}
                      </p>
                      {isDemo && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(tx.transaction_date)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {tx.category && (
                        <span className="text-xs text-gray-600">{tx.category}</span>
                      )}
                      {tx.ai_categorized && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md font-medium">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-semibold ${
                      isIncome ? "text-teal-600" : "text-gray-900"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Number(tx.amount), currency)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-1.5 text-gray-400 hover:text-teal-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Single Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete transaction?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl px-4 py-2.5 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete ALL Demo Data Confirmation Modal */}
      {showDeleteDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setShowDeleteDemoModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-up border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Delete all demo data at once?
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              This will remove all <strong className="text-slate-900 font-semibold">{demoTransactions.length} demo transactions</strong> from your account and leave only your real entries. You can reload demo data anytime with one click.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteDemoModal(false)}
                className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllDemo}
                id="confirm-delete-all-demo"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-4 py-2.5 text-xs transition-colors shadow-sm active:scale-95"
              >
                Yes, Delete All Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Selected Transactions Confirmation Modal */}
      {showDeleteSelectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setShowDeleteSelectedModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-up border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Delete {selectedIds.size} selected transaction{selectedIds.size > 1 ? "s" : ""}?
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete these selected items? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteSelectedModal(false)}
                className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-4 py-2.5 text-xs transition-colors shadow-sm active:scale-95"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSave}
        editingTransaction={editingTx}
      />
    </div>
  );
}
