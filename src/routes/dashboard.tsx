import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Award, GraduationCap, Trophy, Sparkles, ArrowRight, UserCog, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Internship = { id: string; slug: string; title: string; description: string; duration: string; skills: string[]; difficulty: string };
type Cert = { internship_id: string; cert_code: string };
type Profile = { full_name: string; college: string | null; skills: string[] | null };

const QUICK_SKILLS = ["Java","Python","JavaScript","TypeScript","C++","React","Node.js","MongoDB","SQL","AWS","Docker","Git","TensorFlow","Figma","Flutter"];

function Dashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: ints }, { data: cs }, { data: pr }] = await Promise.all([
        supabase.from("internships").select("*").order("created_at"),
        supabase.from("certificates").select("internship_id, cert_code").eq("user_id", user.id),
        supabase.from("profiles").select("full_name, college, skills").eq("id", user.id).single(),
      ]);
      setInternships(ints || []); setCerts(cs || []); setProfile(pr || null);
    })();
  }, [user]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  const certSet = new Set(certs.map(c => c.internship_id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_right,oklch(0.55_0.25_260/0.3),transparent_70%)]" />
          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-sm text-primary mb-1">Welcome back</p>
              <h1 className="text-4xl font-extrabold">{profile?.full_name || "Future Developer"}</h1>
              <p className="text-muted-foreground mt-1">{profile?.college}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="glass rounded-xl px-4 py-3"><div className="text-xs text-muted-foreground">Certificates</div><div className="text-2xl font-bold gradient-text">{certs.length}</div></div>
                <div className="glass rounded-xl px-4 py-3"><div className="text-xs text-muted-foreground">Programs</div><div className="text-2xl font-bold gradient-text">{internships.length}</div></div>
                <div className="glass rounded-xl px-4 py-3"><div className="text-xs text-muted-foreground">Status</div><div className="text-sm font-bold mt-1 gold-text">PREMIUM</div></div>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" className="cursor-pointer"><UserCog className="h-4 w-4 mr-2" /> Edit Profile</Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: GraduationCap, t: "Internships", d: "Browse all programs" },
            { icon: Award, t: "My Certificates", d: `${certs.length} earned` },
            { icon: Trophy, t: "Leaderboard", d: "Coming soon" },
          ].map((a, i) => (
            <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><a.icon className="h-6 w-6 text-white" /></div>
              <div><div className="font-bold">{a.t}</div><div className="text-xs text-muted-foreground">{a.d}</div></div>
            </div>
          ))}
        </div>

        {/* Internships */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Programs</p>
            <h2 className="text-3xl font-extrabold">Choose your <span className="gradient-text">internship</span></h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {internships.map((i) => {
            const earned = certSet.has(i.id);
            return (
              <motion.div key={i.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => nav({ to: "/internship/$slug", params: { slug: i.slug } })}
                className="glass rounded-2xl p-6 hover:border-primary/50 hover:-translate-y-1 transition group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Sparkles className="h-5 w-5 text-white" /></div>
                  <Badge variant="outline" className="text-[10px]">{i.difficulty}</Badge>
                </div>
                <h3 className="font-bold text-lg leading-tight">{i.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{i.description}</p>
                <div className="text-xs text-muted-foreground mt-3">⏱ {i.duration}</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {i.skills.slice(0, 3).map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{s}</span>)}
                </div>
                <div className="mt-5" onClick={(e) => e.stopPropagation()}>
                  {earned ? (
                    <Link to="/certificate/$slug" params={{ slug: i.slug }}>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black cursor-pointer"><Award className="h-4 w-4 mr-1" /> View Certificate</Button>
                    </Link>
                  ) : (
                    <Link to="/test/$slug" params={{ slug: i.slug }}>
                      <Button className="w-full bg-gradient-to-r from-primary to-accent cursor-pointer">Start Test <ArrowRight className="h-4 w-4 ml-1" /></Button>
                    </Link>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition text-center">Click card for full program details →</div>
              </motion.div>
            );
          })}
        </div>

        {/* Skills prompt — LinkedIn / Glassdoor style */}
        <SkillsPrompt userId={user.id} initial={profile?.skills || []} />
      </div>
      <Footer />
    </div>
  );
}

function SkillsPrompt({ userId, initial }: { userId: string; initial: string[] }) {
  const [picked, setPicked] = useState<string[]>(initial);
  const [pool, setPool] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { setPicked(initial); }, [initial]);
  useEffect(() => {
    // randomize the order of suggestions each visit
    const remaining = QUICK_SKILLS.filter(s => !initial.includes(s));
    setPool([...remaining].sort(() => Math.random() - 0.5).slice(0, 8));
  }, [initial]);

  if (dismissed) return null;

  const toggle = (s: string) => setPicked(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ skills: picked }).eq("id", userId);
    setSaving(false);
    if (error) return;
    setDismissed(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 md:p-8 mt-10 border border-primary/20">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Personalize</p>
          <h3 className="text-xl md:text-2xl font-extrabold mb-1">Which of these skills do you know?</h3>
          <p className="text-sm text-muted-foreground mb-4">Quick check — tap the ones you're comfortable with. We'll match you to the right programs.</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {pool.map(s => {
              const on = picked.includes(s);
              return (
                <button key={s} onClick={() => toggle(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                  {on ? "✓ " : "+ "}{s}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-primary to-accent">
              {saving ? "Saving..." : "Save Skills"}
            </Button>
            <Link to="/profile"><Button variant="outline">See all skills</Button></Link>
            <Button variant="ghost" onClick={() => setDismissed(true)}>Not now</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}