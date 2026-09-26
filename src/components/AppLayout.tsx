import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Bot } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuthContext } from "@/context/AuthContext";
import { useAICompanion } from "@/context/AICompanionContext";
import AIMoneyCompanionDrawer from "./AIMoneyCompanionDrawer";

export default function AppLayout() {
  const { user, loading } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOpen, closeAICompanion, toggleAICompanion } = useAICompanion();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading FinWise AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f1f7f7] dark:bg-[#04171a] flex transition-colors duration-200 relative">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Button (FAB) for AI Money Agent */}
      <button
        onClick={toggleAICompanion}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#00695c] hover:bg-[#004d40] text-teal-200 shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40 border-2 border-teal-300/40 group"
        title="Ask AI Money Agent"
        aria-label="Ask AI Money Agent"
      >
        <Bot className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
        <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-[#00695c] rounded-full animate-ping" />
        <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-[#00695c] rounded-full" />
      </button>

      {/* AI Money Companion Quick Drawer */}
      <AIMoneyCompanionDrawer
        open={isOpen}
        onClose={closeAICompanion}
      />
    </div>
  );
}
