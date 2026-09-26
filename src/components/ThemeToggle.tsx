import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "button" | "pill";
}

export default function ThemeToggle({ className = "", variant = "button" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
          isDark
            ? "bg-[#082226] border-[#103e45] text-amber-300 hover:bg-[#0c2c31]"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-slate-600" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
        isDark
          ? "bg-[#082226] hover:bg-[#0c2c31] border border-[#103e45] text-amber-300"
          : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600"
      } ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
    </button>
  );
}
