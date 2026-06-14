import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { VocMascot } from "@/components/VocMascot";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessage, analyzeVocation } from "@/lib/voc.functions";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

interface Msg { id: string; role: string; content: string }

function ChatPage() {
  const { user } = useCurrentUser();
  const send = useServerFn(sendChatMessage);
  const analyze = useServerFn(analyzeVocation);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at").then(({ data }) => {
      if (data && data.length > 0) {
        setMessages(data as Msg[]);
      } else {
        setMessages([{ id: "intro", role: "assistant", content: "¡Hola! Soy Voc 👋 Cuéntame, ¿qué materias o actividades disfrutas más en tu día a día?" }]);
      }
    });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { id: `tmp-${Date.now()}`, role: "user", content: text }]);
    setLoading(true);
    try {
      const { reply } = await send({ data: { content: text } });
      setMessages((m) => [...m, { id: `r-${Date.now()}`, role: "assistant", content: reply ?? "..." }]);
    } catch (e: any) {
      toast.error(e.message ?? "Error en el chat");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalyze() {
    toast.message("Voc está analizando tu perfil…");
    try {
      await analyze({});
      toast.success("¡Perfil actualizado!");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (!user) return null;

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <VocMascot size={48} floating={false} />
            <div>
              <h1 className="text-xl font-bold text-deep">Chat con Voc</h1>
              <p className="text-xs text-muted-foreground">Tu compañero IA vocacional</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={runAnalyze}>
            <Sparkles className="mr-1 h-4 w-4" /> Analizar perfil
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-4 bg-card-soft rounded-2xl border">
          {messages.map((m) => (
            <div key={m.id} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap " +
                  (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">Voc está escribiendo…</div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-3 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe a Voc…"
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e as any);
              }
            }}
          />
          <Button type="submit" disabled={loading || !input.trim()} className="self-stretch">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
