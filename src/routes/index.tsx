import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/Logo";
import { Brain, Code2, Layers, Shield, Sparkles, Award, ArrowRight, Eye, Zap, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Trinetra Technologies — Empowering Future Developers" },
      { name: "description", content: "Premium internship & certification platform by Trinetra Technologies. Learn, get certified, build your career." },
    ],
  }),
});

const programs = [
  { icon: Layers, title: "Full Stack Development", desc: "End-to-end web mastery.", slug: "full-stack" },
  { icon: Code2, title: "MERN Stack", desc: "MongoDB, Express, React, Node.", slug: "mern" },
  { icon: Brain, title: "AI & Machine Learning", desc: "Build intelligent systems.", slug: "ai-ml" },
  { icon: Sparkles, title: "UI / UX Design", desc: "Design experiences users love.", slug: "uiux" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.55_0.25_260/0.35),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-8">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Trinetra — The Third Eye of Technology</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Empowering The <span className="gradient-text">Next Generation</span><br/>of Developers
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            India's premium internship & certification platform. Learn industry skills, pass curated assessments, and earn verified certificates that employers trust.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent glow text-base h-12 px-7">
                Start Your Internship <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#programs">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base">Browse Programs</Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { n: "10+", l: "Internship Tracks" },
              { n: "5K+", l: "Students Trained" },
              { n: "98%", l: "Completion Rate" },
              { n: "24/7", l: "Cloud Platform" },
            ].map((s, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <div className="text-3xl font-extrabold gradient-text">{s.n}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Our Programs</p>
          <h2 className="text-4xl md:text-5xl font-extrabold">Industry-Grade <span className="gradient-text">Internships</span></h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Curated tracks covering the full modern technology landscape.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {programs.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <Link to="/internship/$slug" params={{ slug: p.slug }}
                className="block glass rounded-2xl p-6 hover:border-primary/50 hover:-translate-y-1 transition-all group cursor-pointer h-full">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <p.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                <div className="mt-4 text-xs text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Learn more <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/dashboard"><Button variant="outline" size="lg">View All 10 Programs <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, t: "Verified Certificates", d: "Each certificate carries a unique ID and QR for public verification." },
            { icon: Zap, t: "Instant Assessments", d: "20-question MCQ tests with auto-grading and immediate feedback." },
            { icon: Trophy, t: "Industry Recognized", d: "Designed with founder Prajwal Karajange & industry mentors." },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-7">
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold text-xl mb-2">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT / FOUNDER */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass rounded-3xl p-10 md:p-16 grid md:grid-cols-[1fr_auto] items-center gap-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3">Our Mission</p>
            <h2 className="text-4xl font-extrabold mb-5">Building India's largest <span className="gradient-text">developer ecosystem</span></h2>
            <p className="text-muted-foreground leading-relaxed">
              Trinetra Technologies Pvt. Ltd. is a futuristic EdTech startup on a mission to bridge the gap between college learning
              and industry demand. Through hands-on internships, AI-powered guidance, and verified credentials, we are training the
              next generation of world-class developers.
            </p>
            <div className="mt-7 flex items-center gap-4">
              <LogoMark className="h-12 w-12" />
              <div>
                <div className="font-bold">Prajwal Karajange</div>
                <div className="text-xs text-muted-foreground">Founder & CEO, Trinetra Technologies</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" />
            <div className="relative h-56 w-56 rounded-full glass flex items-center justify-center">
              <Award className="h-24 w-24 gold-text" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold">Ready to launch your <span className="gradient-text">tech career</span>?</h2>
        <p className="mt-4 text-muted-foreground">Join thousands of students earning verified credentials with Trinetra.</p>
        <Link to="/signup"><Button size="lg" className="mt-8 bg-gradient-to-r from-primary to-accent glow h-12 px-8">Create Free Account</Button></Link>
      </section>

      <Footer />
    </div>
  );
}
