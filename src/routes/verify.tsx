import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/verify")({
  component: Verify,
  validateSearch: (s: Record<string, unknown>) => ({ code: typeof s.code === "string" ? s.code : "" }),
});

function Verify() {
  const { code: initial } = Route.useSearch();
  const [code, setCode] = useState(initial || "");
  const [result, setResult] = useState<any>(null); const [searched, setSearched] = useState(false);

  async function lookup(c: string) {
    if (!c) return;
    const { data } = await (supabase.rpc as any)("verify_certificate", { _code: c });
    const row = Array.isArray(data) ? data[0] : null;
    setResult(row ? { cert_code: row.cert_code, recipient_name: row.recipient_name, issued_at: row.issued_at, internships: { title: row.internship_title } } : null);
    setSearched(true);
  }

  useEffect(() => { if (initial) lookup(initial); }, [initial]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-3" />
          <h1 className="text-4xl font-extrabold">Certificate <span className="gradient-text">Verification</span></h1>
          <p className="text-muted-foreground mt-2">Enter a Trinetra certificate ID to verify its authenticity.</p>
        </div>
        <div className="glass rounded-2xl p-6 flex gap-3">
          <Input value={code} onChange={e => setCode(e.target.value)} placeholder="TRN-XXXXXXXXXX" />
          <Button onClick={() => lookup(code)} className="bg-gradient-to-r from-primary to-accent">Verify</Button>
        </div>
        {searched && (
          <div className="glass rounded-2xl p-8 mt-6 text-center">
            {result ? (
              <>
                <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-400 mb-3" />
                <h2 className="text-2xl font-bold">Verified Certificate</h2>
                <div className="mt-5 space-y-2 text-left max-w-sm mx-auto">
                  <div><span className="text-muted-foreground text-xs">Recipient</span><div className="font-bold">{result.recipient_name}</div></div>
                  <div><span className="text-muted-foreground text-xs">Program</span><div className="font-bold">{result.internships?.title}</div></div>
                  <div><span className="text-muted-foreground text-xs">Issued</span><div>{new Date(result.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div></div>
                  <div><span className="text-muted-foreground text-xs">Certificate ID</span><div className="font-mono">{result.cert_code}</div></div>
                </div>
              </>
            ) : (
              <><XCircle className="h-14 w-14 mx-auto text-rose-400 mb-3" /><h2 className="text-2xl font-bold">Not Found</h2><p className="text-muted-foreground mt-2">No certificate matches that ID.</p></>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
