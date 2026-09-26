import { NavLink } from "react-router-dom";
import {
  Home,
  Receipt,
  Sparkles,
  PieChart,
  Settings,
  LogOut,
  X,
  DollarSign,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/budgets", label: "Budgets", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();

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
          <div class-name="flex items-start justify-between mb-8">
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#083a3d] to-[#042527] border border-[#0d595c] p-4 text-center shadow-lg group">
            {/* Glowing orbs */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* 3D Mascot Robot */}
            <div className="relative mx-auto mb-2.5 w-16 h-16 flex items-center justify-center">
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#0c5c5a] to-[#06393b] border-2 border-teal-300/40 flex items-center justify-center shadow-inner">
                <svg className="w-9 h-9 text-teal-200" viewBox="0 0 36 36" fill="none">
                  <rect x="7" y="10" width="22" height="16" rx="6" fill="#144b4d" stroke="#5eead4" strokeWidth="1.8" />
                  <path d="M18 10V5M18 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="#5eead4" strokeWidth="1.8" strokeLinecap="round" />
                  <rect x="10" y="13" width="16" height="10" rx="3.5" fill="#042021" />
                  <ellipse cx="14" cy="17.5" rx="2" ry="2.2" fill="#2dd4bf" />
                  <ellipse cx="22" cy="17.5" rx="2" ry="2.2" fill="#2dd4bf" />
                  <path d="M15 20.5c.8.8 2.2.8 3 0" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" />
                  <rect x="4" y="14" width="3" height="8" rx="1.5" fill="#2dd4bf" />
                  <rect x="29" y="14" width="3" height="8" rx="1.5" fill="#2dd4bf" />
                </svg>
              </div>
              <div className="absolute top-0 right-1 text-teal-300 text-[10px] animate-pulse">✦</div>
            </div>

            <h3 className="text-sm font-bold text-white tracking-wide">
              Your AI Money<br />Companion
            </h3>
            <p className="text-[11px] text-teal-200/70 mt-1 leading-snug">
              Get personalized insights, smarter habits and a brighter financial future.
            </p>

            {/* Equalizer wave */}
            <div className="mt-3.5 pt-2 border-t border-teal-500/20 flex items-center justify-center gap-1">
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
