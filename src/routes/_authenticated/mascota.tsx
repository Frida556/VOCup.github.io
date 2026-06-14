import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { VocMascot } from "@/components/VocMascot";
import { Progress } from "@/components/ui/progress";

const COLORS = [
  { id: "plata", label: "Plomo plata", value: undefined },
  { id: "azul", label: "Azul cielo", value: "#7cc4ff" },
  { id: "turquesa", label: "Turquesa", value: "#5ce0c8" },
  { id: "lila", label: "Lila", value: "#c79cff" },
  { id: "rosa", label: "Rosa", value: "#ffa6c1" },
  { id: "verde", label: "Verde", value: "#9be38b" },
  { id: "dorado", label: "Dorado", value: "#f0c265" },
];

const ACCESORIOS = ["Audífonos", "Gorra", "Lentes", "Mochila", "Bufanda", "Corona"];

export const Route = createFileRoute("/_authenticated/mascota")({
  component: Mascota,
});

function Mascota() {
  const { user } = useCurrentUser();
  const [m, setM] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("mascots").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setM(data));
  }, [user]);

  async function setColor(id: string) {
    if (!user || !m) return;
    await supabase.from("mascots").update({ color: id }).eq("user_id", user.id);
    setM({ ...m, color: id });
  }

  async function toggleAccesorio(name: string) {
    if (!user || !m) return;
    const owned = (m.accesorios ?? []).includes(name);
    if (!owned && (m.monedas ?? 0) < 20) return;
    const updated = owned ? m.accesorios.filter((a: string) => a !== name) : [...(m.accesorios ?? []), name];
    const newCoins = owned ? m.monedas : m.monedas - 20;
    await supabase.from("mascots").update({ accesorios: updated, monedas: newCoins }).eq("user_id", user.id);
    setM({ ...m, accesorios: updated, monedas: newCoins });
  }

  if (!user || !m) return <AppShell><div className="text-muted-foreground">Cargando…</div></AppShell>;

  const colorObj = COLORS.find((c) => c.id === m.color) ?? COLORS[0];
  const xpToNext = m.nivel * 100;

  return (
    <AppShell isAdmin={user.isAdmin}>
      <h1 className="text-2xl font-bold text-deep">Mi mascota Voc</h1>
      <p className="text-muted-foreground mb-6">Personalízala y sube de nivel.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-hero p-8 text-primary-foreground text-center shadow-soft">
          <div className="flex justify-center">
            <VocMascot size={200} mood="motivado" color={colorObj.value} />
          </div>
          <p className="mt-4 text-sm opacity-80">Color actual</p>
          <p className="text-xl font-semibold">{colorObj.label}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-card-soft p-5">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-deep">Nivel {m.nivel}</h3>
              <span className="text-sm font-bold text-primary">{m.monedas} 🪙</span>
            </div>
            <Progress value={(m.xp % 100)} className="mt-2" />
            <p className="text-xs mt-1 text-muted-foreground">{m.xp} XP · faltan {xpToNext - m.xp} para subir.</p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold text-deep">Colores</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={"px-3 py-1 rounded-full text-xs border " + (m.color === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent")}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold text-deep">Accesorios <span className="text-xs font-normal text-muted-foreground">(20 🪙 c/u)</span></h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {ACCESORIOS.map((a) => {
                const owned = (m.accesorios ?? []).includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAccesorio(a)}
                    className={"px-3 py-1 rounded-full text-xs border " + (owned ? "bg-success text-success-foreground border-success" : "bg-card hover:bg-accent")}
                  >
                    {owned ? "✓ " : ""}{a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
