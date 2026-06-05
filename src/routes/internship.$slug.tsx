import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft, ArrowRight, Award, BookOpen, CheckCircle2, Clock,
  GraduationCap, Layers, Sparkles, Target, Users
} from "lucide-react";

export const Route = createFileRoute("/internship/$slug")({ component: InternshipDetail });

type Internship = {
  id: string; slug: string; title: string; description: string;
  duration: string; skills: string[]; difficulty: string;
};

function InternshipDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState<Internship | null>(null);
  const [earned, setEarned] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: i } = await supabase.from("internships").select("*").eq("slug", slug).single();
      setData(i as Internship);
      if (i && user) {
        const { data: c } = await supabase
          .from("certificates").select("id")
          .eq("user_id", user.id).eq("internship_id", i.id).maybeSingle();
        setEarned(!!c);
      }
    })();
  }, [slug, user]);

  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  const modules = [
    "Foundations & core concepts",
    "Hands-on practical labs",
    "Industry tooling & best practices",
    "Real-world project simulation",
    "Final assessment & certification",
  ];
  const outcomes = [
    `Master core ${data.title} principles applied in production environments`,
    "Build a portfolio-ready project to showcase to recruiters",
    "Earn a globally verifiable certificate with QR-based authentication",
    "Develop industry-aligned problem solving and engineering mindset",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => nav({ to: "/dashboard" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.55_0.25_260/0.25),transparent_60%)]" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]">{data.difficulty}</Badge>
                <Badge className="bg-primary/15 text-primary border-primary/30">{data.duration}</Badge>
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary mb-2">Internship Program</p>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{data.title}</h1>
              <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">{data.description}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {data.skills.map(s => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full bg-secondary border border-border">{s}</span>
                ))}
              </div>
            </div>
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 glow">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Clock, label: "Duration", value: data.duration },
            { icon: BookOpen, label: "Modules", value: `${modules.length} stages` },
            { icon: Target, label: "Assessment", value: "20 MCQs" },
            { icon: Users, label: "Mode", value: "Self-paced" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="font-bold">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Curriculum + Outcomes */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="glass rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Curriculum Roadmap</h2>
            </div>
            <ol className="space-y-3">
              {modules.map((m, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm">{m}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Learning Outcomes</h2>
            </div>
            <ul className="space-y-3">
              {outcomes.map((o, i) => (
                <li key={i} className="flex gap-3 items-start text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certification */}
        <div className="glass rounded-3xl p-8 mb-10 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
            <Award className="h-7 w-7 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Verified Industry Certificate</h3>
            <p className="text-sm text-muted-foreground">
              Issued by Trinetra Technologies Pvt. Ltd., signed by Founder &amp; CEO Prajwal Karajange,
              with a unique verification ID and QR code accepted by recruiters and HR portals.
            </p>
          </div>
          <Link to="/verify">
            <Button variant="outline">Verify Sample</Button>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center">
          {!user ? (
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent h-12 px-8">
                Sign in to Start <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : earned ? (
            <Link to="/certificate/$slug" params={{ slug: data.slug }}>
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black h-12 px-8">
                <Award className="h-4 w-4 mr-2" /> View My Certificate
              </Button>
            </Link>
          ) : (
            <Link to="/test/$slug" params={{ slug: data.slug }}>
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent h-12 px-8">
                Begin Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
