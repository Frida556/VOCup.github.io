import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { VocMascot } from "@/components/VocMascot";
import { Logo } from "@/components/Logo";
import {
  Sparkles,
  Compass,
  MessageSquare,
  GraduationCap,
  Trophy,
  Heart,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VocUp — Encuentra tu vocación" },
      { name: "description", content: "Plataforma de orientación vocacional con IA. Descubre la carrera ideal para ti con Voc, tu compañero inteligente." },
      { property: "og:title", content: "VocUp — Encuentra tu vocación" },
      { property: "og:description", content: "Chat con IA, perfil vocacional dinámico y recomendaciones de carreras y universidades." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Logo size={34} />
          <div className="flex gap-2">
            <Link to="/auth">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button>Empezar ahora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,white_0%,transparent_50%)] opacity-20" />
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Tu futuro empieza aquí
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold text-balance leading-[1.05]">
              Encuentra <span className="text-sky">tu vocación</span> con la ayuda de Voc.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 max-w-lg">
              Una plataforma con IA que te escucha, te guía y te ayuda a descubrir
              qué carrera profesional encaja contigo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Empezar ahora <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-white/40 text-primary-foreground hover:bg-white/10">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-sky/40 rounded-full" />
              <VocMascot size={280} mood="motivado" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-deep">¿Cómo te acompaña Voc?</h2>
          <p className="mt-3 text-muted-foreground">
            Una experiencia gamificada que evoluciona contigo en cada paso de tu camino vocacional.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { icon: MessageSquare, title: "Chat con IA", desc: "Conversa con Voc y descubre tus intereses reales." },
            { icon: Compass, title: "Perfil dinámico", desc: "Tu perfil vocacional evoluciona con cada conversación." },
            { icon: GraduationCap, title: "Carreras y universidades", desc: "Recomendaciones personalizadas para ti." },
            { icon: Heart, title: "Favoritos", desc: "Guarda las carreras que más te interesan." },
            { icon: Trophy, title: "Gamificación", desc: "Sube de nivel y desbloquea logros con tu mascota." },
            { icon: Sparkles, title: "Sin presión", desc: "Voc te escucha, te guía y celebra cada avance contigo." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-6 bg-card-soft border shadow-soft">
              <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-deep text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="rounded-3xl bg-hero p-10 md:p-14 text-center text-primary-foreground shadow-soft">
          <h2 className="text-3xl md:text-4xl font-bold">¡Tu futuro comienza hoy!</h2>
          <p className="mt-3 text-primary-foreground/85 max-w-xl mx-auto">
            Crea tu cuenta gratis, completa tu onboarding y empieza a conversar con Voc.
          </p>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button size="lg" className="mt-6 bg-white text-primary hover:bg-white/90">
              Crear mi cuenta <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VocUp · Hecho con cariño para tu futuro.
      </footer>
    </div>
  );
}
