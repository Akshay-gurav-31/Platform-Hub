import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md glass rounded-3xl p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer mb-5 transition">
          ← Back to Home
        </Link>
        <Link to="/" className="flex items-center gap-3 mb-8">
          <LogoMark className="h-9 w-9" />
          <div>
            <div className="font-heading font-extrabold tracking-wider text-sm">TRINETRA</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">TECHNOLOGIES PVT. LTD.</div>
          </div>
        </Link>
        <h1 className="text-3xl font-extrabold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in to continue your journey.</p>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>Email</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent">{loading ? "Signing in..." : "Sign In"}</Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          New here? <Link to="/signup" className="text-primary font-semibold">Create account</Link>
        </p>
      </div>
    </div>
  );
}
