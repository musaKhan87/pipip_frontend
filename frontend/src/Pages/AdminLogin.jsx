import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Bike,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/AuthProvider";
import { Button } from "../components/ui/button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, user, role, hasPanelAccess, isInvestor, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is already logged in
    if (!authLoading && user && hasPanelAccess) {
      if (isInvestor || role === "investor") {
        navigate("/admin/panel/investor-orders");
      } else {
        navigate("/admin/panel");
      }
    }
  }, [user, hasPanelAccess, isInvestor, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter your registered email and password");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back to Operations Console!");
    } catch (err) {
      setError("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/60 overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-300/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] rounded-3xl overflow-hidden text-slate-900">
          {/* Card Top Decorative Gradient Border Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-400" />

          <CardHeader className="text-center pb-4 pt-7 px-6">
            {/* Top Live Badge */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PIPIP FLEET TELEMETRY
              </span>
            </div>

            {/* Branded Logo Badge */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white">
                  <Bike className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <CardTitle className="text-2xl font-black font-display tracking-tight text-slate-900">
              Operations Control
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1.5 font-normal max-w-xs mx-auto">
              Sign in to manage live hub rentals, fleet allocation, and customer dispatches across Mumbai, Thane & Surat.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-7 pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="login-email"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Admin Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="operator@pipip.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-blue-500/20 text-xs sm:text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="login-password"
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter security key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-11 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-blue-500/20 text-xs sm:text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 font-black text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authorizing Session...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Operations Desk</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Back to Site Link */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] font-medium text-slate-400">
                Authorized Personnel Only
              </span>
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Back to Pipip Website</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
