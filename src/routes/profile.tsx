import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

const SKILL_BANK = [
  "Java","Python","JavaScript","TypeScript","C++","C#","Go","Rust","Kotlin","Swift",
  "React","Next.js","Vue","Angular","Node.js","Express","Django","Flask","Spring Boot",".NET",
  "MongoDB","PostgreSQL","MySQL","Redis","Firebase","Supabase",
  "AWS","Azure","GCP","Docker","Kubernetes","Git","CI/CD","Linux",
  "TensorFlow","PyTorch","Pandas","NumPy","Scikit-learn","OpenCV",
  "HTML/CSS","Tailwind CSS","Figma","React Native","Flutter","GraphQL","REST APIs",
];

function ProfilePage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ full_name: "", mobile: "", college: "", degree: "", branch: "", current_year: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setF({
          full_name: data.full_name || "", mobile: data.mobile || "", college: data.college || "",
          degree: data.degree || "", branch: data.branch || "", current_year: data.current_year || "",
        });
        setSkills((data as any).skills || []);
      }
    });
  }, [user]);

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (!skills.includes(v)) setSkills([...skills, v]);
    setCustom("");
  };

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ ...f, skills }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    nav({ to: "/dashboard" });
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="glass rounded-3xl p-8 mb-6">
          <p className="text-sm text-primary uppercase tracking-[0.2em] mb-1">Account</p>
          <h1 className="text-3xl font-extrabold mb-1">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mb-6">Keep your information accurate — it appears on your certificates.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Full Name</Label><Input value={f.full_name} onChange={upd("full_name")} /></div>
            <div><Label>Mobile</Label><Input value={f.mobile} onChange={upd("mobile")} /></div>
            <div><Label>College</Label><Input value={f.college} onChange={upd("college")} /></div>
            <div><Label>Degree</Label><Input value={f.degree} onChange={upd("degree")} /></div>
            <div><Label>Branch</Label><Input value={f.branch} onChange={upd("branch")} /></div>
            <div><Label>Current Year</Label><Input value={f.current_year} onChange={upd("current_year")} /></div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 mb-6">
          <p className="text-sm text-primary uppercase tracking-[0.2em] mb-1">Skills</p>
          <h2 className="text-2xl font-extrabold mb-1">Which technologies do you know?</h2>
          <p className="text-sm text-muted-foreground mb-5">Tap the skills you're comfortable with. This helps us recommend the right internships for you.</p>

          <div className="flex flex-wrap gap-2 mb-5">
            {SKILL_BANK.map(s => {
              const on = skills.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                  {s}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <Input placeholder="Add a custom skill..." value={custom} onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} />
            <Button type="button" variant="outline" onClick={addCustom}><Plus className="h-4 w-4" /></Button>
          </div>

          {skills.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Selected ({skills.length})</div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <Badge key={s} variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                    {s}
                    <button onClick={() => toggleSkill(s)} className="hover:text-destructive ml-1"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button onClick={save} disabled={saving} size="lg" className="w-full bg-gradient-to-r from-primary to-accent h-12">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <Footer />
    </div>
  );
}
