import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmRequired, setConfirmRequired] = useState(false);

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
    setConfirmRequired(false);

    try {
      const result = await signUp(email, password, fullName.trim());
      // If email confirmation is required, there's a user but no session
      if (result.user && !result.session) {
        setConfirmRequired(true);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("An account with this email already exists. Try signing in instead.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="lg:w-1/2 bg-teal-700 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
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
          <p className="text-teal-100 text-lg leading-relaxed max-w-md">
            Create an account and let AI help you understand where your money goes.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-6 text-sm text-teal-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            Secure & private
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-300 rounded-full" />
            AI-powered insights
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="bg-teal-600 rounded-xl p-2 text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">FinWise AI</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-500 mb-8">Get started with FinWise AI in seconds.</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-5 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {confirmRequired && (
            <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl p-4 mb-5 animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Account created! Please check your email.</p>
                <p className="text-xs text-teal-700 mt-1">
                  We've sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then sign in.
                </p>
                <Link to="/login" className="inline-block mt-2 text-sm text-teal-700 font-medium hover:text-teal-800 transition-colors">
                  Go to sign in →
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
