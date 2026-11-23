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
import { Bike, Lock, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/AuthProvider";
import { Button } from "../components/ui/button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // const { signIn, user, isAdminOrStaff, loading: authLoading } = useAuth();
    const { signIn, user, role, hasPanelAccess, isInvestor, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // // Redirect if user is already logged in as admin/staff
    // if (!authLoading && user && isAdminOrStaff) {
    //   navigate("/admin/panel");
    // Redirect if user is already logged in
    if (!authLoading && user && hasPanelAccess) {
      if (isInvestor || role === "investor") {
        navigate("/admin/panel/investor-orders");
      } else {
        navigate("/admin/panel");
      }
    }
  // }, [user, isAdminOrStaff, authLoading, navigate]);
  }, [user, hasPanelAccess, isInvestor, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      toast.success("Welcome back!");
    } catch (err) {
      setError("An unexpected error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card border border-border/80 shadow-lg rounded-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
                <Bike className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Pipip Operations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Sign in to access your operations dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@pipip.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-10 font-medium cursor-pointer">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <a
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Website
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}