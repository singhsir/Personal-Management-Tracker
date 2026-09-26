import { useState, useMemo } from "react";
import {
  Target,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Sparkles,
  CheckCircle2,
  Coins,
  Shield,
  Car,
  Plane,
  Home,
  Laptop,
  GraduationCap,
  Heart,
  TrendingUp,
  Loader2,
  DollarSign,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useGoals, type Goal } from "@/hooks/useGoals";
import { formatCurrency } from "@/lib/calculations";

const GOAL_CATEGORIES: Record<string, { icon: typeof Target; color: string; bg: string }> = {
  Emergency: { icon: Shield, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
  Vehicle: { icon: Car, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60" },
  Travel: { icon: Plane, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60" },
  Home: { icon: Home, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
  Tech: { icon: Laptop, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/60" },
  Education: { icon: GraduationCap, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/60" },
  Personal: { icon: Heart, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60" },
  General: { icon: Target, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800" },
};

export default function Goals() {
  const { profile } = useAuthContext();
  const { goals, loading, addGoal, updateGoal, addContribution, deleteGoal } = useGoals();
  const currency = profile?.currency || "INR";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summary Metrics
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + Number(g.target_amount), 0), [goals]);
  const totalSaved = useMemo(() => goals.reduce((s, g) => s + Number(g.current_amount), 0), [goals]);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const completedGoals = useMemo(
    () => goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount)).length,
    [goals],
  );

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName("");
    setCategory("General");
    setTargetAmount("");
    setCurrentAmount("");
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    setTargetDate(defaultDate.toISOString().split("T")[0]);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (g: Goal) => {
    setEditingGoal(g);
    setName(g.name);
    setCategory(g.category);
    setTargetAmount(String(g.target_amount));
    setCurrentAmount(String(g.current_amount));
    setTargetDate(g.target_date);
    setError(null);
    setModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a goal name.");
      return;
    }
    const tAmt = parseFloat(targetAmount);
    if (isNaN(tAmt) || tAmt <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }
    const cAmt = parseFloat(currentAmount) || 0;
    if (!targetDate) {
      setError("Please select a target date.");
      return;
    }

    setSaving(true);
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          name: name.trim(),
          category,
          target_amount: tAmt,
          current_amount: cAmt,
          target_date: targetDate,
        });
      } else {
        await addGoal({
          name: name.trim(),
          category,
          target_amount: tAmt,
          current_amount: cAmt,
          target_date: targetDate,
        });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    setDepositLoading(true);
    try {
      await addContribution(depositGoal.id, amt);
      setDepositGoal(null);
      setDepositAmount("");
    } catch (err) {
      console.error(err);
    } finally {
      setDepositLoading(false);
    }
  };

  const calculateMonthsLeft = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(1, months);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <span>Financial Goals</span>
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-0.5 text-xs font-medium">
            Track and fund your dream milestones with automated monthly savings pace
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Target</span>
            <Target className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalTarget, currency)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {goals.length} active target{goals.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Saved</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSaved, currency)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {overallProgress}% of all goals reached
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Remaining Need</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(Math.max(0, totalTarget - totalSaved), currency)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Pending contributions
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Milestones</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {completedGoals} / {goals.length}
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#0c3137] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid or Empty State */}
      {goals.length === 0 ? (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 dark:border-teal-800">
            <Target className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No financial goals set yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Whether it's building an emergency fund, buying a car, or planning a vacation, set a target and FinWise will calculate your monthly savings schedule.
          </p>
          <button
            onClick={handleOpenAdd}
            className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((g) => {
            const current = Number(g.current_amount) || 0;
            const target = Number(g.target_amount) || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const remaining = Math.max(0, target - current);
            const isCompleted = current >= target;
            const monthsLeft = calculateMonthsLeft(g.target_date);
            const monthlyPace = !isCompleted ? Math.ceil(remaining / monthsLeft) : 0;
            const conf = GOAL_CATEGORIES[g.category] || GOAL_CATEGORIES.General;
            const Icon = conf.icon;

            return (
              <div
                key={g.id}
                className="card p-5 hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${conf.bg} ${conf.color} flex items-center justify-center shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{g.name}</span>
                          {isCompleted && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full uppercase">
                              Achieved 🏆
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>Target: {new Date(g.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                          <span>•</span>
                          <span>{monthsLeft} mo left</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-[#0c2f34] rounded-lg transition-colors"
                        title="Edit Goal"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(g.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Balance / Progress Info */}
                  <div className="my-4 p-3 bg-slate-50/80 dark:bg-[#061d21] rounded-2xl">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved</span>
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {formatCurrency(current, currency)}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                          / {formatCurrency(target, currency)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200/70 dark:bg-[#0c3137] overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-emerald-500" : pct > 65 ? "bg-teal-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{pct}% completed</span>
                      <span>{isCompleted ? "Goal Completed!" : `${formatCurrency(remaining, currency)} remaining`}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Pace & Deposit Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#0e3b42]">
                  <div>
                    {!isCompleted ? (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Save <strong className="text-teal-600 dark:text-teal-400 font-bold">{formatCurrency(monthlyPace, currency)}</strong> / mo
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Fully Funded
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setDepositGoal(g);
                      setDepositAmount("");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Funds</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-gray-100 dark:border-[#0e3b42]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set a milestone and track your savings progress
              </p>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, New Laptop, Japan Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field text-sm cursor-pointer"
                  >
                    {Object.keys(GOAL_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Amount ({currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="input-field text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Currently Saved ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="input-field text-sm font-semibold"
                  />
                </div>
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
                  <span>{saving ? "Saving..." : editingGoal ? "Update Goal" : "Save Goal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds / Deposit Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-sm overflow-hidden animate-scale-up p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-teal-100 dark:border-teal-800">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Funds to {depositGoal.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Current savings: {formatCurrency(Number(depositGoal.current_amount), currency)}
              </p>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deposit Amount ({currency})
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="input-field text-base font-bold text-center"
                  autoFocus
                  required
                />
              </div>

              {/* Quick chips */}
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(String(preset))}
                    className="py-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#0c3137] hover:bg-slate-200 dark:hover:bg-[#103e45] rounded-xl transition-colors"
                  >
                    +{preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="btn-secondary flex-1 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading || !depositAmount}
                  className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {depositLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Funds</span>
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
              Delete this goal?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              This will remove this savings milestone from your dashboard.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGoal(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
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
