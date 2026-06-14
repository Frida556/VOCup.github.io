import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminUpsertCareer,
  adminDeleteCareer,
  adminUpsertUniversity,
  adminDeleteUniversity,
  adminMetrics,
  adminListUsers,
  promoteSelfToAdmin,
} from "@/lib/voc.functions";
import { toast } from "sonner";
import { Users, GraduationCap, Building2, MessageSquare, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: Admin,
});

function Admin() {
  const { user, loading } = useCurrentUser();
  const promote = useServerFn(promoteSelfToAdmin);
  const [code, setCode] = useState("");

  if (loading) return <AppShell><div className="text-muted-foreground">Cargando…</div></AppShell>;
  if (!user) return null;

  if (!user.isAdmin) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto mt-10 rounded-2xl border bg-card p-6 text-center">
          <h2 className="font-semibold text-deep text-lg">Acceso de administrador</h2>
          <p className="text-sm text-muted-foreground mt-1">Ingresa el código para activar tu acceso.</p>
          <div className="mt-4 flex gap-2">
            <Input placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button onClick={async () => {
              try { await promote({ data: { code } }); toast.success("¡Eres admin!"); location.reload(); }
              catch (e: any) { toast.error(e.message); }
            }}>Activar</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Pista para demo: <code>VOCUP-ADMIN</code></p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell isAdmin>
      <h1 className="text-2xl font-bold text-deep">Panel admin</h1>
      <p className="text-muted-foreground mb-5">Gestiona el contenido de VocUp.</p>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="careers">Carreras</TabsTrigger>
          <TabsTrigger value="unis">Universidades</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="metrics"><Metrics /></TabsContent>
        <TabsContent value="careers"><CareersAdmin /></TabsContent>
        <TabsContent value="unis"><UnisAdmin /></TabsContent>
        <TabsContent value="users"><UsersAdmin /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Metrics() {
  const get = useServerFn(adminMetrics);
  const [m, setM] = useState<any>(null);
  useEffect(() => { get({}).then(setM).catch(() => {}); }, [get]);
  if (!m) return <div className="text-muted-foreground mt-4">Cargando…</div>;
  const tiles = [
    { label: "Usuarios", value: m.users, icon: Users },
    { label: "Carreras", value: m.careers, icon: GraduationCap },
    { label: "Universidades", value: m.universities, icon: Building2 },
    { label: "Mensajes chat", value: m.chatMessages, icon: MessageSquare },
  ];
  return (
    <div className="grid md:grid-cols-4 gap-4 mt-5">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border bg-card-soft p-5">
          <t.icon className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground mt-2">{t.label}</p>
          <p className="text-3xl font-bold text-deep">{t.value}</p>
        </div>
      ))}
    </div>
  );
}

function CareersAdmin() {
  const upsert = useServerFn(adminUpsertCareer);
  const del = useServerFn(adminDeleteCareer);
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ nombre: "", descripcion: "", duracion: "", area: "", salario_promedio: "", demanda_laboral: "", habilidades: [] });

  async function load() {
    const { data } = await supabase.from("careers").select("*").order("nombre");
    setList(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsert({ data: { ...form, habilidades: (form.habilidades || "").toString().split(",").map((s: string) => s.trim()).filter(Boolean) } });
      toast.success("Guardado");
      setForm({ nombre: "", descripcion: "", duracion: "", area: "", salario_promedio: "", demanda_laboral: "", habilidades: [] });
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-5">
      <form onSubmit={submit} className="rounded-2xl border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-deep flex items-center gap-1"><Plus className="h-4 w-4" /> Nueva carrera</h3>
        <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
        <div><Label>Área</Label><Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
        <div><Label>Descripción</Label><Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Duración</Label><Input value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} /></div>
          <div><Label>Demanda</Label><Input value={form.demanda_laboral} onChange={(e) => setForm({ ...form, demanda_laboral: e.target.value })} /></div>
        </div>
        <div><Label>Salario promedio</Label><Input value={form.salario_promedio} onChange={(e) => setForm({ ...form, salario_promedio: e.target.value })} /></div>
        <div><Label>Habilidades (separadas por coma)</Label><Input value={form.habilidades} onChange={(e) => setForm({ ...form, habilidades: e.target.value })} /></div>
        <Button type="submit">Crear</Button>
      </form>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {list.map((c) => (
          <div key={c.id} className="flex justify-between items-center rounded-xl border bg-card p-3">
            <div>
              <p className="font-medium text-deep">{c.nombre}</p>
              <p className="text-xs text-muted-foreground">{c.area}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={async () => { await del({ data: { id: c.id } }); load(); toast("Eliminada"); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnisAdmin() {
  const upsert = useServerFn(adminUpsertUniversity);
  const del = useServerFn(adminDeleteUniversity);
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ nombre: "", ubicacion: "", pais: "", costo: "", modalidad: "", carreras: "" });
  async function load() { const { data } = await supabase.from("universities").select("*").order("nombre"); setList(data ?? []); }
  useEffect(() => { load(); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upsert({ data: { ...form, carreras: form.carreras.toString().split(",").map((s: string) => s.trim()).filter(Boolean) } });
      toast.success("Guardada");
      setForm({ nombre: "", ubicacion: "", pais: "", costo: "", modalidad: "", carreras: "" });
      load();
    } catch (e: any) { toast.error(e.message); }
  }
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-5">
      <form onSubmit={submit} className="rounded-2xl border bg-card p-5 space-y-3">
        <h3 className="font-semibold text-deep flex items-center gap-1"><Plus className="h-4 w-4" /> Nueva universidad</h3>
        <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Ubicación</Label><Input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} /></div>
          <div><Label>País</Label><Input value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Costo</Label><Input value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} /></div>
          <div><Label>Modalidad</Label><Input value={form.modalidad} onChange={(e) => setForm({ ...form, modalidad: e.target.value })} /></div>
        </div>
        <div><Label>Carreras (separadas por coma)</Label><Input value={form.carreras} onChange={(e) => setForm({ ...form, carreras: e.target.value })} /></div>
        <Button type="submit">Crear</Button>
      </form>
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {list.map((u) => (
          <div key={u.id} className="flex justify-between items-center rounded-xl border bg-card p-3">
            <div>
              <p className="font-medium text-deep">{u.nombre}</p>
              <p className="text-xs text-muted-foreground">{u.ubicacion}, {u.pais}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={async () => { await del({ data: { id: u.id } }); load(); toast("Eliminada"); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersAdmin() {
  const get = useServerFn(adminListUsers);
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { get({}).then(setUsers).catch(() => {}); }, [get]);
  return (
    <div className="mt-5 rounded-2xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            <th className="p-3">Nombre</th><th className="p-3">Email</th><th className="p-3">País</th><th className="p-3">Registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-3 font-medium text-deep">{u.nombre}</td>
              <td className="p-3 text-muted-foreground">{u.email}</td>
              <td className="p-3">{u.pais ?? "—"}</td>
              <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
