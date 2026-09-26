import { useState } from "react";
import { X, ArrowRight, ShieldCheck, User } from "lucide-react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGoogleAccount: (account: { name: string; email: string; avatarUrl?: string }) => void;
  defaultEmail?: string;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectGoogleAccount,
  defaultEmail = "",
}: GoogleAuthModalProps) {
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState(defaultEmail || "");
  const [customError, setCustomError] = useState("");

  if (!isOpen) return null;

  const quickAccounts = [
    {
      name: "Jaggan",
      email: "jaggan@finwise.ai",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Jagannath",
      email: "jagannath.finance@gmail.com",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setCustomError("Please enter a valid Google email address.");
      return;
    }
    const name = customName.trim() || customEmail.split("@")[0];
    onSelectGoogleAccount({
      name,
      email: customEmail.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Google Icon */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Sign in with Google</h3>
              <p className="text-xs text-gray-500">Choose an account to continue to FinWise AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!useCustom ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Available Google Accounts
              </p>
              {quickAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => onSelectGoogleAccount(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-teal-900">
                        {acc.name}
                      </div>
                      <div className="text-xs text-gray-500">{acc.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => setUseCustom(true)}
                  className="w-full py-2.5 px-4 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2 border border-dashed border-gray-300"
                >
                  <User className="w-3.5 h-3.5" />
                  Use another Google account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Google Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    setCustomError("");
                  }}
                  required
                  className="input-field text-sm"
                />
              </div>

              {customError && (
                <p className="text-xs text-red-600">{customError}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUseCustom(false)}
                  className="flex-1 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  Continue with Google
                </button>
              </div>
            </form>
          )}

          {/* Security guarantee */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant sign-in • No separate verification required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
