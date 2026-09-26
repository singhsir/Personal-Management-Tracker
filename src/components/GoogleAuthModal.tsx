import { useState } from "react";
import { X, ArrowRight, ShieldCheck, Mail, User } from "lucide-react";

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
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState(defaultEmail || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid Google email address.");
      return;
    }
    const cleanName = googleName.trim() || cleanEmail.split("@")[0];
    onSelectGoogleAccount({
      name: cleanName,
      email: cleanEmail,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#072428] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#0e3b42] w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-[#0e3b42] flex items-center justify-between">
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
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Sign in with Google</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Continue directly with your Google account</p>
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
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Google Account Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Google Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={googleEmail}
                  onChange={(e) => {
                    setGoogleEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                id="google-continue-button"
                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Security guarantee */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#0e3b42] flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant sign-in • No separate verification required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
