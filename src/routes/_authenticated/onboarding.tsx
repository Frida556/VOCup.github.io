import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveOnboarding } from "@/lib/voc.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VocMascot } from "@/components/VocMascot";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const INTERESES = ["Tecnología", "Arte", "Ciencias", "Negocios", "Salud", "Educación", "Deportes", "Comunicación", "Naturaleza", "Música"];
const HABILIDADES = ["Lógica", "Creatividad", "Comunicación", "Liderazgo", "Trabajo en equipo", "Análisis", "Empatía", "Organización"];
const MATERIAS = ["Matemáticas", "Lenguaje", "Biología", "Historia", "Arte", "Educación física", "Computación", "Química", "Filosofía"];

function Onboarding() {
  const navigate = useNavigate();
  const save = useServerFn(saveOnboarding);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    intereses: [] as string[],
    habilidades: [] as string[],
    materias_favoritas: [] as string[],
    personalidad: "",
    objetivos: "",
  });

  function toggle(field: "intereses" | "habilidades" | "materias_favoritas", val: string) {
    setData((d) => ({
      ...d,
      [field]: d[field].includes(val) ? d[field].filter((x) => x !== val) : [...d[field], val],
    }));
  }

  async function finish() {
    try {
      await save({ data });
      toast.success("¡Onboarding completado!");
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const steps = [
    { title: "¿Qué te interesa?", subtitle: "Elige todo lo que te guste.", chips: INTERESES, field: "intereses" as const },
    { title: "¿En qué eres bueno/a?", subtitle: "Tus habilidades naturales.", chips: HABILIDADES, field: "habilidades" as const },
    { title: "Materias favoritas", subtitle: "Las que disfrutas en clase.", chips: MATERIAS, field: "materias_favoritas" as const },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-2xl bg-card rounded-2xl border shadow-soft p-8">
        <div className="flex items-center gap-4 mb-6">
          <VocMascot size={64} />
          <div>
            <h1 className="text-2xl font-bold text-deep">Conozcámonos</h1>
            <p className="text-sm text-muted-foreground">Paso {Math.min(step + 1, 4)} de 4</p>
          </div>
        </div>

        {step < 3 ? (
          <div>
            <h2 className="text-xl font-semibold text-deep">{steps[step].title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{steps[step].subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {steps[step].chips.map((c) => {
                const active = (data[steps[step].field] as string[]).includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(steps[step].field, c)}
                    className={
                      "px-4 py-2 rounded-full text-sm border transition " +
                      (active
                        ? "bg-primary text-primary-foreground border-primary shadow-soft"
                        : "bg-card hover:bg-accent border-border")
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pers">¿Cómo te describirías?</Label>
              <Input id="pers" placeholder="Ej: curioso/a, sociable, creativo/a…" value={data.personalidad} onChange={(e) => setData({ ...data, personalidad: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="obj">¿Qué quieres lograr en el futuro?</Label>
              <Textarea id="obj" rows={4} placeholder="Tus sueños y metas…" value={data.objetivos} onChange={(e) => setData({ ...data, objetivos: e.target.value })} />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Atrás
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continuar</Button>
          ) : (
            <Button onClick={finish}>Terminar onboarding ✨</Button>
          )}
        </div>
      </div>
    </div>
  );
}
