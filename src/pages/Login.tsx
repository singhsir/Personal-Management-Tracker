import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Wallet,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import GoogleAuthModal from "@/components/GoogleAuthModal";
import ThemeToggle from "@/components/ThemeToggle";

type AuthMode = "login" | "forgot_send" | "forgot_verify" | "forgot_success";

export default function Login({ initialMode }: { initialMode?: AuthMode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    signIn,
    signInWithGoogle,
    signInWithDemo,
    sendPasswordResetCode,
    resetPasswordWithCode,
  } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>(() => {
    if (initialMode) return initialMode;
    if (searchParams.get("mode") === "forgot") return "forgot_send";
    return "login";
  });

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot / Reset Password state
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Countdown timer for resending verification code
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle standard email/password sign-in (NO Google verification needed)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      if (
        msg.includes("Invalid login credentials") ||
        msg.includes("invalid_credentials")
      ) {
        setError("Incorrect email or password. Please verify your credentials or reset your password.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In (opens instant Google account selector)
  const handleGoogleSignIn = () => {
    setError(null);
    setShowGoogleModal(true);
  };

  // Handle account selection from Google modal
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
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send verification code to email
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError("Please enter your account email or login ID.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await sendPasswordResetCode(resetEmail);
      if (res.code) {
        setGeneratedCode(res.code);
      }
      setResendCountdown(30);
      setMode("forgot_verify");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and save new password
  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithCode(resetEmail, verificationCode.trim(), newPassword);
      setResetSuccessMessage("Password reset successfully!");
      setMode("forgot_success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setError(null);
    try {
      const res = await sendPasswordResetCode(resetEmail);
      if (res.code) {
        setGeneratedCode(res.code);
      }
      setResendCountdown(30);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resend code";
      setError(msg);
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
            Take control of your money.
          </h1>
          <p className="text-teal-100 dark:text-teal-200/80 text-lg leading-relaxed max-w-md">
            Understand your spending, discover patterns, and make better financial decisions.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-6 text-sm text-teal-100 dark:text-teal-200/70">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            AI-powered insights
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            Smart categorization
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            Dark & light mode
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-[#041a1d] transition-colors relative min-h-screen lg:min-h-0">
        {/* Dark/Light mode toggle switch on login panel */}
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

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl p-3.5 mb-5 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* ================= MODE: LOGIN ================= */}
          {mode === "login" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to your account to continue.</p>

              {/* Google Sign In Option */}
              <button
                type="button"
                id="google-signin-button"
                onClick={handleGoogleSignIn}
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
                <span>Continue with Google</span>
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-[#0e3b42]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 dark:bg-[#041a1d] px-2.5 text-gray-500 dark:text-gray-400 font-medium">
                    Or sign in with email
                  </span>
                </div>
              </div>

              {/* Standard Email/Password Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email / Login ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="login-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <button
                      type="button"
                      id="forgot-password-link"
                      onClick={() => {
                        setError(null);
                        setResetEmail(email);
                        setMode("forgot_send");
                      }}
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="login-password-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="input-field pl-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="login-submit-button"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Signing in..." : "Sign in"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Demo Account quick access */}
              <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-[#0e3b42]">
                <button
                  type="button"
                  onClick={() => {
                    signInWithDemo();
                    navigate("/dashboard");
                  }}
                  className="w-full py-2 px-3 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/40 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 border border-teal-200/50 dark:border-teal-800/50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Continue as Demo User (Jaggan)
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-teal-600 dark:text-teal-400 font-medium hover:text-teal-700 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}

          {/* ================= MODE: FORGOT PASSWORD - STEP 1 (SEND CODE) ================= */}
          {mode === "forgot_send" && (
            <div className="animate-fade-in">
              <div className="w-11 h-11 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-center text-teal-700 dark:text-teal-300 mb-4">
                <KeyRound className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset password</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                Enter your account email. We'll send a 6-digit verification code to verify your identity.
              </p>

              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Account Email / Login ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="reset-email-input"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="send-reset-code-button"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode("login");
                  }}
                  className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors py-2"
                >
                  Back to Sign in
                </button>
              </form>
            </div>
          )}

          {/* ================= MODE: FORGOT PASSWORD - STEP 2 (VERIFY CODE & SET NEW PASSWORD) ================= */}
          {mode === "forgot_verify" && (
            <div className="animate-fade-in">
              <div className="w-11 h-11 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-center text-teal-700 dark:text-teal-300 mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Verification Code</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{resetEmail}</span>
              </p>

              {/* Instant Verification Code Highlight Banner */}
              {generatedCode && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                      Verification Code Generated
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Your verification code is:{" "}
                      <span className="font-mono font-bold tracking-widest text-emerald-950 dark:text-emerald-100 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-sm select-all">
                        {generatedCode}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(generatedCode)}
                      className="mt-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 underline cursor-pointer"
                    >
                      Click to auto-fill code
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCountdown > 0}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 disabled:text-gray-400 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : "Resend code"}
                    </button>
                  </div>
                  <input
                    type="text"
                    id="verification-code-input"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                    placeholder="e.g. 123456"
                    className="input-field text-center font-mono text-lg tracking-[0.3em] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new-password-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      className="input-field pl-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="confirm-new-password-input"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="Repeat new password"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="reset-password-submit-button"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Verifying..." : "Verify & Reset Password"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode("forgot_send");
                    }}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode("login");
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium"
                  >
                    Back to Sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= MODE: FORGOT PASSWORD - STEP 3 (SUCCESS) ================= */}
          {mode === "forgot_success" && (
            <div className="animate-fade-in text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed max-w-xs mx-auto">
                {resetSuccessMessage || "Your password has been successfully updated. You can now sign in with your new credentials."}
              </p>

              <button
                type="button"
                id="back-to-signin-success-button"
                onClick={() => {
                  setEmail(resetEmail);
                  setPassword(newPassword);
                  setMode("login");
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Sign in with New Password
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
