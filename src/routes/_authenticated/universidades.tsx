import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { MapPin, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/universidades")({
  component: Unis,
});

function Unis() {
  const { user } = useCurrentUser();
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    supabase.from("universities").select("*").order("nombre").then(({ data }) => setList(data ?? []));
  }, []);
  const filtered = list.filter((u) => (u.nombre + " " + u.pais).toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell isAdmin={user?.isAdmin}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-deep">Universidades</h1>
          <p className="text-muted-foreground">Encuentra dónde estudiar la carrera que te interesa.</p>
        </div>
        <Input placeholder="Buscar universidad o país…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((u) => (
            <div key={u.id} className="rounded-2xl border bg-card p-5 shadow-soft">
              <h3 className="font-semibold text-deep text-lg">{u.nombre}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {u.ubicacion}, {u.pais}</p>
              <p className="text-xs mt-2"><span className="font-medium text-deep">Modalidad:</span> {u.modalidad}</p>
              <p className="text-xs"><span className="font-medium text-deep">Costo:</span> {u.costo}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(u.carreras ?? []).slice(0, 5).map((c: string) => (
                  <span key={c} className="px-2 py-0.5 bg-sky/30 text-deep rounded-full text-[11px]">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
