import { Menu } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationPopover from "./NotificationPopover";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, profile } = useAuthContext();

  const fullName =
    profile?.full_name?.trim() ||
    (user?.user_metadata?.full_name as string)?.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const userInitial = fullName.charAt(0).toUpperCase() || "U";
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || undefined;

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white/90 dark:bg-[#041a1d]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#0e3b42] transition-colors">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#093238]"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-slate-900 dark:text-white text-sm">FinWise AI</span>

        <div className="flex items-center gap-2">
          <ThemeToggle className="w-8 h-8 rounded-lg" />
          <NotificationPopover />

          <div
            title={`Logged in as ${fullName}`}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#082226] border border-slate-200 dark:border-[#103e45] flex items-center justify-center font-bold text-xs text-slate-800 dark:text-teal-300 overflow-hidden shadow-sm"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
