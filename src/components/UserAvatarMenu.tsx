import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Settings, LogOut, Moon, Sun, Shield } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function UserAvatarMenu() {
  const { user, profile, signOut } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Compute display name and initial dynamically
  const fullName =
    profile?.full_name?.trim() ||
    (user?.user_metadata?.full_name as string)?.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  // First letter of the name (uppercase)
  const userInitial = fullName.charAt(0).toUpperCase() || "U";
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || undefined;
  const email = user?.email || `${fullName.toLowerCase().replace(/\s+/g, "")}@finwise.ai`;

  const handleLogout = async () => {
    setOpen(false);
    try {
      await signOut();
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        title={`Logged in as ${fullName}`}
        aria-label="User profile menu"
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:bg-[#082226] dark:hover:bg-[#0c2c31] dark:border-[#103e45] flex items-center justify-center font-bold text-sm text-slate-800 dark:text-teal-300 shadow-sm transition-all overflow-hidden select-none active:scale-95"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback to initial if image fails
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-extrabold">{userInitial}</span>
        )}
      </button>

      {/* Profile Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-[#08262a] border border-slate-200 dark:border-[#103e45] rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100">
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-100 dark:border-[#103e45] bg-slate-50/60 dark:bg-[#051c20]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-600 dark:bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {fullName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {email}
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                Verified Account
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 space-y-1">
            {/* Theme Toggle option */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0c2f34] rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
                <span>Theme</span>
              </div>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>

            {/* Settings link */}
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0c2f34] rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Account Settings</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
