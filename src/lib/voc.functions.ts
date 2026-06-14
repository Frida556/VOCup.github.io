import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callLovableAI } from "./ai-gateway.server";

// --- Vocational profile ---
export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      intereses: z.array(z.string()),
      habilidades: z.array(z.string()),
      materias_favoritas: z.array(z.string()),
      personalidad: z.string(),
      objetivos: z.string(),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("vocational_profiles")
      .update({
        ...data,
        onboarding_completo: true,
        nivel_certeza: 35,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    // Award XP
    await supabase.rpc;
    await supabase.from("mascots").update({ xp: 50, monedas: 25, nivel: 2 }).eq("user_id", userId);
    return { ok: true };
  });

// --- Chat ---
const SYSTEM_PROMPT = `Eres "Voc", un asistente de orientación vocacional cálido y motivador para jóvenes hispanohablantes.
Objetivos:
- Hacer preguntas exploratorias breves (1-2 por mensaje) sobre intereses, habilidades, materias favoritas, valores y estilo de vida.
- Detectar patrones y sugerir áreas/carreras concretas con argumentos claros.
- Validar emociones, ser empático, usar emojis con moderación.
- Mantener mensajes cortos, en español, tono cercano de tú.
- Cuando detectes intereses claros, sugiere 2-3 carreras específicas y por qué encajan.
Nunca inventes datos sobre universidades específicas; recomienda explorar la sección de Universidades en la app.`;

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ content: z.string().min(1).max(2000) }).parse)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Save user message
    const { error: insErr } = await supabase
      .from("chat_messages")
      .insert({ user_id: userId, role: "user", content: data.content });
    if (insErr) throw new Error(insErr.message);

    // Fetch context: vocational profile + last 20 messages
    const [{ data: profile }, { data: history }] = await Promise.all([
      supabase.from("vocational_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("chat_messages")
        .select("role,content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const recent = (history ?? []).reverse();
    const profileLine = profile
      ? `Perfil actual del estudiante: intereses=${(profile.intereses ?? []).join(", ") || "—"}; habilidades=${(profile.habilidades ?? []).join(", ") || "—"}; personalidad=${profile.personalidad ?? "—"}; objetivos=${profile.objetivos ?? "—"}.`
      : "";

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n" + profileLine },
      ...recent.map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await callLovableAI(messages);

    await supabase
      .from("chat_messages")
      .insert({ user_id: userId, role: "assistant", content: reply ?? "..." });

    // Award some XP
    await supabase.rpc;
    const { data: mascot } = await supabase.from("mascots").select("xp,monedas,nivel").eq("user_id", userId).maybeSingle();
    if (mascot) {
      const newXp = (mascot.xp ?? 0) + 10;
      const newCoins = (mascot.monedas ?? 0) + 5;
      const newLvl = Math.max(mascot.nivel ?? 1, Math.floor(newXp / 100) + 1);
      await supabase.from("mascots").update({ xp: newXp, monedas: newCoins, nivel: newLvl }).eq("user_id", userId);
    }

    return { reply };
  });

export const analyzeVocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: history }, { data: careers }] = await Promise.all([
      supabase.from("vocational_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("chat_messages").select("role,content").eq("user_id", userId).order("created_at", { ascending: true }).limit(40),
      supabase.from("careers").select("nombre,area"),
    ]);
    const careerList = (careers ?? []).map((c) => c.nombre).join(", ");
    const convo = (history ?? []).map((m) => `${m.role}: ${m.content}`).join("\n");
    const prompt = `A partir del siguiente perfil y conversación, devuelve un JSON estricto (sin markdown) con esta forma:
{"intereses":string[],"habilidades":string[],"fortalezas":string[],"carreras_sugeridas":string[],"nivel_certeza":number(0-100)}
Las carreras sugeridas DEBEN venir de esta lista exacta: [${careerList}].

Perfil: ${JSON.stringify(profile)}
Conversación:
${convo}`;
    const raw = await callLovableAI([
      { role: "system", content: "Devuelves solo JSON válido, sin texto extra." },
      { role: "user", content: prompt },
    ]);
    let parsed: any = {};
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {};
    }
    await supabase.from("vocational_profiles").update({
      intereses: parsed.intereses ?? undefined,
      habilidades: parsed.habilidades ?? undefined,
      fortalezas: parsed.fortalezas ?? [],
      carreras_sugeridas: parsed.carreras_sugeridas ?? [],
      nivel_certeza: typeof parsed.nivel_certeza === "number" ? parsed.nivel_certeza : 50,
      resultados_ia: parsed,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
    return parsed;
  });

// --- Admin ---
export const adminUpsertCareer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      nombre: z.string().min(1),
      descripcion: z.string().optional(),
      duracion: z.string().optional(),
      habilidades: z.array(z.string()).default([]),
      salario_promedio: z.string().optional(),
      demanda_laboral: z.string().optional(),
      area: z.string().optional(),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await supabaseAdmin.from("careers").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("careers").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteCareer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("careers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpsertUniversity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      nombre: z.string().min(1),
      ubicacion: z.string().optional(),
      pais: z.string().optional(),
      carreras: z.array(z.string()).default([]),
      costo: z.string().optional(),
      modalidad: z.string().optional(),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await supabaseAdmin.from("universities").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("universities").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteUniversity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("universities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ count: users }, { count: careers }, { count: unis }, { count: chats }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("careers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("universities").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("chat_messages").select("*", { count: "exact", head: true }),
    ]);
    return { users: users ?? 0, careers: careers ?? 0, universities: unis ?? 0, chatMessages: chats ?? 0 };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("profiles").select("id,nombre,email,pais,created_at").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const promoteSelfToAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ code: z.string() }).parse)
  .handler(async ({ data, context }) => {
    // Dev-only convenience: bootstrap first admin with a shared code.
    if (data.code !== "VOCUP-ADMIN") throw new Error("Código inválido");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
