import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react";

export const Route = createFileRoute("/test/$slug")({ component: TestPage });

type Q = { id: string; question: string; options: string[] };

function TestPage() {
  const { slug } = Route.useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [internship, setInternship] = useState<{ id: string; title: string } | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<{ score: number; passed: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: int } = await supabase.from("internships").select("id, title").eq("slug", slug).single();
      if (!int) return;
      setInternship(int);
      const { data: existing } = await supabase.from("certificates").select("id").eq("user_id", user.id).eq("internship_id", int.id).maybeSingle();
      if (existing) { setAlreadyDone(true); return; }
      const { data: qs } = await (supabase as any).from("questions_public").select("id, question, options").eq("internship_id", int.id);
      // Randomize question order per attempt so each user gets a different sequence
      const shuffled = [...((qs as any[]) || [])].sort(() => Math.random() - 0.5);
      setQuestions(shuffled as any);
    })();
  }, [user, slug]);

  useEffect(() => {
    if (submitted || alreadyDone || !questions.length) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); submit(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, submitted, alreadyDone]);

  async function submit() {
    if (submitted || !internship || !user) return;
    const { data, error } = await (supabase.rpc as any)("score_test", { _internship_id: internship.id, _answers: answers });
    if (error) { toast.error(error.message); return; }
    const row = Array.isArray(data) ? data[0] : data;
    const score = row?.score ?? 0;
    const passed = !!row?.passed;
    setSubmitted({ score, passed });
    if (passed) toast.success(`Passed! ${score}/${questions.length}`); else toast.error(`${score}/${questions.length} — minimum 12 required`);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center glass rounded-3xl mt-10">
          <Award className="h-16 w-16 mx-auto gold-text mb-4" />
          <h1 className="text-3xl font-extrabold mb-3">You've already completed this internship</h1>
          <p className="text-muted-foreground mb-6">Each user can earn one certificate per program.</p>
          <Link to="/certificate/$slug" params={{ slug }}><Button className="bg-gradient-to-r from-primary to-accent">View Certificate</Button></Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-20">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-10 text-center">
            {submitted.passed ? <CheckCircle2 className="h-20 w-20 mx-auto text-emerald-400 mb-4" /> : <XCircle className="h-20 w-20 mx-auto text-rose-400 mb-4" />}
            <h1 className="text-4xl font-extrabold mb-2">{submitted.passed ? "Congratulations!" : "Not this time"}</h1>
            <p className="text-muted-foreground mb-6">You scored <b>{submitted.score}</b> / {questions.length}</p>
            {submitted.passed ? (
              <Link to="/certificate/$slug" params={{ slug }} search={{ claim: 1 } as any}>
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black"><Award className="h-4 w-4 mr-1" /> Claim Certificate</Button>
              </Link>
            ) : (
              <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const m = Math.floor(timeLeft / 60), s = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="glass rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-primary uppercase tracking-widest">Assessment</div>
            <div className="font-bold text-lg">{internship?.title}</div>
          </div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <Clock className="h-5 w-5 text-primary" /> {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass rounded-2xl p-6">
              <div className="text-xs text-muted-foreground mb-2">Question {idx + 1} of {questions.length}</div>
              <div className="font-semibold mb-4">{q.question}</div>
              <div className="grid gap-2">
                {q.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                    className={`text-left px-4 py-3 rounded-xl border transition ${answers[q.id] === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <span className="text-xs text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button onClick={submit} size="lg" className="flex-1 bg-gradient-to-r from-primary to-accent h-12">Submit Test</Button>
          <Button
            onClick={() => {
              if (confirm("End the test now? Your current answers will be scored and this attempt will be saved.")) submit();
            }}
            size="lg" variant="outline" className="sm:w-48 h-12">
            End Test
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">Minimum 12 / 20 to pass. You can attempt only once. Use "End Test" to finish early.</p>
      </div>
    </div>
  );
}
