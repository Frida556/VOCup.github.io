import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/carreras")({
  component: Carreras,
});

function Carreras() {
  const { user } = useCurrentUser();
  const [list, setList] = useState<any[]>([]);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("careers").select("*").order("nombre").then(({ data }) => setList(data ?? []));
    if (user) supabase.from("favorites").select("career_id").eq("user_id", user.id).then(({ data }) => setFavs(new Set((data ?? []).map((f) => f.career_id))));
  }, [user]);

  async function toggleFav(id: string) {
    if (!user) return;
    if (favs.has(id)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("career_id", id);
      const s = new Set(favs); s.delete(id); setFavs(s);
      toast("Eliminado de favoritos");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, career_id: id });
      setFavs(new Set([...favs, id]));
      toast.success("¡Añadido a favoritos!");
    }
  }

  const filtered = list.filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()) || (c.area ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell isAdmin={user?.isAdmin}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-deep">Carreras</h1>
          <p className="text-muted-foreground">Explora opciones y guarda tus favoritas.</p>
        </div>
        <Input placeholder="Buscar carrera o área…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border bg-card p-5 hover:shadow-soft transition">
              <div className="flex items-start justify-between gap-3">
                <Link to="/carreras/$id" params={{ id: c.id }} className="flex-1">
                  <h3 className="font-semibold text-deep text-lg">{c.nombre}</h3>
                  <p className="text-xs text-primary mt-0.5">{c.area}</p>
                </Link>
                <button onClick={() => toggleFav(c.id)} className="p-2 rounded-full hover:bg-accent">
                  <Heart className={"h-5 w-5 " + (favs.has(c.id) ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.descripcion}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>⏱ {c.duracion}</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {c.demanda_laboral}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
