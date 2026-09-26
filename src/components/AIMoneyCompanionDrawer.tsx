import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Key,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { calculateSummary, formatCurrency } from "@/lib/calculations";
import {
  getOpenRouterKey,
  getOpenRouterModel,
  askAIMoneyCompanion,
  type ChatMessage,
  type FinancialContext,
} from "@/lib/openrouter";
import OpenRouterModal from "./OpenRouterModal";

interface AIMoneyCompanionDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AIMoneyCompanionDrawer({ open, onClose }: AIMoneyCompanionDrawerProps) {
  const { profile, user } = useAuthContext();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();

  const [hasKey, setHasKey] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName =
    profile?.full_name?.trim() ||
    (user?.user_metadata?.full_name as string)?.trim() ||
    user?.email?.split("@")[0] ||
    "User";
  const currency = profile?.currency || "INR";
  const summary = calculateSummary(transactions);

  useEffect(() => {
    setHasKey(!!getOpenRouterKey());
  }, [open, keyModalOpen]);

  // Build real-time financial context
  const financialContext: FinancialContext = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.transaction_type === "expense");
    const catMap: Record<string, number> = {};
    expenseTxs.forEach((t) => {
      const c = t.category || "Other";
      catMap[c] = (catMap[c] || 0) + Number(t.amount);
    });

    const topCategories = Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const budgetContext = budgets.map((b) => ({
      category: b.category,
      target: Number(b.amount),
      spent: catMap[b.category] || 0,
    }));

    const goalsContext = goals.map((g) => ({
      name: g.name,
      target: Number(g.target_amount),
      saved: Number(g.current_amount),
      date: g.target_date,
    }));

    return {
      userName: displayName,
      currency,
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      savings: summary.savings,
      savingsRate: summary.savingsRate,
      topCategories,
      budgets: budgetContext,
      goals: goalsContext,
    };
  }, [transactions, budgets, goals, displayName, currency, summary]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!open) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    if (!hasKey) {
      setKeyModalOpen(true);
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const reply = await askAIMoneyCompanion(textToSend, messages, financialContext);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error contacting OpenRouter AI.");
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "How can I boost my savings rate?",
    "Review my top expense categories",
    "How to reach my goals on time?",
    "Give me a monthly budgeting tip",
  ];

  return (
    <>
      <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[580px] bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#0e3b42] z-50 flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#061d21] border-b border-slate-100 dark:border-[#0e3b42] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Money Companion</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {hasKey ? `Powered by ${getOpenRouterModel().split("/")[1] || "OpenRouter"}` : "OpenRouter Not Configured"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setKeyModalOpen(true)}
              title="OpenRouter API Key Settings"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                hasKey
                  ? "text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60"
                  : "text-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-[10px]">{hasKey ? "Key Active" : "Set Key"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0c3137] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat / Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {/* Key Notice if missing */}
          {!hasKey && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>OpenRouter Key Required</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Connect your personal OpenRouter API Key to unlock real-time financial coaching, smart budget advice, and instant answers tailored to your account.
              </p>
              <button
                onClick={() => setKeyModalOpen(true)}
                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure OpenRouter Key</span>
              </button>
            </div>
          )}

          {/* Intro greeting */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-[#06262a] border border-teal-100/80 dark:border-teal-900/50 text-slate-700 dark:text-slate-200">
            <p className="font-semibold text-teal-900 dark:text-teal-200 mb-1">
              Hello {displayName}! 👋
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              I'm your FinWise companion. I can analyze your income ({formatCurrency(summary.totalIncome, currency)}), expenses ({formatCurrency(summary.totalExpenses, currency)}), budgets, and goals to provide personalized financial guidance.
            </p>
          </div>

          {/* Quick Prompt Chips (if messages is empty) */}
          {messages.length === 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Quick questions to ask
              </p>
              <div className="flex flex-col gap-1.5">
                {samplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#082a30] dark:hover:bg-[#0d3b42] text-slate-700 dark:text-slate-300 text-[11px] transition-colors border border-slate-100 dark:border-[#10444e] flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <span className="text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation history */}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-[11px] ${
                  m.role === "user"
                    ? "bg-[#095c52] text-white rounded-br-xs"
                    : "bg-slate-50 dark:bg-[#093238] text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-100 dark:border-[#0e434c]"
                }`}
              >
                {m.content}
              </div>

              {m.role === "user" && (
                <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing your finances with OpenRouter AI...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-start gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
              <button
                onClick={() => setKeyModalOpen(true)}
                className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Enter / Update OpenRouter Key</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-slate-50/70 dark:bg-[#061d21] border-t border-slate-100 dark:border-[#0e3b42]">
          {messages.length > 0 && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] text-slate-400">Context active</span>
              <button
                onClick={() => setMessages([])}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset Chat</span>
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your money..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="input-field text-xs py-2 flex-1"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-[#095c52] hover:bg-[#074b43] text-white rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <OpenRouterModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onKeySaved={() => setHasKey(true)}
      />
    </>
  );
}
