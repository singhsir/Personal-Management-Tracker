import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, User, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import GoogleAuthModal from "@/components/GoogleAuthModal";
import ThemeToggle from "@/components/ThemeToggle";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const validate = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Create account - NO verification step required, user goes straight into dashboard
      await signUp(email, password, fullName.trim());
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("An account with this email already exists. Try signing in instead.");
      } else if (msg.includes("weak_password") || msg.includes("easy to guess")) {
        setError("Please choose a stronger password (at least 6 characters with mixed characters).");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign Up (opens instant Google account selector)
  const handleGoogleSignUp = () => {
    setError(null);
    setShowGoogleModal(true);
  };

  const handleSelectGoogleAccount = async (account: {
    name: string;
    email: string;
    avatarUrl?: string;
  }) => {
    setShowGoogleModal(false);
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle(account);
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-up failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row transition-colors">
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectGoogleAccount={handleSelectGoogleAccount}
        defaultEmail={email}
      />

      {/* Left brand panel */}
      <div className="lg:w-1/2 bg-teal-700 dark:bg-[#032327] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-800/40 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">FinWise AI</span>
        </div>

        <div className="relative z-10 my-12 lg:my-0">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Start your financial journey.
          </h1>
          <p className="text-teal-100 dark:text-teal-200/80 text-lg leading-relaxed max-w-md">
            Create an account and let AI help you understand where your money goes. Instant access without email verification hassle.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-6 text-sm text-teal-100 dark:text-teal-200/70">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            Instant account access
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            AI-powered insights
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            Dark & light mode
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-[#041a1d] transition-colors relative min-h-screen lg:min-h-0">
        {/* Dark/Light mode toggle switch on signup panel */}
        <div className="absolute top-5 right-5 z-20">
          <ThemeToggle variant="pill" />
        </div>

        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="bg-teal-600 rounded-xl p-2 text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FinWise AI</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Get started with FinWise AI in seconds.</p>

          {/* Google Sign Up */}
          <button
            type="button"
            id="google-signup-button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-[#103e45] rounded-xl bg-white dark:bg-[#082226] hover:bg-gray-50 dark:hover:bg-[#0c2c31] text-gray-700 dark:text-gray-200 font-medium text-sm shadow-sm transition-all hover:border-gray-400 active:scale-[0.99] disabled:opacity-60 mb-5 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>Sign up with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#0e3b42]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 dark:bg-[#041a1d] px-2.5 text-gray-500 dark:text-gray-400 font-medium">
                Or register with email
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl p-3.5 mb-5 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="signup-name-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="signup-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="signup-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="signup-confirm-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              id="signup-submit-button"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
