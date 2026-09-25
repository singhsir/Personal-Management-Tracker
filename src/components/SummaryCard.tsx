import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendLabel: string;
  vsText?: string;
  accent: "emerald" | "rose" | "blue" | "amber";
  sparkColor: "green" | "red";
}

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  trend = "up",
  trendLabel,
  vsText = "vs Aug 2026",
  accent,
  sparkColor = "green",
}: SummaryCardProps) {
  const badgeStyles = {
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    rose: "bg-rose-50 text-rose-500 border border-rose-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    amber: "bg-amber-50 text-amber-600 border border-amber-100",
  }[accent];

  const isGreen = sparkColor === "green";

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${badgeStyles}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-500">{title}</span>
      </div>

      <div className="my-3">
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
          {trend === "up" ? (
            <span className="text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {trendLabel}
            </span>
          ) : (
            <span className="text-rose-500 flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {trendLabel}
            </span>
          )}
          <span className="text-slate-400 font-normal">{vsText}</span>
        </div>
      </div>

      {/* Vector Sparkline Curve */}
      <div className="w-full h-8 mt-1">
        <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
          {isGreen ? (
            <>
              <path
                d="M0,20 Q25,18 45,10 T80,12 T100,4"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0,20 Q25,18 45,10 T80,12 T100,4 L100,25 L0,25 Z"
                fill="url(#sparkGreenReact)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="sparkGreenReact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </>
          ) : (
            <>
              <path
                d="M0,10 Q25,6 50,15 T80,10 T100,18"
                fill="none"
                stroke="#f87171"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0,10 Q25,6 50,15 T80,10 T100,18 L100,25 L0,25 Z"
                fill="url(#sparkRedReact)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="sparkRedReact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
