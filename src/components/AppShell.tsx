import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessageSquare,
  User,
  GraduationCap,
  Building2,
  Heart,
  Sparkles,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const nav = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/chat", label: "Chat con Voc", icon: MessageSquare },
  { to: "/perfil", label: "Mi perfil", icon: User },
  { to: "/carreras", label: "Carreras", icon: GraduationCap },
  { to: "/universidades", label: "Universidades", icon: Building2 },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/mascota", label: "Mi mascota", icon: Sparkles },
] as const;

export function AppShell({ children, isAdmin }: { children: ReactNode; isAdmin?: boolean }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const items = isAdmin ? [...nav, { to: "/admin", label: "Admin", icon: Shield }] : nav;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-sidebar/95 backdrop-blur transition-transform md:translate-x-0 md:static",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-5 py-5 border-b">
          <Logo size={32} />
          <div className="text-[11px] text-muted-foreground mt-1 ml-1">Encuentra tu vocación</div>
        </div>
        <nav className="p-3 space-y-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-3 left-3 right-3">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between border-b px-4 py-3 bg-card">
          <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-muted" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
          <Logo size={26} />
          <div className="w-9" />
        </header>
        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
