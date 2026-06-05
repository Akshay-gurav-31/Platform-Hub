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
import { Star, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/feedback")({ component: FeedbackPage });

function FeedbackPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (user) {
      setEmail(user.email || "");
      supabase.from("profiles").select("full_name").eq("id", user.id).single()
        .then(({ data }) => setName((data as any)?.full_name || ""));
    }
  }, [user, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (message.trim().length < 5) return toast.error("Please write a longer message");
    setSubmitting(true);
    const { error } = await supabase.from("feedback" as any).insert({
      user_id: user.id, full_name: name, email, category, rating, message,
    } as any);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Thank you! Your feedback has been recorded.");
    setMessage(""); setRating(5);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-4xl font-bold">Share Your Feedback</h1>
          <p className="text-muted-foreground mt-2">Help us improve TRINETRA Technologies. Need a custom project or have a question? <Link to="/contact" className="text-primary underline">Contact us</Link>.</p>
        </div>

        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="general">General</option>
              <option value="internship">Internship Experience</option>
              <option value="platform">Platform / Website</option>
              <option value="certificate">Certificate</option>
              <option value="suggestion">Suggestion</option>
              <option value="bug">Report a Bug</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} className="cursor-pointer">
                  <Star className={`h-7 w-7 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Your Message</label>
            <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..." required maxLength={2000} />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-accent">
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
