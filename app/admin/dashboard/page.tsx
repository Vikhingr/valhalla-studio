import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { STAGES } from "@/lib/types";
import type { Client, Project, Task } from "@/lib/types";
import { Users, Briefcase, CheckSquare, CurrencyDollar, ArrowRight, Warning } from "@phosphor-icons/react/dist/ssr";

export const instant = false;

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

function daysUntil(date: string) {
  return Math.ceil((new Date(date + "T12:00:00").getTime() - Date.now()) / 86400000);
}

export default async function DashboardPage() {
  const db = await createServerClient();

  const [
    { data: clients },
    { data: projects },
    { data: tasks },
  ] = await Promise.all([
    db.from("clients").select("id"),
    db.from("projects").select("*, clients(name, company)").order("created_at", { ascending: false }),
    db.from("tasks").select("*, projects(id, name)").neq("status", "listo").order("created_at", { ascending: false }),
  ]);

  const allProjects = (projects ?? []) as (Project & { clients: Client | null })[];
  const allTasks = (tasks ?? []) as Task[];

  const activeProjects = allProjects.filter(
    (p) => !["cotizacion", "entrega", "cobranza", "mantenimiento"].includes(p.stage)
  );

  const urgentTasks = allTasks.filter((t) => t.priority === "alta");

  const pendingRevenue = allProjects.reduce((sum, p) => {
    const owed = (p.quoted_price ?? 0) - (p.paid_amount ?? 0);
    return sum + (owed > 0 ? owed : 0);
  }, 0);

  // Alerta RESICO — leer días configurados
  const { data: configData } = await db.from("configuracion").select("resico_alerta_1, resico_alerta_2, resico_alerta_3").eq("id", "global").single();
  const alertaDias = [
    configData?.resico_alerta_1 ?? 5,
    configData?.resico_alerta_2 ?? 10,
    configData?.resico_alerta_3 ?? 15,
  ].filter(Boolean).sort((a, b) => a - b);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14 = new Date(today.getTime() + 14 * 86400000);
  const upcomingDeadlines = allProjects
    .filter((p) => {
      if (!p.deadline) return false;
      const d = new Date(p.deadline + "T12:00:00");
      return d >= today && d <= in14 && p.stage !== "entrega";
    })
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!));

  const stageCounts = STAGES.map((s) => ({
    ...s,
    count: allProjects.filter((p) => p.stage === s.id).length,
  })).filter((s) => s.count > 0);

  const blockingTasks = allTasks.filter((t) => t.depends_on === "client" && t.status !== "listo");

  // Calcular si hoy es día de alerta RESICO
  const diaHoy = today.getDate();
  const mesHoy = today.getMonth() + 1;
  const añoHoy = today.getFullYear();
  const esDiaAlerta = alertaDias.includes(diaHoy);
  const MESES_ES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const mesDeclaracion = mesHoy === 12 ? `Enero ${añoHoy + 1}` : `${MESES_ES[mesHoy + 1]} ${añoHoy}`;
  const diasRestantes = 17 - diaHoy;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
      <style>{`
        .dash-stat-card:hover { border-color: oklch(0.38 0.03 280) !important; }
        .dash-deadline-link:hover { background: var(--surface-2) !important; }
      `}</style>

      {/* Alerta RESICO */}
      {esDiaAlerta && diasRestantes > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "oklch(0.22 0.08 60 / 0.2)", border: "1px solid oklch(0.65 0.18 60 / 0.5)", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
          <Warning size={20} weight="fill" style={{ color: "oklch(0.80 0.18 60)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "oklch(0.85 0.15 60)" }}>
              Declaración RESICO — faltan {diasRestantes} día{diasRestantes !== 1 ? "s" : ""} para el día 17
            </div>
            <div style={{ fontSize: 12, color: "oklch(0.72 0.12 60)", marginTop: 2 }}>
              Ingresa al módulo RESICO para ver tu ISR e IVA de {MESES_ES[mesHoy]} y declarar antes del 17 de {mesDeclaracion}.
            </div>
          </div>
          <a href="/admin/resico"
            style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 7, background: "oklch(0.65 0.18 60)", color: "white", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            Ver RESICO →
          </a>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
          {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Clientes", value: clients?.length ?? 0, icon: Users, href: "/admin/clientes", color: "oklch(0.65 0.15 200)" },
          { label: "Proyectos activos", value: activeProjects.length, icon: Briefcase, href: "/admin/proyectos", color: "var(--violet-light)" },
          { label: "Pendientes urgentes", value: urgentTasks.length, icon: CheckSquare, href: "/admin/pendientes", color: "oklch(0.65 0.18 25)" },
          { label: "Cobro pendiente", value: fmt(pendingRevenue), icon: CurrencyDollar, href: "/admin/proyectos", color: "oklch(0.70 0.18 160)" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="dash-stat-card"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "16px 18px",
              textDecoration: "none",
              display: "block",
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={16} weight="fill" style={{ color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>{value}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Upcoming deadlines */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Entregas próximas (14 días)</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{upcomingDeadlines.length}</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {upcomingDeadlines.length === 0 ? (
              <p style={{ padding: "12px 18px", fontSize: 13, color: "var(--muted)" }}>Sin entregas próximas.</p>
            ) : (
              upcomingDeadlines.map((p) => {
                const days = daysUntil(p.deadline!);
                const urgent = days <= 3;
                return (
                  <Link
                    key={p.id}
                    href={`/admin/proyectos/${p.id}`}
                    className="dash-deadline-link"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", textDecoration: "none", transition: "background 0.1s" }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                        {(p.clients as Client | null)?.name ?? "Sin cliente"}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: urgent ? "oklch(0.70 0.18 25)" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      {urgent && <Warning size={12} weight="fill" />}
                      {days === 0 ? "Hoy" : days === 1 ? "Mañana" : `${days} días`}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Urgent tasks */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Pendientes — Alta prioridad</span>
            <Link href="/admin/pendientes" style={{ fontSize: 11, color: "var(--violet-light)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ padding: "8px 0" }}>
            {urgentTasks.length === 0 ? (
              <p style={{ padding: "12px 18px", fontSize: 13, color: "var(--muted)" }}>Sin pendientes urgentes.</p>
            ) : (
              urgentTasks.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: t.depends_on === "client" ? "oklch(0.65 0.15 60)" : "oklch(0.65 0.18 25)",
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.title}
                    </div>
                    {t.projects && (
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                        {(t.projects as { name: string }).name}
                      </div>
                    )}
                  </div>
                  {t.depends_on === "client" && (
                    <span style={{ fontSize: 10, color: "oklch(0.65 0.15 60)", background: "oklch(0.65 0.15 60 / 0.12)", padding: "2px 7px", borderRadius: 100, flexShrink: 0 }}>
                      Cliente
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stage distribution */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 14 }}>Proyectos por etapa</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {stageCounts.map((s) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 100, padding: "5px 12px",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{s.count}</span>
            </div>
          ))}
          {stageCounts.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin proyectos aún.</p>
          )}
        </div>
      </div>

      {blockingTasks.length > 0 && (
        <div style={{
          marginTop: 20,
          background: "oklch(0.65 0.15 60 / 0.08)",
          border: "1px solid oklch(0.65 0.15 60 / 0.3)",
          borderRadius: 10, padding: "14px 18px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Warning size={16} weight="fill" style={{ color: "oklch(0.70 0.18 60)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "oklch(0.80 0.08 60)" }}>
            <strong>{blockingTasks.length}</strong> pendiente{blockingTasks.length > 1 ? "s están bloqueados" : " está bloqueado"} esperando respuesta del cliente.
          </span>
          <Link href="/admin/pendientes" style={{ marginLeft: "auto", fontSize: 12, color: "oklch(0.70 0.18 60)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
            Ver →
          </Link>
        </div>
      )}
    </div>
  );
}
