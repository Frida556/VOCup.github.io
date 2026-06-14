import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user } = useCurrentUser();
  const [vp, setVp] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("vocational_profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setVp(data));
  }, [user]);
  if (!user || !vp) return <AppShell><div className="text-muted-foreground">Cargando…</div></AppShell>;

  const sections: { title: string; items: string[] }[] = [
    { title: "Intereses", items: vp.intereses ?? [] },
    { title: "Habilidades", items: vp.habilidades ?? [] },
    { title: "Materias favoritas", items: vp.materias_favoritas ?? [] },
    { title: "Fortalezas detectadas", items: vp.fortalezas ?? [] },
    { title: "Carreras sugeridas", items: vp.carreras_sugeridas ?? [] },
  ];

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-deep">Mi perfil vocacional</h1>
          <p className="text-muted-foreground">Esto es lo que Voc ha descubierto sobre ti.</p>
        </div>
        <div className="rounded-2xl border bg-card-soft p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-deep">Nivel de certeza</h3>
            <span className="text-sm font-bold text-primary">{vp.nivel_certeza}%</span>
          </div>
          <Progress value={vp.nivel_certeza} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">Cuanto más converses con Voc, más preciso será tu perfil.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold text-deep">{s.title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.items.length > 0 ? s.items.map((i) => (
                  <span key={i} className="px-3 py-1 bg-sky/30 text-deep rounded-full text-xs font-medium">{i}</span>
                )) : <span className="text-sm text-muted-foreground">Aún sin datos.</span>}
              </div>
            </div>
          ))}
          {vp.personalidad && (
            <div className="rounded-2xl border bg-card p-5 md:col-span-2">
              <h3 className="font-semibold text-deep">Personalidad</h3>
              <p className="mt-2 text-sm text-foreground">{vp.personalidad}</p>
            </div>
          )}
          {vp.objetivos && (
            <div className="rounded-2xl border bg-card p-5 md:col-span-2">
              <h3 className="font-semibold text-deep">Objetivos</h3>
              <p className="mt-2 text-sm text-foreground">{vp.objetivos}</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
