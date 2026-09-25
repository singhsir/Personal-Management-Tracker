import { Link } from "react-router-dom";
import {
  Sparkles,
  Utensils,
  ChevronRight,
  Target,
  BarChart2,
  Sprout,
  Info,
} from "lucide-react";

export default function AIMoneyCoach() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#042d2f] text-teal-300 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 fill-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">AI Money Coach</h2>
              <p className="text-xs text-slate-500 font-medium">Personalized insights from your spending</p>
            </div>
          </div>

          <Link
            to="/insights"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
          >
            <span>See All Insights</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Featured Alert Box (Peach/Coral Tint) */}
        <div className="p-4 rounded-2xl bg-[#fff5f2] border border-rose-100/80 mb-5 flex items-start justify-between gap-3 group cursor-pointer hover:border-rose-200 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
                Food is your largest spending category this month.
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 font-normal">
                You've spent <span className="font-bold text-rose-600">₹10,250</span> on food, which is{" "}
                <span className="font-semibold text-slate-900">35.8%</span> of your total expenses.
              </p>
            </div>
          </div>
          <div className="text-slate-400 group-hover:text-slate-600 transition-colors pt-2">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Suggested For You Subtitle */}
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Suggested for you
        </h3>

        {/* 3 Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
              <Target className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-700 font-medium leading-tight">
              Consider setting a monthly budget for dining out.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all">
            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-700 font-medium leading-tight">
              Your savings rate is great! Keep it above 50%.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <Sprout className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-slate-700 font-medium leading-tight">
              You could save more by reducing subscription costs.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>These insights are informational and not financial advice.</span>
      </div>
    </div>
  );
}
