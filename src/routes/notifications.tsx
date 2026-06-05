import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

type N = { id: string; title: string; body: string; created_at: string; target_user_id: string | null };

function NotificationsPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<N[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(true);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  const load = async () => {
    if (!user) return;
    setBusy(true);
    const [{ data: notifs }, { data: reads }] = await Promise.all([
      (supabase.from("notifications" as any) as any).select("*").order("created_at", { ascending: false }),
      (supabase.from("notification_reads" as any) as any).select("notification_id").eq("user_id", user.id),
    ]);
    setItems((notifs as N[]) || []);
    setReadIds(new Set(((reads as any[]) || []).map((r) => r.notification_id)));
    setBusy(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase.channel(`np-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const markAll = async () => {
    if (!user) return;
    const unread = items.filter((n) => !readIds.has(n.id));
    if (!unread.length) return;
    await (supabase.from("notification_reads" as any) as any).insert(
      unread.map((n) => ({ notification_id: n.id, user_id: user.id }))
    );
    setReadIds(new Set(items.map((n) => n.id)));
  };

  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
              <Bell className="h-3.5 w-3.5" /> Inbox
            </div>
            <h1 className="font-heading text-3xl font-bold mt-1">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard"><Button variant="outline" size="sm">Back</Button></Link>
            {unreadCount > 0 && (
              <Button size="sm" onClick={markAll}><CheckCheck className="h-4 w-4 mr-1" /> Mark all read</Button>
            )}
          </div>
        </div>

        {busy ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">Updates from the TRINETRA team will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n, i) => {
              const isUnread = !readIds.has(n.id);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-5 transition-colors ${isUnread ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${isUnread ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{n.title}</h3>
                        {isUnread && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">New</span>}
                        {n.target_user_id === null && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Broadcast</span>}
                      </div>
                      <p className="text-sm mt-2 whitespace-pre-wrap text-foreground/90">{n.body}</p>
                      <div className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
