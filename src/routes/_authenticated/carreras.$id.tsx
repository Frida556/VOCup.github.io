import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/carreras/$id")({
  component: CareerDetail,
});

function CareerDetail() {
  const { id } = Route.useParams();
  const { user } = useCurrentUser();
  const [c, setC] = useState<any>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    supabase.from("careers").select("*").eq("id", id).maybeSingle().then(({ data }) => setC(data));
    if (user) supabase.from("favorites").select("id").eq("user_id", user.id).eq("career_id", id).maybeSingle().then(({ data }) => setFav(!!data));
  }, [id, user]);

  async function toggle() {
    if (!user) return;
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("career_id", id);
      setFav(false); toast("Eliminado de favoritos");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, career_id: id });
      setFav(true); toast.success("¡Añadido a favoritos!");
    }
  }

  if (!c) return <AppShell><div className="text-muted-foreground">Cargando…</div></AppShell>;

  return (
    <AppShell isAdmin={user?.isAdmin}>
      <Link to="/carreras"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button></Link>
      <div className="rounded-3xl bg-hero p-8 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-80">{c.area}</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1">{c.nombre}</h1>
        <p className="mt-3 max-w-2xl text-primary-foreground/85">{c.descripcion}</p>
        <Button onClick={toggle} className="mt-5 bg-white text-primary hover:bg-white/90">
          <Heart className={"h-4 w-4 mr-2 " + (fav ? "fill-destructive text-destructive" : "")} />
          {fav ? "En favoritos" : "Añadir a favoritos"}
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Info title="Duración">{c.duracion}</Info>
        <Info title="Salario promedio">{c.salario_promedio}</Info>
        <Info title="Demanda laboral">{c.demanda_laboral}</Info>
        <Info title="Habilidades necesarias">
          <div className="flex flex-wrap gap-2 mt-1">
            {(c.habilidades ?? []).map((h: string) => (
              <span key={h} className="px-3 py-1 bg-sky/30 text-deep rounded-full text-xs font-medium">{h}</span>
            ))}
          </div>
        </Info>
      </div>
    </AppShell>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="font-semibold text-deep text-sm">{title}</h3>
      <div className="mt-1 text-foreground">{children}</div>
    </div>
  );
}
