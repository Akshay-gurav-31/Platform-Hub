import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

type Msg = {
  id: string;
  request_id: string;
  sender_id: string;
  sender_role: string;
  body: string;
  created_at: string;
};

export function RequestChat({
  requestId,
  currentUserId,
  asAdmin,
}: {
  requestId: string;
  currentUserId: string;
  asAdmin: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase.from("request_messages" as any) as any)
        .select("*").eq("request_id", requestId).order("created_at", { ascending: true });
      if (!cancelled) setMessages((data as Msg[]) || []);
    })();

    const ch = supabase
      .channel(`req-${requestId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` },
        (payload) => setMessages((m) => (m.some(x => x.id === (payload.new as Msg).id) ? m : [...m, payload.new as Msg])))
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [requestId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await (supabase.from("request_messages" as any) as any).insert({
      request_id: requestId, sender_id: currentUserId,
      sender_role: asAdmin ? "admin" : "student", body,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
  };

  return (
    <div className="rounded-xl border border-border bg-background">
      <div ref={scrollRef} className="max-h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No messages yet. {asAdmin ? "Send the first reply to the student." : "Our team will reply here — you'll see it live."}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          const isAdmin = m.sender_role === "admin";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className="flex items-center gap-1.5 text-[10px] opacity-70 mb-0.5 uppercase tracking-wider">
                  {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                  {isAdmin ? "TRINETRA Team" : "Student"}
                  <span>· {new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border p-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={asAdmin ? "Reply to student..." : "Type your message..."} disabled={sending} />
        <Button onClick={send} disabled={sending || !text.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
