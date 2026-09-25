import { useState } from "react";
import { Sparkles, Loader2, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { fetchInsights } from "@/lib/api";
import type { InsightResponse } from "@/lib/types";

interface AIInsightCardProps {
  startDate: string;
  endDate: string;
  variant?: "dashboard" | "full";
}

export default function AIInsightCard({ startDate, endDate, variant = "dashboard" }: AIInsightCardProps) {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchInsights(startDate, endDate);
      setInsight(result);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "dashboard") {
    return (
      <div className="card p-5 bg-gradient-to-br from-teal-50 to-white border-teal-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-teal-600 rounded-lg p-1.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-teal-800">AI Money Insight</span>
        </div>

        {!hasGenerated && !loading && (
          <div>
            <p className="text-gray-600 text-sm mb-4">"Your spending pattern at a glance"</p>
            <button onClick={handleGenerate} className="btn-primary text-sm">
              Generate Insights
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-teal-700 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI is analyzing your spending...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {insight && !loading && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-gray-900 font-medium text-sm leading-relaxed">{insight.headline}</p>
            {insight.summary && <p className="text-gray-600 text-xs leading-relaxed">{insight.summary}</p>}
            {insight.areas_to_review.length > 0 && (
              <ul className="space-y-1.5">
                {insight.areas_to_review.slice(0, 2).map((area, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    {area}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={handleGenerate} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              Refresh insight
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {!hasGenerated && !loading && !error && (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for your insights</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Click below to let AI analyze your spending patterns for the selected period.
          </p>
          <button onClick={handleGenerate} className="btn-primary inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate AI Insights
          </button>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">AI is analyzing your spending...</p>
        </div>
      )}

      {error && (
        <div className="card p-6 border-red-200">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-1">Couldn't generate insights</p>
              <p className="text-xs text-red-600">{error}</p>
              <button onClick={handleGenerate} className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium">
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {insight && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Headline */}
          <div className="card p-6 bg-gradient-to-br from-teal-50 to-white border-teal-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">AI Insight</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{insight.headline}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{insight.summary}</p>
          </div>

          {/* Observations */}
          {insight.observations.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Observations</h3>
              </div>
              <ul className="space-y-3">
                {insight.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-1.5" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to Review */}
          {insight.areas_to_review.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Areas to Review</h3>
              </div>
              <ul className="space-y-3">
                {insight.areas_to_review.map((area, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center">
            <button onClick={handleGenerate} className="btn-secondary text-sm inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Regenerate Insights
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            AI observations are not financial advice. They reflect patterns in your spending data.
          </p>
        </div>
      )}
    </div>
  );
}
