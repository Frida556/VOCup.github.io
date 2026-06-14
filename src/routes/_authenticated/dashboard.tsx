import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { VocMascot } from "@/components/VocMascot";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, GraduationCap, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [vp, setVp] = useState<any>(null);
  const [mascot, setMascot] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: vpd }, { data: md }, { data: pd }] = await Promise.all([
        supabase.from("vocational_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("mascots").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      if (vpd && !vpd.onboarding_completo) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      setVp(vpd);
      setMascot(md);
      setProfile(pd);
    })();
  }, [user, navigate]);

  if (!user || !vp) {
    return (
      <AppShell>
        <div className="text-muted-foreground">Cargando…</div>
      </AppShell>
    );
  }

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="space-y-6">
        <div className="rounded-3xl bg-hero p-6 md:p-8 text-primary-foreground flex items-center gap-6 shadow-soft">
          <VocMascot size={110} mood="motivado" />
          <div className="flex-1">
            <p className="text-sm text-primary-foreground/80">Hola, {profile?.nombre ?? "estudiante"} 👋</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">¿Listo para descubrir más de ti?</h1>
            <p className="mt-2 text-primary-foreground/85 text-sm max-w-lg">
              Conversa con Voc y sigue construyendo tu perfil vocacional.
            </p>
            <Link to="/chat">
              <Button className="mt-4 bg-white text-primary hover:bg-white/90">
                <MessageSquare className="mr-2 h-4 w-4" /> Hablar con Voc
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Nivel de certeza" icon={Sparkles}>
            <Progress value={vp.nivel_certeza ?? 0} />
            <p className="text-sm mt-2 text-muted-foreground">{vp.nivel_certeza ?? 0}% — Sigue chateando para subirlo.</p>
          </Card>
          <Card title="Mi mascota" icon={Trophy}>
            <div className="flex items-center gap-3">
              <VocMascot size={56} floating={false} />
              <div>
                <p className="font-semibold text-deep">Nivel {mascot?.nivel ?? 1}</p>
                <p className="text-xs text-muted-foreground">{mascot?.monedas ?? 0} monedas · {mascot?.xp ?? 0} XP</p>
              </div>
            </div>
          </Card>
          <Card title="Carreras sugeridas" icon={GraduationCap}>
            {(vp.carreras_sugeridas ?? []).length > 0 ? (
              <ul className="text-sm space-y-1">
                {(vp.carreras_sugeridas as string[]).slice(0, 3).map((c) => (
                  <li key={c} className="text-foreground">• {c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay sugerencias. ¡Chatea con Voc!</p>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold text-deep">Tu perfil vocacional</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(vp.intereses ?? []).map((i: string) => (
                <span key={i} className="px-3 py-1 bg-sky/30 text-deep rounded-full text-xs font-medium">{i}</span>
              ))}
            </div>
            <Link to="/perfil"><Button variant="link" className="px-0 mt-3">Ver perfil completo →</Button></Link>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold text-deep">Explora</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/carreras"><Button variant="outline" className="w-full justify-start"><GraduationCap className="mr-2 h-4 w-4" /> Ver carreras</Button></Link>
              <Link to="/universidades"><Button variant="outline" className="w-full justify-start">Universidades</Button></Link>
              <Link to="/favoritos"><Button variant="outline" className="w-full justify-start">Mis favoritos</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card-soft p-5 shadow-soft">
      <div className="flex items-center gap-2 text-deep font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
