import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MessageCircle, Phone, Briefcase, Info, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequestChat } from "@/components/RequestChat";

export const Route = createFileRoute("/contact")({ component: ContactPage });

const TYPES = [
  { value: "project", label: "Custom Project Request", icon: Briefcase },
  { value: "information", label: "More Information", icon: Info },
  { value: "email", label: "Email Support", icon: Mail },
  { value: "chat", label: "Chat / Mentorship", icon: MessageCircle },
  { value: "other", label: "Other", icon: Phone },
];

function ContactPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [type, setType] = useState("project");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pref, setPref] = useState("email");
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const loadMyRequests = async (uid: string) => {
    const { data } = await (supabase.from("contact_requests" as any) as any)
      .select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setMyRequests((data as any[]) || []);
  };

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (user) {
      setEmail(user.email || "");
      supabase.from("profiles").select("full_name, mobile").eq("id", user.id).single()
        .then(({ data }) => { setName((data as any)?.full_name || ""); setPhone((data as any)?.mobile || ""); });
      loadMyRequests(user.id);

      const ch = supabase.channel(`cr-user-${user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "contact_requests", filter: `user_id=eq.${user.id}` },
          () => loadMyRequests(user.id))
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (subject.trim().length < 3 || message.trim().length < 10) return toast.error("Please fill subject and a detailed message");
    setSubmitting(true);
    const { error } = await supabase.from("contact_requests" as any).insert({
      user_id: user.id, full_name: name, email, phone,
      request_type: type, subject, message, preferred_contact: pref,
    } as any);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Request submitted! Our team will reach out soon.");
    setSubject(""); setMessage("");
    loadMyRequests(user.id);
  };

  const statusColor = (s: string) =>
    s === "resolved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
    : s === "in_progress" ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
    : s === "closed" ? "bg-muted text-muted-foreground"
    : "bg-primary/10 text-primary border-primary/30";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-4xl font-bold">Contact Our Team</h1>
          <p className="text-muted-foreground mt-2">Need a custom project, mentorship, or have a question? Tell us how we can help.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-3 mb-8">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.value;
            return (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`cursor-pointer rounded-xl border p-4 text-center transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <Icon className={`h-5 w-5 mx-auto mb-2 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-xs font-medium">{t.label}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Preferred Contact</label>
              <select value={pref} onChange={(e) => setPref(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="chat">Chat</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={150}
              placeholder="e.g. I need a MERN e-commerce project" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Describe your request</label>
            <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={3000}
              placeholder="Share details: requirements, deadline, tech stack, budget if any..." />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-accent">
            {submitting ? "Submitting..." : "Send Request"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            You can also <Link to="/feedback" className="text-primary underline">share feedback</Link> about your experience.
          </p>
        </form>

        <section className="mt-14">
          <div className="flex items-center gap-2 mb-4">
            <Inbox className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-2xl font-bold">My Requests</h2>
            <Badge variant="outline" className="ml-2">{myRequests.length}</Badge>
          </div>
          {myRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-8 text-center">
              You haven't sent any requests yet. Submit one above and chat with our team here.
            </p>
          ) : (
            <div className="space-y-3">
              {myRequests.map((r) => {
                const open = openId === r.id;
                return (
                  <div key={r.id} className="rounded-xl border border-border bg-card">
                    <button onClick={() => setOpenId(open ? null : r.id)}
                      className="w-full flex items-start justify-between gap-3 p-5 text-left cursor-pointer hover:bg-muted/30 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="outline" className="text-[10px]">{r.request_type}</Badge>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                            {r.status.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <h3 className="font-semibold truncate">{r.subject}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{r.message}</p>
                      </div>
                      {open ? <ChevronUp className="h-4 w-4 mt-1" /> : <ChevronDown className="h-4 w-4 mt-1" />}
                    </button>
                    {open && (
                      <div className="px-5 pb-5 space-y-3">
                        {r.admin_notes && (
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Note from TRINETRA Team</div>
                            {r.admin_notes}
                          </div>
                        )}
                        <RequestChat requestId={r.id} currentUserId={user!.id} asAdmin={false} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
