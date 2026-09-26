import { Menu, Bot } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useAICompanion } from "@/context/AICompanionContext";
import ThemeToggle from "./ThemeToggle";
import NotificationPopover from "./NotificationPopover";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, profile } = useAuthContext();
  const { openAICompanion } = useAICompanion();

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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-teal-500/30 bg-[#021d1f] flex items-center justify-center p-0.5">
            <img src="/finwise-logo.png" alt="FinWise AI" className="w-full h-full object-cover object-top rounded-md" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">FinWise AI</span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Money Agent button */}
          <button
            onClick={openAICompanion}
            title="Ask AI Money Agent"
            aria-label="Ask AI Money Agent"
            className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-[#082226] dark:hover:bg-[#0c2c31] border border-teal-200 dark:border-[#103e45] text-teal-600 dark:text-teal-300 flex items-center justify-center relative shadow-xs"
          >
            <Bot className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

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
