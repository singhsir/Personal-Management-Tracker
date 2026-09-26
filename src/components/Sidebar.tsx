import { NavLink } from "react-router-dom";
import {
  Home,
  Receipt,
  Sparkles,
  PieChart,
  Target,
  Settings,
  LogOut,
  X,
  DollarSign,
  Sun,
  Moon,
  Bot,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAICompanion } from "@/context/AICompanionContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/budgets", label: "Budgets", icon: PieChart },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();
  const { openAICompanion } = useAICompanion();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#032e30] border-r border-[#084245] flex flex-col justify-between p-5 z-50 transition-transform duration-300 select-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo & Close button */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#095c52] flex items-center justify-center text-teal-200 shadow-md border border-[#0d796c] flex-shrink-0">
                <DollarSign className="w-6 h-6 text-teal-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold tracking-tight text-white">FinWise AI</h1>
                  <button onClick={onClose} className="lg:hidden text-teal-300 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[11px] leading-tight text-teal-200/60 font-normal mt-0.5">
                  Understand your money,<br />not just your transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm font-medium mt-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-[#08484a] text-white shadow-sm border border-[#0e6164] font-semibold"
                      : "text-teal-100/70 hover:text-white hover:bg-[#073c3f]"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* AI Money Companion Card & Logout */}
        <div className="space-y-4 pt-4">
          <div
            onClick={() => {
              openAICompanion();
              onClose();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                openAICompanion();
                onClose();
              }
            }}
            title="Click to chat with your AI Money Agent"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#083a3d] to-[#042527] border border-[#0d595c] hover:border-teal-400/80 p-4 text-center shadow-lg group cursor-pointer transition-all duration-200 hover:shadow-teal-900/40 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {/* Glowing orbs */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-400/30 transition-all" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Agent Mascot / Icon */}
            <div className="relative mx-auto mb-2.5 w-16 h-16 flex items-center justify-center">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0c5c5a] to-[#06393b] border-2 border-teal-300/40 group-hover:border-teal-300 flex items-center justify-center shadow-inner transition-colors">
                <Bot className="w-8 h-8 text-teal-200 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#042527] rounded-full animate-pulse" />
              </div>
              <div className="absolute top-0 right-1 text-teal-300 text-[10px] animate-pulse">✦</div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Your AI Money Companion
              </h3>
            </div>
            <p className="text-[11px] text-teal-200/70 leading-snug">
              Get personalized insights, smarter habits and a brighter financial future.
            </p>

            {/* Direct Click to Ask Inquiry Button */}
            <div className="mt-3 w-full py-1.5 px-3 rounded-xl bg-teal-500/20 hover:bg-teal-500/35 group-hover:bg-teal-500/35 border border-teal-400/30 text-teal-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
              <Bot className="w-3.5 h-3.5 text-teal-300" />
              <span>Ask Inquiry →</span>
            </div>

            {/* Equalizer wave */}
            <div className="mt-2.5 pt-2 border-t border-teal-500/20 flex items-center justify-center gap-1">
              <span className="w-1 h-2 bg-teal-400/60 rounded-full animate-bounce" />
              <span className="w-1 h-3.5 bg-teal-300 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1 h-5 bg-teal-200 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-3.5 bg-teal-300 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-2 bg-teal-400/60 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-teal-200/70 hover:text-white hover:bg-[#073c3f] rounded-xl transition-all"
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-teal-300/60" />
              )}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-900/60 text-teal-300 border border-teal-700/60 px-2 py-0.5 rounded-full">
              {isDark ? "Dark" : "Light"}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-teal-200/70 hover:text-white hover:bg-[#073c3f] rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 text-teal-300/60" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
