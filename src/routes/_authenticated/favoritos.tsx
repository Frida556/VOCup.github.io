import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/favoritos")({
  component: Favs,
});

function Favs() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("career_id, careers(*)").eq("user_id", user.id).then(({ data }) => setItems(data ?? []));
  }, [user]);
  async function remove(id: string) {
    if (!user) return;
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("career_id", id);
    setItems((x) => x.filter((i) => i.career_id !== id));
    toast("Eliminado");
  }
  return (
    <AppShell isAdmin={user?.isAdmin}>
      <h1 className="text-2xl font-bold text-deep">Mis favoritos</h1>
      <p className="text-muted-foreground mb-5">Las carreras que más te interesan.</p>
      {items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <p className="text-muted-foreground">Aún no tienes favoritos.</p>
          <Link to="/carreras"><Button className="mt-4">Explorar carreras</Button></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((i: any) => i.careers && (
            <div key={i.career_id} className="rounded-2xl border bg-card p-5">
              <div className="flex justify-between items-start">
                <Link to="/carreras/$id" params={{ id: i.career_id }}>
                  <h3 className="font-semibold text-deep text-lg">{i.careers.nombre}</h3>
                  <p className="text-xs text-primary">{i.careers.area}</p>
                </Link>
                <button onClick={() => remove(i.career_id)} className="p-2 hover:bg-accent rounded-full">
                  <Heart className="h-5 w-5 fill-destructive text-destructive" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{i.careers.descripcion}</p>
              <p className="text-xs mt-2 flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3" /> {i.careers.demanda_laboral}</p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
