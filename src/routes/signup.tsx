import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/Logo";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const nav = useNavigate();
  const [f, setF] = useState({ full_name: "", email: "", password: "", mobile: "", college: "", degree: "", branch: "", current_year: "" });
  const [loading, setLoading] = useState(false);
  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: f.email, password: f.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: f.full_name, mobile: f.mobile, college: f.college, degree: f.degree, branch: f.branch, current_year: f.current_year }
      }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Welcome to Trinetra.");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl glass rounded-3xl p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer mb-5 transition">
          ← Back to Home
        </Link>
        <Link to="/" className="flex items-center gap-3 mb-6">
          <LogoMark className="h-9 w-9" />
          <div>
            <div className="font-heading font-extrabold tracking-wider text-sm">TRINETRA</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">TECHNOLOGIES PVT. LTD.</div>
          </div>
        </Link>
        <h1 className="text-3xl font-extrabold mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">Begin your journey to becoming a certified developer.</p>
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Full Name</Label><Input required value={f.full_name} onChange={upd("full_name")} /></div>
          <div><Label>Email</Label><Input type="email" required value={f.email} onChange={upd("email")} /></div>
          <div><Label>Mobile Number</Label><Input required value={f.mobile} onChange={upd("mobile")} /></div>
          <div><Label>College Name</Label><Input required value={f.college} onChange={upd("college")} /></div>
          <div><Label>Degree</Label><Input required placeholder="B.Tech / B.E / BCA" value={f.degree} onChange={upd("degree")} /></div>
          <div><Label>Branch</Label><Input required placeholder="CSE / IT / ENTC" value={f.branch} onChange={upd("branch")} /></div>
          <div><Label>Current Year</Label><Input required placeholder="1st / 2nd / 3rd / 4th" value={f.current_year} onChange={upd("current_year")} /></div>
          <div className="md:col-span-2"><Label>Password</Label><Input type="password" required minLength={6} value={f.password} onChange={upd("password")} /></div>
          <Button type="submit" disabled={loading} className="md:col-span-2 bg-gradient-to-r from-primary to-accent">{loading ? "Creating..." : "Create Account"}</Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Already a member? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
