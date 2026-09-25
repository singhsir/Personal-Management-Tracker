import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="text-slate-700 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-slate-900 text-sm">FinWise AI</span>
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
          J
        </div>
      </div>
    </header>
  );
}
