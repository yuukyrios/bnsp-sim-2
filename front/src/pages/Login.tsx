import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api/authApi";
import { isAuthenticated, setAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  username: z.string().trim().min(1, "Required"),
  password: z.string().min(1, "Required"),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { username: "", password: "" } });

  useEffect(() => {
    if (isAuthenticated()) navigate("/", { replace: true });
  }, [navigate]);

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      const res = await login(values.username, values.password);
      if (!res.success) throw new Error(res.message || "Login failed");
      setAuth(res.token, res.user);
      toast({ title: "Welcome back", description: `Logged in as ${res.user.username}` });
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center mb-3">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">CargoMoms Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage deliveries</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" autoComplete="username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}