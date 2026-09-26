import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Check,
  Loader2,
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { CURRENCIES } from "@/lib/types";
import {
  getOpenRouterKey,
  saveOpenRouterKey,
  getOpenRouterModel,
  saveOpenRouterModel,
  testOpenRouterKey,
  POPULAR_MODELS,
} from "@/lib/openrouter";

export default function Settings() {
  const { user, profile, updateProfile } = useAuthContext();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [currency, setCurrency] = useState(profile?.currency || "INR");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OpenRouter Settings State
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(getOpenRouterModel());
  const [customModel, setCustomModel] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [aiSaved, setAiSaved] = useState(false);

  useEffect(() => {
    const current = getOpenRouterKey();
    setApiKey(current);
    const m = getOpenRouterModel();
    if (POPULAR_MODELS.some((item) => item.id === m)) {
      setModel(m);
      setIsCustom(false);
    } else {
      setModel("__custom__");
      setCustomModel(m);
      setIsCustom(true);
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      await updateProfile({ full_name: fullName.trim(), currency });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setAiTestResult({ success: false, message: "Please provide an API key to test." });
      return;
    }
    setTestingAi(true);
    setAiTestResult(null);
    const result = await testOpenRouterKey(apiKey.trim());
    setTestingAi(false);
    setAiTestResult(result);
  };

  const handleSaveAi = (e: React.FormEvent) => {
    e.preventDefault();
    saveOpenRouterKey(apiKey.trim());
    const modelToSave = isCustom ? customModel.trim() || model : model;
    saveOpenRouterModel(modelToSave);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1 text-xs">
          Manage your account profile and AI Money Companion credentials
        </p>
      </div>

      {/* Account info */}
      <div className="card p-6">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0c3137] text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged in Email</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.email || "Active User"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* OpenRouter AI Integration */}
      <div className="card p-6 space-y-5 border-teal-200/60 dark:border-teal-900/60 bg-gradient-to-br from-white via-white to-teal-50/20 dark:from-[#072428] dark:to-[#093238]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">OpenRouter AI Companion</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your OpenRouter key to power real-time AI money coaching
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              apiKey
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
            }`}
          >
            {apiKey ? "Connected" : "Not Set"}
          </span>
        </div>

        <form onSubmit={handleSaveAi} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                OpenRouter API Key
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Get an OpenRouter key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showKey ? "text" : "password"}
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setAiTestResult(null);
                }}
                className="input-field pl-10 pr-10 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Your key is saved in client storage and sent directly to OpenRouter without intermediaries.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              AI Model
            </label>
            {!isCustom ? (
              <select
                value={model}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustom(true);
                    setCustomModel("");
                  } else {
                    setModel(e.target.value);
                  }
                }}
                className="input-field text-xs cursor-pointer"
              >
                {POPULAR_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="__custom__">+ Custom Model ID...</option>
              </select>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="input-field text-xs"
                />
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                >
                  ← Choose from preset list
                </button>
              </div>
            )}
          </div>

          {/* Test results banner */}
          {aiTestResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                aiTestResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
              }`}
            >
              {aiTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{aiTestResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testingAi || !apiKey}
              className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {testingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{testingAi ? "Testing..." : "Test Connection"}</span>
            </button>

            <button
              type="submit"
              className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <span>Save AI Key</span>
            </button>

            {aiSaved && (
              <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Editable profile settings */}
      <form onSubmit={handleSaveProfile} className="card p-6 space-y-5">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white">Profile Preferences</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field pl-10 text-xs"
              placeholder="Your name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-field text-xs cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.label} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
