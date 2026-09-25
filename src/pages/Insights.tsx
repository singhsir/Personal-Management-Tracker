import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AIInsightCard from "@/components/AIInsightCard";
import { getMonthLabel } from "@/lib/calculations";

export default function Insights() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const dateRange = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, [selectedYear, selectedMonth]);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Money, Explained.</h1>
        <p className="text-gray-500 mt-1">AI-powered observations based on your actual spending.</p>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={goToPrevMonth} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-700 min-w-[160px] text-center">
          {getMonthLabel(selectedYear, selectedMonth)}
        </span>
        <button onClick={goToNextMonth} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* AI Insights */}
      <AIInsightCard startDate={dateRange.start} endDate={dateRange.end} variant="full" />
    </div>
  );
}
