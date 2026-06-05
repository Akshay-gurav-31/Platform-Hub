import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

type N = { id: string; title: string; body: string; created_at: string; target_user_id: string | null };

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [popup, setPopup] = useState<N | null>(null);
  const sessionKey = user ? `notif-popup-shown-${user.id}` : "";
  const dropRef = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    if (!user) return;
    const [{ data: notifs }, { data: reads }] = await Promise.all([
      (supabase.from("notifications" as any) as any).select("*").order("created_at", { ascending: false }).limit(50),
      (supabase.from("notification_reads" as any) as any).select("notification_id").eq("user_id", user.id),
    ]);
    setItems((notifs as N[]) || []);
    setReadIds(new Set(((reads as any[]) || []).map((r) => r.notification_id)));
  };

  useEffect(() => {
    if (!user) { setItems([]); setReadIds(new Set()); return; }
    refresh();
    const ch = supabase
      .channel(`notif-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload: any) => {
        const n = payload.new as N;
        if (n.target_user_id === null || n.target_user_id === user.id) {
          setItems((prev) => [n, ...prev]);
          setPopup(n);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  // One-time popup on login: show newest unread once per session
  useEffect(() => {
    if (!user || items.length === 0) return;
    if (sessionStorage.getItem(sessionKey)) return;
    const unread = items.find((n) => !readIds.has(n.id));
    if (unread) {
      setPopup(unread);
      sessionStorage.setItem(sessionKey, "1");
    }
  }, [user?.id, items.length, readIds.size]);

  // Click outside closes dropdown
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const markRead = async (id: string) => {
    if (!user || readIds.has(id)) return;
    await (supabase.from("notification_reads" as any) as any).insert({ notification_id: id, user_id: user.id });
    setReadIds((s) => new Set(s).add(id));
  };

  const markAllRead = async () => {
    if (!user) return;
    const unread = items.filter((n) => !readIds.has(n.id));
    if (!unread.length) return;
    await (supabase.from("notification_reads" as any) as any).insert(
      unread.map((n) => ({ notification_id: n.id, user_id: user.id }))
    );
    setReadIds(new Set(items.map((n) => n.id)));
  };

  if (!user) return null;
  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  return (
    <>
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative h-9 w-9 rounded-md inline-flex items-center justify-center hover:bg-accent transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-ping" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {unreadCount}
              </span>
            </>
          )}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4" /> Notifications</div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 && (
                  <div className="px-4 py-10 text-center text-xs text-muted-foreground">You're all caught up.</div>
                )}
                {items.slice(0, 8).map((n) => {
                  const isUnread = !readIds.has(n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer ${isUnread ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {isUnread && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center text-xs font-medium text-primary py-3 border-t border-border hover:bg-accent/50">
                View all notifications →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated welcome popup - portaled to body to escape navbar's backdrop-filter containing block */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {popup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
            >
              <motion.div
                initial={{ y: 80, scale: 0.85, opacity: 0, rotate: -2 }}
                animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                exit={{ y: 40, scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shrink-0"
                    >
                      <Sparkles className="h-6 w-6" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">New Notification</div>
                      <h3 className="font-heading font-bold text-lg leading-tight">{popup.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{popup.body}</p>
                    </div>
                    <button onClick={() => setPopup(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent" onClick={() => { markRead(popup.id); setPopup(null); }}>Got it</Button>
                    <Link to="/notifications" className="flex-1" onClick={() => { markRead(popup.id); setPopup(null); }}>
                      <Button size="sm" variant="outline" className="w-full">View all</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
