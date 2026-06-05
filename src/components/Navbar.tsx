import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (supabase.rpc as any)("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }: any) => setIsAdmin(!!data));
  }, [user]);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <LogoMark className="h-8 w-8" />
          <div className="leading-tight">
            <div className="font-heading font-extrabold tracking-wider text-sm">TRINETRA</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">TECHNOLOGIES PVT. LTD.</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <a href="/#programs" className="hover:text-foreground">Programs</a>
          <a href="/#about" className="hover:text-foreground">About</a>
          <Link to="/verify" className="hover:text-foreground">Verify</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <Link to="/feedback" className="hover:text-foreground">Feedback</Link>
          {isAdmin && <Link to="/admin" className="text-primary font-medium hover:underline">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link to="/dashboard"><Button size="sm" variant="ghost">Dashboard</Button></Link>
              <Button size="sm" variant="outline" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button size="sm" variant="ghost">Login</Button></Link>
              <Link to="/signup"><Button size="sm" className="bg-gradient-to-r from-primary to-accent">Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
