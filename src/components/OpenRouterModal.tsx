import { useState, useEffect } from "react";
import {
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getOpenRouterKey,
  saveOpenRouterKey,
  getOpenRouterModel,
  saveOpenRouterModel,
  testOpenRouterKey,
  sanitizeKey,
  POPULAR_MODELS,
} from "@/lib/openrouter";

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export default function OpenRouterModal({ isOpen, onClose, onKeySaved }: OpenRouterModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(getOpenRouterModel());
  const [customModel, setCustomModel] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getOpenRouterKey();
      setApiKey(current);
      const model = getOpenRouterModel();
      if (POPULAR_MODELS.some((m) => m.id === model)) {
        setSelectedModel(model);
        setIsCustom(false);
      } else {
        setSelectedModel("__custom__");
        setCustomModel(model);
        setIsCustom(true);
      }
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    const cleanKey = sanitizeKey(apiKey);
    if (!cleanKey) {
      setTestResult({
        success: false,
        message: "Please enter a valid OpenRouter API key (starts with sk-or-...).",
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testOpenRouterKey(cleanKey);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = sanitizeKey(apiKey);
    if (!cleanKey && apiKey.trim()) {
      setTestResult({
        success: false,
        message: "Key format invalid. OpenRouter keys start with sk-or- and are at least 15 characters long.",
      });
      return;
    }
    saveOpenRouterKey(cleanKey);
    setApiKey(cleanKey);

    const modelToSave = isCustom ? customModel.trim() || selectedModel : selectedModel;
    saveOpenRouterModel(modelToSave);

    setSavedSuccess(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-[#0e3b42] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Custom OpenRouter Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optional: FinWise AI runs automatically via the backend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0c3137] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 text-xs text-teal-800 dark:text-teal-300">
            FinWise AI is already configured and active for all users via the backend. You only need to add a key here if you want to use your own personal OpenRouter credits or custom models.
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Personal API Key (Optional)
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showKey ? "text" : "password"}
                placeholder="Leave blank to use default backend AI"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                className="input-field pl-9 pr-10 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Leave blank to automatically use the backend AI without personal credits.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              AI Model
            </label>
            {!isCustom ? (
              <select
                value={selectedModel}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustom(true);
                    setCustomModel("");
                  } else {
                    setSelectedModel(e.target.value);
                  }
                }}
                className="input-field text-xs cursor-pointer"
              >
                {POPULAR_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="__custom__">+ Enter custom model ID...</option>
              </select>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="e.g. mistralai/mistral-small"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="input-field text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                >
                  ← Choose from recommended models
                </button>
              </div>
            )}
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !apiKey}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{testing ? "Testing..." : "Test Key"}</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Save & Connect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
