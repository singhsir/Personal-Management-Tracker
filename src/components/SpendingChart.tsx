import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, ChevronDown } from "lucide-react";

interface MonthlyDataPoint {
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

interface SpendingChartProps {
  data?: MonthlyDataPoint[];
  currency?: string;
}

const DEFAULT_PULSE_DATA: MonthlyDataPoint[] = [
  { label: "Apr 26", income: 62000, expenses: 21000, savings: 41000 },
  { label: "May 26", income: 68000, expenses: 23500, savings: 44500 },
  { label: "Jun 26", income: 71000, expenses: 24000, savings: 47000 },
  { label: "Jul 26", income: 75000, expenses: 26000, savings: 49000 },
  { label: "Aug 26", income: 78000, expenses: 27200, savings: 50800 },
  { label: "Sep 26", income: 85000, expenses: 28599, savings: 56401 },
];

export default function SpendingChart({
  data = DEFAULT_PULSE_DATA,
  currency = "INR",
}: SpendingChartProps) {
  const formatYAxis = (val: number) => {
    if (val === 0) return "0";
    return `${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Money Pulse</h2>
            <p className="text-xs text-slate-500 font-medium">Income, expenses and savings trend</p>
          </div>
        </div>

        {/* Time Selector */}
        <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all">
          <span>Last 6 months</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100000]}
              ticks={[0, 25000, 50000, 75000, 100000]}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "",
              ]}
              contentStyle={{
                backgroundColor: "#042d2f",
                borderRadius: "12px",
                border: "none",
                color: "#ffffff",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ fontWeight: "bold", color: "#2dd4bf", marginBottom: "4px" }}
            />
            <Bar dataKey="income" name="Income" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="savings" name="Savings" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
          <span>Expenses</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]" />
          <span>Savings</span>
        </div>
      </div>
    </div>
  );
}
