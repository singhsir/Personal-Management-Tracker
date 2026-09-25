import { Heart, Sparkles, TrendingUp } from "lucide-react";

interface FinancialHealthCardProps {
  score?: number;
  pointsDelta?: number;
  savingsRate?: number;
}

export default function FinancialHealthCard({
  score = 72,
  pointsDelta = 8,
  savingsRate = 66.4,
}: FinancialHealthCardProps) {
  // SVG circular gauge calculation: 2 * PI * 42 = ~263.89
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
      {/* Botanical Foliage Watermark */}
      <div className="absolute -right-4 -bottom-6 w-48 h-48 opacity-25 pointer-events-none text-emerald-600">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <path d="M120 20 C100 60 70 80 40 100 C70 110 110 100 130 80 C150 60 140 30 120 20 Z" opacity="0.8" />
          <path d="M140 70 C125 105 95 125 65 140 C95 150 135 140 150 120 C165 100 155 80 140 70 Z" opacity="0.9" />
          <path d="M100 120 C85 145 60 160 35 170 C60 180 95 175 110 160 C125 145 115 130 100 120 Z" opacity="0.7" />
          <path d="M60 180 Q110 130 150 50" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.5" />
        </svg>
      </div>

      <div>
        {/* Card Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Heart className="w-4 h-4 fill-teal-600 text-teal-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Financial Health</h2>
            <p className="text-xs text-slate-500 font-medium">A snapshot of your financial well-being</p>
          </div>
        </div>

        {/* Gauge and Description */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#e2ecea"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#healthGradientReact)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
                <defs>
                  <linearGradient id="healthGradientReact" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{score}</span>
                <span className="text-xs font-semibold text-slate-400 -mt-1">/100</span>
              </div>
            </div>

            {/* Points vs last month */}
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+{pointsDelta} points</span>
              <span className="font-normal text-slate-400 text-[10px]">vs last month</span>
            </div>
          </div>

          {/* Copy & AI Highlight Banner */}
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              You're on the right track! <span className="text-base">🎉</span>
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mt-1 font-normal">
              Your income is higher than expenses and you're maintaining a healthy savings rate of{" "}
              <span className="font-semibold text-slate-900">{savingsRate}%</span> this month.
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-[#eff9f7] border border-teal-100 flex items-start gap-2.5">
              <div className="text-teal-600 mt-0.5 flex-shrink-0">
                <Sparkles className="w-4 h-4 fill-teal-600" />
              </div>
              <p className="text-xs font-medium text-teal-900 leading-snug">
                Consistent savings and controlled spending show strong financial habits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
