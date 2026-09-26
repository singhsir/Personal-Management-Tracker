import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  MessageSquare,
  ArrowRight,
  Send,
  Loader2,
  Key,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { useAICompanion } from "@/context/AICompanionContext";
import { useAuthContext } from "@/context/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { calculateSummary, formatCurrency } from "@/lib/calculations";
import {
  askAIMoneyCompanion,
  isPersonalKeyConfigured,
  getOpenRouterKey,
  getOpenRouterModel,
  type ChatMessage,
  type FinancialContext,
} from "@/lib/openrouter";
import OpenRouterModal from "./OpenRouterModal";

const COMPANION_TIPS = [
  "Namaste! Saving even 10% more each month can compound into big wealth!",
  "Always keep an emergency fund of 3-6 months' expenses handy.",
  "Small daily savings add up to huge yearly rewards!",
  "Reviewing recurring subscriptions today could save you ₹1,500/month!",
  "Consistency is the true superpower of financial independence!",
  "Time in the market always beats timing the market. Start investing early!",
];

export default function SidebarCompanion({ onAction }: { onAction?: () => void }) {
  const { openAICompanion } = useAICompanion();
  const { profile, user } = useAuthContext();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();

  const displayName =
    profile?.full_name?.split(" ")[0] ||
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "friend";
  const currency = profile?.currency || "INR";
  const summary = calculateSummary(transactions);

  const [character, setCharacter] = useState<"ananya" | "kabir">(() => {
    return (localStorage.getItem("finwise_companion_char") as "ananya" | "kabir") || "ananya";
  });
  const [tipsEnabled, setTipsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("finwise_companion_tips");
    return saved !== null ? saved === "true" : true;
  });

  const [isWaving, setIsWaving] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [currentTip, setCurrentTip] = useState("");
  const [tipIndex, setTipIndex] = useState(0);

  // Chat Text Box states
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [lastUserQuery, setLastUserQuery] = useState("");
  const [isAiResponse, setIsAiResponse] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);

  useEffect(() => {
    setHasPersonalKey(isPersonalKeyConfigured());
  }, [keyModalOpen]);

  useEffect(() => {
    localStorage.setItem("finwise_companion_char", character);
  }, [character]);

  useEffect(() => {
    localStorage.setItem("finwise_companion_tips", String(tipsEnabled));
  }, [tipsEnabled]);

  // Construct financial context
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

  // Initial welcome greeting
  useEffect(() => {
    if (!isAiResponse) {
      setCurrentTip(`Namaste ${displayName}! I'm Ananya, your wealth buddy. Ask me anything in the box below! ✨`);
      setIsWaving(true);
      const waveTimer = setTimeout(() => setIsWaving(false), 3000);
      return () => clearTimeout(waveTimer);
    }
  }, [displayName]);

  // Cycle tips periodically every 28s only if not showing an AI response
  useEffect(() => {
    if (!tipsEnabled || isAiResponse || loading) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => {
        const next = (prev + 1) % COMPANION_TIPS.length;
        setCurrentTip(COMPANION_TIPS[next]);
        setShowTip(true);
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 2400);
        return next;
      });
    }, 28000);

    return () => clearInterval(interval);
  }, [tipsEnabled, isAiResponse, loading]);

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWaving(true);
    if (!isAiResponse) {
      const nextTip = COMPANION_TIPS[Math.floor(Math.random() * COMPANION_TIPS.length)];
      setCurrentTip(nextTip);
      setShowTip(true);
    }
    setTimeout(() => setIsWaving(false), 2500);
  };

  const handleOpenCompanion = () => {
    openAICompanion();
    if (onAction) onAction();
  };

  // Handle direct question submission to Ananya
  const handleAskAnanya = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setLastUserQuery(query);
    setLoading(true);
    setIsAiResponse(true);
    setShowTip(true);
    setIsWaving(true);
    setCurrentTip("Analyzing your finances with OpenRouter AI... ✨");

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: query }];
    setChatHistory(newHistory);

    try {
      const reply = await askAIMoneyCompanion(query, chatHistory, financialContext);
      setCurrentTip(reply);
      setChatHistory((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't reach OpenRouter AI.";
      setCurrentTip(`Notice: ${msg}. Click the Key icon to check your OpenRouter API key.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative rounded-2xl bg-gradient-to-b from-[#083e42] via-[#052b2e] to-[#021d1f] border border-[#0d595c] hover:border-teal-400/60 p-3.5 text-center shadow-xl group transition-all duration-300 select-none">
        {/* Ambient background glows */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-teal-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-400/30 transition-all" />
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Floating Header Controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
              {character === "ananya" ? "Ananya" : "Kabir"} • AI Companion
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* OpenRouter Key Settings */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setKeyModalOpen(true);
              }}
              className={`p-1 rounded-md transition-colors ${
                hasPersonalKey
                  ? "text-teal-300 hover:text-white bg-teal-800/60 border border-teal-500/40"
                  : "text-teal-300/60 hover:text-white hover:bg-teal-900/50"
              }`}
              title="OpenRouter API Key Settings"
            >
              <Key className="w-3 h-3" />
            </button>

            {/* Character Switcher (Ananya / Kabir) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const next = character === "ananya" ? "kabir" : "ananya";
                setCharacter(next);
                setIsAiResponse(false);
                setCurrentTip(
                  next === "ananya"
                    ? "Namaste! Ananya here, ready to guide your savings! ✨"
                    : "Hello! Kabir here, let's reach those financial milestones! 🚀"
                );
                setShowTip(true);
                setIsWaving(true);
                setTimeout(() => setIsWaving(false), 2500);
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-700/50 transition-colors"
              title={`Switch to ${character === "ananya" ? "Kabir" : "Ananya"}`}
            >
              {character === "ananya" ? "👧 Ananya" : "👦 Kabir"}
            </button>

            {/* Sound / Tip toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTipsEnabled(!tipsEnabled);
                if (tipsEnabled && !isAiResponse) setShowTip(false);
              }}
              className="text-teal-300/70 hover:text-white p-1 rounded hover:bg-teal-900/50 transition-colors"
              title={tipsEnabled ? "Mute tips" : "Enable tips"}
            >
              {tipsEnabled ? <Volume2 className="w-3 h-3 text-teal-400" /> : <VolumeX className="w-3 h-3 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Dynamic Speech / AI Response Bubble from Ananya */}
        {showTip && (
          <div className="relative mb-2.5 p-2.5 rounded-xl bg-teal-950/90 border border-teal-500/40 text-left shadow-lg text-xs animate-fade-in max-h-48 overflow-y-auto">
            <div className="flex items-start justify-between gap-1.5 mb-1 sticky top-0 bg-teal-950/90 pb-0.5">
              <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>
                  {isAiResponse
                    ? `${character === "ananya" ? "Ananya's AI Answer" : "Kabir's AI Answer"}`
                    : `${character === "ananya" ? "Ananya's Wisdom" : "Kabir's Wisdom"}`}
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTip(false);
                }}
                className="text-teal-300/60 hover:text-white"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-teal-300 py-1 text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                <span>Thinking with OpenRouter AI...</span>
              </div>
            ) : (
              <div className="text-[11px] leading-relaxed text-teal-100/95 font-medium whitespace-pre-wrap">
                {currentTip}
              </div>
            )}

            {/* Quick Actions inside Bubble */}
            {isAiResponse && !loading && (
              <div className="mt-2 pt-1.5 border-t border-teal-800/80 flex items-center justify-between text-[10px]">
                <button
                  onClick={handleOpenCompanion}
                  className="text-teal-300 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>Full Chat Drawer</span>
                </button>
                <button
                  onClick={() => {
                    setIsAiResponse(false);
                    setCurrentTip(COMPANION_TIPS[0]);
                  }}
                  className="text-teal-400/80 hover:text-teal-200"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Arrow pointing down to character */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-teal-950/90" />
          </div>
        )}

        {/* Prominent Centerpiece Character Stage (Larger Size) */}
        <div
          className="relative mx-auto flex flex-col items-center justify-center cursor-pointer my-1 group/mascot"
          onClick={handleMascotClick}
          title="Click to interact with Ananya!"
        >
          {/* Soft aura glow behind her */}
          <div className="absolute w-36 h-44 bg-teal-400/15 rounded-full blur-xl group-hover/mascot:bg-teal-300/25 transition-all" />

          {/* Dynamic Shadow Pedestal */}
          <div className="absolute bottom-1 w-28 h-4 bg-black/60 rounded-full blur-xs companion-shadow" />

          {/* Scaled & Animated Character Rig */}
          <div className="relative companion-bob transform-gpu transition-transform hover:scale-105">
            {character === "ananya" ? (
              <AnanyaSidebarSVG isWaving={isWaving} />
            ) : (
              <KabirSidebarSVG isWaving={isWaving} />
            )}
          </div>

          {/* Click hint pill on hover */}
          <div className="absolute bottom-1 opacity-0 group-hover/mascot:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-teal-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-500/40">
            🙏 Click to say Hi!
          </div>
        </div>

        {/* Interactive Question Input Box for Ananya */}
        <form onSubmit={handleAskAnanya} className="mt-2.5 relative flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Ananya...`}
              disabled={loading}
              className="w-full text-xs py-2 pl-3 pr-8 rounded-xl bg-teal-950/80 border border-teal-500/40 text-white placeholder-teal-300/50 focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-teal-400/40 transition-all disabled:opacity-50"
            />
            {loading && (
              <Loader2 className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-teal-300 animate-spin" />
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 disabled:opacity-40 disabled:hover:bg-teal-600 text-white transition-all shadow-md flex-shrink-0"
            title="Ask Ananya"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Bottom Quick Action: Open Full Chat Drawer */}
        <div className="mt-2 pt-2 border-t border-teal-500/20 flex items-center justify-between text-[10px] text-teal-200/80">
          <button
            onClick={handleOpenCompanion}
            className="flex items-center gap-1 hover:text-white font-semibold transition-colors"
          >
            <MessageSquare className="w-3 h-3 text-teal-400" />
            <span>Open Full Chat</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>

          {/* Equalizer animation */}
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-2 bg-teal-400/60 rounded-full animate-bounce" />
            <span className="w-1 h-3 bg-teal-300 rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-1 h-4 bg-teal-200 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1 h-3 bg-teal-300 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        </div>
      </div>

      {/* OpenRouter API Key Modal */}
      <OpenRouterModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onKeySaved={() => setHasPersonalKey(isPersonalKeyConfigured())}
      />
    </>
  );
}

/**
 * Ananya - Modern Indian Teen Girl Avatar
 * Rendered at 150px x 195px with rich peacock-teal kurti,
 * coral dupatta, golden jhumkas, and animated gestures.
 */
function AnanyaSidebarSVG({ isWaving }: { isWaving: boolean }) {
  return (
    <svg
      width="150"
      height="195"
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl"
    >
      <defs>
        <linearGradient id="sbAnanyaSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd8b3" />
          <stop offset="100%" stopColor="#f3b586" />
        </linearGradient>
        <linearGradient id="sbAnanyaKurti" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d7a71" />
          <stop offset="60%" stopColor="#08544e" />
          <stop offset="100%" stopColor="#043834" />
        </linearGradient>
        <linearGradient id="sbAnanyaDupatta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#be185d" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="sbGoldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="sbTabletScreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#042f2e" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>

      {/* Ponytail Hair behind */}
      <path
        d="M96 52 C115 58, 126 78, 122 102 C118 116, 108 126, 98 128 C94 122, 92 110, 95 95 C98 80, 96 64, 96 52 Z"
        fill="#261b17"
      />
      {/* Golden hair tie */}
      <ellipse cx="98" cy="56" rx="4.5" ry="6" fill="url(#sbGoldAccent)" transform="rotate(20 98 56)" />

      {/* Legs & Contemporary White/Teal Sneakers */}
      <rect x="67" y="155" width="8" height="35" rx="4" fill="#f3b586" />
      <rect x="85" y="155" width="8" height="35" rx="4" fill="#f3b586" />

      {/* Left Shoe */}
      <ellipse cx="71" cy="192" rx="7" ry="4.5" fill="#ffffff" />
      <path d="M64 192 Q71 190 78 192 L78 195 Q71 197 64 195 Z" fill="#0d9488" />
      <circle cx="71" cy="191" r="1.5" fill="#f59e0b" />

      {/* Right Shoe */}
      <ellipse cx="89" cy="192" rx="7" ry="4.5" fill="#ffffff" />
      <path d="M82 192 Q89 190 96 192 L96 195 Q89 197 82 195 Z" fill="#0d9488" />
      <circle cx="89" cy="191" r="1.5" fill="#f59e0b" />

      {/* Kurti Flare Bottom */}
      <path
        d="M58 135 L102 135 L112 165 C96 169, 64 169, 48 165 Z"
        fill="url(#sbAnanyaKurti)"
      />
      {/* Kurti hem border with gold zari */}
      <path
        d="M48 162 C64 166, 96 166, 112 162 L112 165 C96 169, 64 169, 48 165 Z"
        fill="url(#sbGoldAccent)"
      />

      {/* Kurti Torso */}
      <path
        d="M62 90 L98 90 L102 138 L58 138 Z"
        fill="url(#sbAnanyaKurti)"
      />

      {/* Gold Embroidered Neckline & Placket */}
      <path d="M72 88 L88 88 L84 112 L76 112 Z" fill="url(#sbGoldAccent)" />
      <circle cx="80" cy="98" r="1.5" fill="#dc2626" />
      <circle cx="80" cy="106" r="1.5" fill="#dc2626" />

      {/* Dupatta Flowing Across Shoulder (Animated float) */}
      <g className="companion-dupatta">
        <path
          d="M62 88 C55 98, 48 120, 46 150 C52 153, 58 152, 60 146 C60 125, 68 105, 75 92 Z"
          fill="url(#sbAnanyaDupatta)"
        />
        {/* Dupatta Gold Borders */}
        <path
          d="M46 148 C48 150, 52 151, 56 151 L56 153 C50 153, 47 151, 46 148 Z"
          fill="url(#sbGoldAccent)"
        />
      </g>

      {/* Left Arm Holding Digital Tablet */}
      <g>
        <path d="M62 92 L48 114 L55 124 L68 104 Z" fill="url(#sbAnanyaKurti)" />
        {/* Wrist & Golden Chudi/Bangles */}
        <ellipse cx="53" cy="120" rx="3.5" ry="2" fill="url(#sbGoldAccent)" />
        <ellipse cx="52" cy="123" rx="4" ry="4" fill="url(#sbAnanyaSkin)" />

        {/* Digital Financial Tablet */}
        <rect
          x="34"
          y="114"
          width="26"
          height="32"
          rx="3.5"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1"
          transform="rotate(-10 47 130)"
        />
        <rect
          x="36"
          y="116"
          width="22"
          height="28"
          rx="2.5"
          fill="url(#sbTabletScreen)"
          transform="rotate(-10 47 130)"
        />
        {/* Rupee & mini growth spark on tablet */}
        <text
          x="44"
          y="128"
          fill="#34d399"
          fontSize="9"
          fontWeight="bold"
          fontFamily="system-ui"
          transform="rotate(-10 47 130)"
        >
          ₹
        </text>
        <polyline
          points="39,138 43,134 47,136 53,128"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(-10 47 130)"
        />
      </g>

      {/* Neck */}
      <rect x="74" y="78" width="12" height="14" rx="4" fill="url(#sbAnanyaSkin)" />
      <path d="M74 86 Q80 89 86 86" stroke="url(#sbGoldAccent)" strokeWidth="1.8" fill="none" />

      {/* Head */}
      <ellipse cx="80" cy="62" rx="19" ry="22" fill="url(#sbAnanyaSkin)" />

      {/* Traditional Bindi */}
      <circle cx="80" cy="54" r="1.5" fill="#dc2626" />

      {/* Cheerful Eyes with Catchlight & Blink Animation */}
      <g className="companion-blink">
        <ellipse cx="73" cy="62" rx="3.5" ry="3.8" fill="#2d1c14" />
        <circle cx="74" cy="61" r="1.2" fill="#ffffff" />
        <ellipse cx="87" cy="62" rx="3.5" ry="3.8" fill="#2d1c14" />
        <circle cx="88" cy="61" r="1.2" fill="#ffffff" />
      </g>

      {/* Eyelashes & Brows */}
      <path d="M69 56 Q73 53 77 56" stroke="#2d1c14" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M83 56 Q87 53 91 56" stroke="#2d1c14" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Cheeks blush */}
      <circle cx="70" cy="68" r="4.5" fill="#f87171" fillOpacity="0.35" />
      <circle cx="90" cy="68" r="4.5" fill="#f87171" fillOpacity="0.35" />

      {/* Cute Smile */}
      <path d="M76 70 Q80 75 84 70" stroke="#be185d" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M79 63 Q81 66 79 67" stroke="#e09e75" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* Hair Front */}
      <path
        d="M62 56 C62 40, 72 34, 80 34 C88 34, 98 40, 98 56 C94 48, 86 44, 80 44 C74 44, 66 48, 62 56 Z"
        fill="#261b17"
      />
      <path
        d="M62 56 C62 68, 65 74, 65 74 C63 68, 64 58, 66 52 Z"
        fill="#261b17"
      />

      {/* Golden Jhumka Earrings */}
      <g className="companion-jhumka">
        <circle cx="62" cy="68" r="1.5" fill="url(#sbGoldAccent)" />
        <path d="M60 70 L64 70 L65 74 L59 74 Z" fill="url(#sbGoldAccent)" />
        <circle cx="62" cy="76" r="1" fill="#fef08a" />
      </g>
      <g className="companion-jhumka">
        <circle cx="98" cy="68" r="1.5" fill="url(#sbGoldAccent)" />
        <path d="M96 70 L100 70 L101 74 L95 74 Z" fill="url(#sbGoldAccent)" />
        <circle cx="98" cy="76" r="1" fill="#fef08a" />
      </g>

      {/* Right Arm: Interactive (Namaste / Waving / Idle) */}
      {isWaving ? (
        <g className="transition-all duration-300">
          <path d="M98 92 L112 80 L118 84 L102 102 Z" fill="url(#sbAnanyaKurti)" />
          <ellipse cx="116" cy="80" rx="3.5" ry="2" fill="url(#sbGoldAccent)" />
          <g transform="rotate(-15 120 74)">
            <ellipse cx="120" cy="74" rx="4.5" ry="5.5" fill="url(#sbAnanyaSkin)" />
            <path d="M118 70 L118 64" stroke="url(#sbAnanyaSkin)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M121 70 L121 63" stroke="url(#sbAnanyaSkin)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M124 71 L124 65" stroke="url(#sbAnanyaSkin)" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      ) : (
        <g>
          <path d="M98 92 L110 114 L104 122 L94 102 Z" fill="url(#sbAnanyaKurti)" />
          <ellipse cx="106" cy="118" rx="3.5" ry="2" fill="url(#sbGoldAccent)" />
          <ellipse cx="104" cy="123" rx="4" ry="4.5" fill="url(#sbAnanyaSkin)" />
        </g>
      )}
    </svg>
  );
}

/**
 * Kabir - Modern Indian Teen Boy Avatar for Sidebar
 */
function KabirSidebarSVG({ isWaving }: { isWaving: boolean }) {
  return (
    <svg
      width="150"
      height="195"
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl"
    >
      <defs>
        <linearGradient id="sbKabirSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fba668" />
        </linearGradient>
        <linearGradient id="sbKabirNehru" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="sbKabirKurta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>

      <rect x="67" y="150" width="10" height="40" rx="3" fill="#1e293b" />
      <rect x="83" y="150" width="10" height="40" rx="3" fill="#1e293b" />
      <ellipse cx="72" cy="192" rx="7.5" ry="4.5" fill="#ffffff" />
      <ellipse cx="88" cy="192" rx="7.5" ry="4.5" fill="#ffffff" />

      <path d="M58 135 L102 135 L106 155 L54 155 Z" fill="url(#sbKabirKurta)" />
      <path d="M58 90 L102 90 L104 142 L56 142 Z" fill="url(#sbKabirNehru)" />
      <path d="M72 87 L88 87 L88 92 L72 92 Z" fill="#047857" />

      <circle cx="80" cy="98" r="1.5" fill="#fde047" />
      <circle cx="80" cy="108" r="1.5" fill="#fde047" />
      <circle cx="80" cy="118" r="1.5" fill="#fde047" />
      <circle cx="80" cy="128" r="1.5" fill="#fde047" />

      <polygon points="64,104 70,104 68,100" fill="#f59e0b" />

      <path d="M58 92 L46 114 L54 122 L66 102 Z" fill="url(#sbKabirKurta)" />
      <ellipse cx="50" cy="121" rx="4" ry="4" fill="url(#sbKabirSkin)" />
      <rect x="36" y="112" width="22" height="28" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <polyline points="40,126 44,122 47,125 52,118" fill="none" stroke="#10b981" strokeWidth="1.5" />

      <rect x="74" y="78" width="12" height="14" rx="3" fill="url(#sbKabirSkin)" />
      <ellipse cx="80" cy="62" rx="18" ry="21" fill="url(#sbKabirSkin)" />

      <g className="companion-blink">
        <ellipse cx="73" cy="62" rx="3" ry="3.5" fill="#1c1917" />
        <circle cx="74" cy="61" r="1" fill="#ffffff" />
        <ellipse cx="87" cy="62" rx="3" ry="3.5" fill="#1c1917" />
        <circle cx="88" cy="61" r="1" fill="#ffffff" />
      </g>
      <path d="M69 56 Q73 54 77 56" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M83 56 Q87 54 91 56" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      <path d="M76 71 Q80 75 84 71" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      <path
        d="M62 58 C61 42, 70 33, 80 33 C90 33, 99 42, 98 58 C96 50, 90 46, 80 46 C70 46, 64 50, 62 58 Z"
        fill="#1c1917"
      />
      <path d="M61 58 L63 68 L66 66 L64 58 Z" fill="#292524" />
      <path d="M99 58 L97 68 L94 66 L96 58 Z" fill="#292524" />

      {isWaving ? (
        <g>
          <path d="M102 92 L116 80 L122 86 L106 102 Z" fill="url(#sbKabirKurta)" />
          <rect x="114" y="80" width="4" height="6" rx="1.5" fill="#0284c7" />
          <ellipse cx="120" cy="75" rx="4.5" ry="5" fill="url(#sbKabirSkin)" />
        </g>
      ) : (
        <g>
          <path d="M102 92 L114 114 L108 122 L98 102 Z" fill="url(#sbKabirKurta)" />
          <rect x="108" y="115" width="4" height="6" rx="1.5" fill="#0284c7" />
          <ellipse cx="106" cy="122" rx="4" ry="4.5" fill="url(#sbKabirSkin)" />
        </g>
      )}
    </svg>
  );
}
