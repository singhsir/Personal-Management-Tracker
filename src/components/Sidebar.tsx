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
import SidebarCompanion from "./SidebarCompanion";

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
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#032e30] border-r border-[#084245] flex flex-col justify-between p-5 z-50 transition-transform duration-300 select-none overflow-y-auto overflow-x-hidden ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo & Close button */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg border border-teal-500/30 bg-[#021d1f] flex items-center justify-center flex-shrink-0 group relative p-0.5">
                <img
                  src="/finwise-logo.png"
                  alt="FinWise AI Logo"
                  className="w-full h-full object-cover object-top rounded-xl transition-transform group-hover:scale-105"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold tracking-tight text-white">FinWise AI</h1>
                  <button onClick={onClose} className="lg:hidden text-teal-300 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[11px] leading-tight text-teal-200/80 font-normal mt-0.5">
                  Use your money smarter
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

        {/* Ananya Companion (Visible on all pages) & Controls */}
        <div className="space-y-3 pt-4">
          <SidebarCompanion onAction={onClose} />

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
