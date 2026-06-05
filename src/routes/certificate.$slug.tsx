import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Award } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import logoImg from "@/assets/trinetra-logo.png";
import sigImg from "@/assets/founder-signature.png";

export const Route = createFileRoute("/certificate/$slug")({ component: CertPage });

type Cert = { id: string; cert_code: string; recipient_name: string; issued_at: string };
type Internship = { id: string; title: string };

function CertPage() {
  const { slug } = Route.useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [cert, setCert] = useState<Cert | null>(null);
  const [name, setName] = useState("");
  const [hasAttempt, setHasAttempt] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) nav({ to: "/login" }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: int } = await supabase.from("internships").select("id, title").eq("slug", slug).single();
      if (!int) return;
      setInternship(int);
      const { data: c } = await supabase.from("certificates").select("*").eq("user_id", user.id).eq("internship_id", int.id).maybeSingle();
      if (c) setCert(c);
      const { data: a } = await supabase.from("test_attempts").select("passed").eq("user_id", user.id).eq("internship_id", int.id).eq("passed", true).maybeSingle();
      setHasAttempt(!!a);
    })();
  }, [user, slug]);

  async function claim() {
    if (!user || !internship || !name.trim()) return;
    const { data, error } = await supabase.from("certificates").insert({
      user_id: user.id, internship_id: internship.id, recipient_name: name.trim()
    }).select().single();
    if (error) return toast.error(error.message);
    setCert(data); toast.success("Certificate issued!");
  }

  async function downloadPDF() {
    if (!cert || !internship) return;
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth(); const H = pdf.internal.pageSize.getHeight();

    // Background
    pdf.setFillColor(15, 18, 40); pdf.rect(0, 0, W, H, "F");
    // Outer border gold
    pdf.setDrawColor(212, 175, 55); pdf.setLineWidth(3); pdf.rect(20, 20, W - 40, H - 40);
    pdf.setLineWidth(0.6); pdf.rect(28, 28, W - 56, H - 56);
    // Decorative top bar
    pdf.setFillColor(30, 60, 160); pdf.rect(40, 40, W - 80, 4, "F");

    // Logo
    pdf.addImage(logoImg, "PNG", 50, 60, 110, 50);

    // Header
    pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(26);
    pdf.text("TRINETRA TECHNOLOGIES PVT. LTD.", W / 2, 90, { align: "center" });
    pdf.setFontSize(11); pdf.setTextColor(212, 175, 55); pdf.setFont("helvetica", "italic");
    pdf.text("Empowering Future Developers", W / 2, 108, { align: "center" });

    // Title
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(40); pdf.setTextColor(255, 255, 255);
    pdf.text("CERTIFICATE", W / 2, 175, { align: "center" });
    pdf.setFontSize(14); pdf.setTextColor(180, 200, 240); pdf.setFont("helvetica", "normal");
    pdf.text("OF INTERNSHIP COMPLETION", W / 2, 198, { align: "center" });

    pdf.setFontSize(12); pdf.setTextColor(200, 200, 200);
    pdf.text("This is proudly presented to", W / 2, 235, { align: "center" });

    // Recipient name
    pdf.setFont("times", "italic"); pdf.setFontSize(38); pdf.setTextColor(255, 215, 100);
    pdf.text(cert.recipient_name, W / 2, 285, { align: "center" });

    pdf.setDrawColor(212, 175, 55); pdf.setLineWidth(0.5);
    pdf.line(W / 2 - 200, 300, W / 2 + 200, 300);

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(12); pdf.setTextColor(220, 220, 220);
    pdf.text("for successfully completing the internship program in", W / 2, 325, { align: "center" });

    pdf.setFont("helvetica", "bold"); pdf.setFontSize(22); pdf.setTextColor(120, 180, 255);
    pdf.text(internship.title, W / 2, 358, { align: "center" });

    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(200, 200, 200);
    const date = new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    pdf.text(`Issued on ${date}  •  Certificate ID: ${cert.cert_code}`, W / 2, 380, { align: "center" });

    // Signature
    pdf.addImage(sigImg, "PNG", 80, 430, 180, 60);
    pdf.setDrawColor(180, 180, 180); pdf.line(70, 495, 280, 495);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(255, 255, 255);
    pdf.text("Prajwal Karajange", 175, 512, { align: "center" });
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(180, 180, 180);
    pdf.text("Founder & CEO", 175, 525, { align: "center" });

    // QR
    const verifyUrl = `${window.location.origin}/verify?code=${cert.cert_code}`;
    const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, color: { dark: "#0F1228", light: "#FFFFFFFF" } });
    pdf.addImage(qr, "PNG", W - 160, 440, 80, 80);
    pdf.setFontSize(8); pdf.setTextColor(180, 180, 180);
    pdf.text("Scan to verify", W - 120, 530, { align: "center" });

    pdf.save(`Trinetra-${cert.cert_code}.pdf`);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {!cert ? (
          <div className="glass rounded-3xl p-10 max-w-lg mx-auto text-center">
            <Award className="h-16 w-16 mx-auto gold-text mb-4" />
            <h1 className="text-3xl font-extrabold mb-2">Claim your certificate</h1>
            <p className="text-muted-foreground mb-6">Enter the name you want printed on your certificate. This cannot be changed later.</p>
            {!hasAttempt ? (
              <p className="text-rose-400">You must pass the test before claiming. <Link to="/test/$slug" params={{ slug }} className="underline">Take the test</Link></p>
            ) : (
              <>
                <div className="text-left mb-4"><Label>Name on Certificate</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Prajwal Karajange" /></div>
                <Button onClick={claim} disabled={!name.trim()} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black">Generate Certificate</Button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Certificate preview */}
            <div ref={certRef} className="relative rounded-2xl overflow-hidden border-4 border-amber-400/60 bg-[#0F1228] aspect-[1.414/1] p-10 text-white">
              <div className="absolute inset-3 border border-amber-400/40 pointer-events-none rounded" />
              <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <div className="flex items-center justify-between">
                <img src={logoImg} className="h-14" alt="logo" />
                <div className="text-right">
                  <div className="font-extrabold tracking-wider">TRINETRA TECHNOLOGIES PVT. LTD.</div>
                  <div className="text-xs italic text-amber-300">Empowering Future Developers</div>
                </div>
              </div>
              <div className="text-center mt-10">
                <div className="text-4xl font-extrabold tracking-wider">CERTIFICATE</div>
                <div className="text-sm text-blue-200 mt-1">OF INTERNSHIP COMPLETION</div>
                <div className="text-xs text-slate-300 mt-6">This is proudly presented to</div>
                <div className="text-4xl font-serif italic text-amber-300 mt-3">{cert.recipient_name}</div>
                <div className="h-px bg-amber-400/60 w-2/3 mx-auto mt-2" />
                <div className="text-sm text-slate-300 mt-4">for successfully completing the internship program in</div>
                <div className="text-2xl font-bold text-blue-300 mt-2">{internship?.title}</div>
                <div className="text-xs text-slate-400 mt-3">Issued on {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · ID: {cert.cert_code}</div>
              </div>
              <div className="absolute bottom-8 left-10">
                <img src={sigImg} className="h-14 -mb-2" alt="signature" />
                <div className="border-t border-slate-400 w-44 mt-1 pt-1 text-center">
                  <div className="font-bold">Prajwal Karajange</div>
                  <div className="text-[10px] text-slate-400">Founder & CEO</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <Button onClick={downloadPDF} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black"><Download className="h-4 w-4 mr-1" /> Download PDF</Button>
              <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
