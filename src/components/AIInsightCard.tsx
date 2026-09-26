import { useState } from "react";
import { Sparkles, Loader2, Lightbulb, TrendingUp, AlertCircle, Bot, ArrowRight } from "lucide-react";
import { fetchInsights } from "@/lib/api";
import type { InsightResponse } from "@/lib/types";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { useAuthContext } from "@/context/AuthContext";
import { calculateSummary } from "@/lib/calculations";

interface AIInsightCardProps {
  startDate: string;
  endDate: string;
  variant?: "dashboard" | "full";
}

export default function AIInsightCard({ startDate, endDate, variant = "dashboard" }: AIInsightCardProps) {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();
  const { profile, user } = useAuthContext();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Filter transactions for the selected period
      const periodTxs = transactions.filter((t) => {
        const d = t.transaction_date;
        return (!startDate || d >= startDate) && (!endDate || d <= endDate);
      });
      const targetTxs = periodTxs.length > 0 ? periodTxs : transactions;

      const summary = calculateSummary(targetTxs);
      const catMap: Record<string, number> = {};
      targetTxs
        .filter((t) => t.transaction_type === "expense")
        .forEach((t) => {
          const c = t.category || "Other";
          catMap[c] = (catMap[c] || 0) + Number(t.amount || 0);
        });

      const topCategories = Object.entries(catMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

      const context = {
        userName: profile?.full_name || (user?.user_metadata?.full_name as string) || "User",
        currency: profile?.currency || "INR",
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        savings: summary.savings,
        savingsRate: summary.savingsRate,
        topCategories,
        budgets: budgets.map((b) => ({ category: b.category, target: b.amount })),
        goals: goals.map((g) => ({ name: g.name, target: g.target_amount, saved: g.current_amount })),
      };

      const result = await fetchInsights(startDate, endDate, context, targetTxs);
      setInsight(result);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "dashboard") {
    return (
      <div className="card p-5 bg-gradient-to-br from-teal-50 to-white dark:from-[#082a2f] dark:to-[#041a1d] border-teal-100 dark:border-[#0e444c] shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-teal-600 rounded-lg p-1.5 text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-teal-900 dark:text-teal-200">AI Money Insight</span>
        </div>

        {!hasGenerated && !loading && (
          <div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">"Your spending pattern at a glance"</p>
            <button onClick={handleGenerate} className="btn-primary text-sm">
              Generate Insights
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI is analyzing your spending...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {insight && !loading && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-slate-900 dark:text-white font-medium text-sm leading-relaxed">{insight.headline}</p>
            {insight.summary && <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{insight.summary}</p>}
            {insight.areas_to_review.length > 0 && (
              <ul className="space-y-1.5">
                {insight.areas_to_review.slice(0, 2).map((area, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    {area}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={handleGenerate} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
              Refresh insight
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!hasGenerated && !loading && !error && (
        <div className="card p-10 md:p-12 text-center bg-white dark:bg-[#072428] border-slate-200 dark:border-[#0e3b42] shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800 rounded-2xl mb-4 text-teal-600 dark:text-teal-400 shadow-sm">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready for your insights</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Click below to generate comprehensive AI observations, spending velocity analysis, and recommendations for this period.
          </p>
          <button onClick={handleGenerate} className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Insights</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center bg-white dark:bg-[#072428] border-slate-200 dark:border-[#0e3b42]">
          <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin mx-auto mb-4" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Analyzing your financial patterns...</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Evaluating income, expenses, category concentrations, and budget targets.</p>
        </div>
      )}

      {error && (
        <div className="card p-6 bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-2xl">
          <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold text-sm mb-1">Couldn't generate insights</p>
              <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
              <button onClick={handleGenerate} className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1">
                <span>Try again</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {insight && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Headline Card */}
          <div className="card p-6 bg-gradient-to-br from-teal-50/90 to-white dark:from-[#062c31] dark:to-[#041a1d] border border-teal-100 dark:border-[#0e444c] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">AI Financial Snapshot</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mb-2">{insight.headline}</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{insight.summary}</p>
          </div>

          {/* Observations Card */}
          {insight.observations.length > 0 && (
            <div className="card p-6 bg-white dark:bg-[#072428] border-slate-200 dark:border-[#0e3b42] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Observations</h3>
              </div>
              <ul className="space-y-3">
                {insight.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Review Card */}
          {insight.areas_to_review.length > 0 && (
            <div className="card p-6 bg-white dark:bg-[#072428] border-slate-200 dark:border-[#0e3b42] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Recommended Actions</h3>
              </div>
              <ul className="space-y-3">
                {insight.areas_to_review.map((area, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Footer */}
          <div className="text-center pt-2">
            <button onClick={handleGenerate} className="btn-secondary text-sm inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Regenerate Insights</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            AI observations reflect actual transaction distributions and personal finance benchmarks.
          </p>
        </div>
      )}
    </div>
  );
}
