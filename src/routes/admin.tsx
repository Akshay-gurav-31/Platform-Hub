import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ShieldCheck, Users, MessageSquare, Inbox, GraduationCap, Award, Loader2, Bell, Send } from "lucide-react";
import { RequestChat } from "@/components/RequestChat";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({ component: AdminPanel });

function AdminPanel() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [nTarget, setNTarget] = useState<string>(""); // "" = everyone
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase.rpc as any)("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    })();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [fb, cr, pr, at, ce, nt] = await Promise.all([
        (supabase.from("feedback" as any) as any).select("*").order("created_at", { ascending: false }),
        (supabase.from("contact_requests" as any) as any).select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("test_attempts").select("*").order("created_at", { ascending: false }),
        supabase.from("certificates").select("*").order("issued_at", { ascending: false }),
        (supabase.from("notifications" as any) as any).select("*").order("created_at", { ascending: false }),
      ]);
      setFeedback(fb.data || []); setRequests(cr.data || []);
      setProfiles(pr.data || []); setAttempts(at.data || []); setCerts(ce.data || []);
      setNotifs(nt.data || []);
    })();
  }, [isAdmin]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-md text-center rounded-2xl border border-border bg-card p-10">
            <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="font-heading text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This area is restricted to TRINETRA administrators. Sign in with an admin account or
              ask the founder to grant you the <code className="bg-muted px-1.5 py-0.5 rounded">admin</code> role.
            </p>
            <Button onClick={() => nav({ to: "/dashboard" })} variant="outline">Back to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const updateRequest = async (id: string, patch: any) => {
    const { error } = await (supabase.from("contact_requests" as any) as any).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setRequests((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
    toast.success("Updated");
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await (supabase.from("feedback" as any) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setFeedback((r) => r.filter((x) => x.id !== id));
  };

  const sendNotification = async () => {
    if (!nTitle.trim()) return toast.error("Title is required");
    setSending(true);
    const payload = {
      title: nTitle.trim(),
      body: nBody.trim(),
      target_user_id: nTarget || null,
      created_by: user!.id,
    };
    const { data, error } = await (supabase.from("notifications" as any) as any).insert(payload).select().single();
    setSending(false);
    if (error) return toast.error(error.message);
    setNotifs((n) => [data, ...n]);
    setNTitle(""); setNBody(""); setNTarget("");
    toast.success(payload.target_user_id ? "Sent to student" : "Broadcast sent to everyone");
  };

  const deleteNotification = async (id: string) => {
    const { error } = await (supabase.from("notifications" as any) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    setNotifs((n) => n.filter((x) => x.id !== id));
  };

  const stats = [
    { label: "Students", value: profiles.length, icon: Users, color: "text-blue-500" },
    { label: "Feedback", value: feedback.length, icon: MessageSquare, color: "text-emerald-500" },
    { label: "Requests", value: requests.length, icon: Inbox, color: "text-amber-500" },
    { label: "Test Attempts", value: attempts.length, icon: GraduationCap, color: "text-violet-500" },
    { label: "Certificates", value: certs.length, icon: Award, color: "text-rose-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider"><ShieldCheck className="h-3.5 w-3.5" /> Admin Console</div>
            <h1 className="font-heading text-3xl font-bold mt-1">TRINETRA Admin Panel</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <Icon className={`h-5 w-5 mb-2 ${s.color}`} />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            );
          })}
        </div>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Project Requests ({requests.length})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications ({notifs.length})</TabsTrigger>
            <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
            <TabsTrigger value="students">Students ({profiles.length})</TabsTrigger>
            <TabsTrigger value="attempts">Test Attempts</TabsTrigger>
            <TabsTrigger value="certs">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6 space-y-4">
            {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.request_type}</Badge>
                      <Badge>{r.status}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <h3 className="font-semibold mt-2">{r.subject}</h3>
                    <p className="text-sm text-muted-foreground">{r.full_name} · {r.email} · {r.phone || "—"} · prefers {r.preferred_contact}</p>
                  </div>
                  <select value={r.status} onChange={(e) => updateRequest(r.id, { status: e.target.value, updated_at: new Date().toISOString() })}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-sm">
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <p className="text-sm whitespace-pre-wrap mt-2">{r.message}</p>
                <Textarea className="mt-3" placeholder="Internal note / pinned message to student..." defaultValue={r.admin_notes}
                  onBlur={(e) => e.target.value !== r.admin_notes && updateRequest(r.id, { admin_notes: e.target.value })} />
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Live Chat with {r.full_name || "Student"}</div>
                  <RequestChat requestId={r.id} currentUserId={user!.id} asAdmin={true} />
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-xl font-bold">Send Notification</h2>
              </div>
              <div className="grid gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Recipient</label>
                  <select value={nTarget} onChange={(e) => setNTarget(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background text-foreground px-3 text-sm">
                    <option value="" className="bg-background text-foreground">📢 Everyone (broadcast)</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id} className="bg-background text-foreground">{p.full_name || p.email} — {p.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Title</label>
                  <Input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="e.g. New Python test available!" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Message</label>
                  <Textarea value={nBody} onChange={(e) => setNBody(e.target.value)} placeholder="Write your message…" rows={4} className="mt-1" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={sendNotification} disabled={sending} className="bg-gradient-to-r from-primary to-accent">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Send Notification</>}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Sent Notifications</h3>
              {notifs.length === 0 && <p className="text-sm text-muted-foreground">Nothing sent yet.</p>}
              <div className="space-y-2">
                {notifs.map((n) => (
                  <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={n.target_user_id ? "outline" : "default"}>
                          {n.target_user_id ? "Direct" : "Broadcast"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <div className="font-medium mt-1">{n.title}</div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.body}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteNotification(n.id)}>Delete</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
                <TableHead>Rating</TableHead><TableHead>Message</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {feedback.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="text-xs">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm"><div>{f.full_name}</div><div className="text-xs text-muted-foreground">{f.email}</div></TableCell>
                    <TableCell><Badge variant="outline">{f.category}</Badge></TableCell>
                    <TableCell>{"★".repeat(f.rating)}</TableCell>
                    <TableCell className="max-w-md text-sm">{f.message}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteFeedback(f.id)}>Delete</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>College</TableHead>
                <TableHead>Branch</TableHead><TableHead>Year</TableHead><TableHead>Joined</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name}</TableCell>
                    <TableCell className="text-sm">{p.email}</TableCell>
                    <TableCell className="text-sm">{p.college}</TableCell>
                    <TableCell className="text-sm">{p.branch}</TableCell>
                    <TableCell className="text-sm">{p.current_year}</TableCell>
                    <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="attempts" className="mt-6">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>User</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {attempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs">{new Date(a.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-mono">{a.user_id.slice(0, 8)}…</TableCell>
                    <TableCell>{a.score}/{a.total}</TableCell>
                    <TableCell>{a.passed ? <Badge>Passed</Badge> : <Badge variant="outline">Failed</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="certs" className="mt-6">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Code</TableHead><TableHead>Recipient</TableHead><TableHead>Issued</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {certs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.cert_code}</TableCell>
                    <TableCell>{c.recipient_name}</TableCell>
                    <TableCell className="text-xs">{new Date(c.issued_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
