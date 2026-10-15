import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STAGES } from "@/lib/types";
import type { Task } from "@/lib/types";
import { ArrowLeft, Key, Globe, CheckCircle, Circle, ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

export const instant = false;

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default async function ProyectoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createServerClient();

  const [{ data: project }, { data: tasks }] = await Promise.all([
    db.from("projects").select("*, clients(id, name, company, email)").eq("id", id).single(),
    db.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ]);

  if (!project) notFound();

  const currentStageIndex = STAGES.findIndex((s) => s.id === project.stage);
  const pendingBalance = (project.quoted_price ?? 0) - (project.paid_amount ?? 0);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      <Link href="/admin/proyectos" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 20 }}>
        <ArrowLeft size={14} /> Proyectos
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 6 }}>{project.name}</h1>
          {project.clients && (
            <Link href={`/admin/clientes/${(project.clients as { id: string }).id}`} style={{ fontSize: 13, color: "var(--violet-light)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
              {(project.clients as { name: string }).name}
              {(project.clients as { company: string | null }).company && ` · ${(project.clients as { company: string }).company}`}
              <ArrowRightIcon size={12} />
            </Link>
          )}
        </div>
        <Link href={`/admin/proyectos`} style={{ textDecoration: "none" }}>
          {/* Back handled above */}
        </Link>
      </div>

      {/* Stage timeline */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Etapa del proyecto</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {STAGES.map((s, i) => {
            const done = i < currentStageIndex;
            const active = i === currentStageIndex;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: active ? s.color : done ? "oklch(0.70 0.18 160)" : "var(--surface-2)",
                    border: `2px solid ${active ? s.color : done ? "oklch(0.70 0.18 160)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {done ? <CheckCircle size={14} weight="fill" style={{ color: "#fff" }} /> : <Circle size={10} style={{ color: active ? "#fff" : "var(--muted)" }} weight={active ? "fill" : "regular"} />}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? s.color : done ? "var(--ink-2)" : "var(--muted)", whiteSpace: "nowrap" }}>
                    {s.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ width: 24, height: 2, background: i < currentStageIndex ? "oklch(0.70 0.18 160)" : "var(--border)", marginBottom: 18, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Fecha inicio", value: project.start_date ? new Date(project.start_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : null },
          { label: "Fecha límite", value: project.deadline ? new Date(project.deadline + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : null },
          { label: "Precio cotizado", value: project.quoted_price ? fmt(project.quoted_price) : null },
          { label: "Cobrado", value: project.paid_amount ? fmt(project.paid_amount) : "$0" },
          { label: "Pendiente de cobro", value: pendingBalance > 0 ? fmt(pendingBalance) : null },
        ].filter((item) => item.value !== null).map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: label === "Pendiente de cobro" ? "oklch(0.65 0.12 40)" : "var(--ink)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Notes */}
        {(project.notes || project.project_url || project.protonpass_ref) && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Detalles</div>
            {project.project_url && (
              <a href={project.project_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--violet-light)", textDecoration: "none", marginBottom: 8 }}>
                <Globe size={13} /> {project.project_url}
              </a>
            )}
            {project.protonpass_ref && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--violet-light)", background: "oklch(0.58 0.22 293 / 0.12)", padding: "4px 10px", borderRadius: 100, marginBottom: 8 }}>
                <Key size={11} /> {project.protonpass_ref}
              </div>
            )}
            {project.notes && <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>{project.notes}</p>}
          </div>
        )}

        {/* Tasks for this project */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Tareas</span>
            <Link href="/admin/pendientes" style={{ fontSize: 11, color: "var(--violet-light)", textDecoration: "none" }}>Ver pendientes →</Link>
          </div>
          <div style={{ padding: "8px 0" }}>
            {(!tasks || tasks.length === 0) ? (
              <p style={{ padding: "12px 18px", fontSize: 13, color: "var(--muted)" }}>Sin tareas.</p>
            ) : (
              (tasks as Task[]).slice(0, 6).map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.priority === "alta" ? "oklch(0.65 0.18 25)" : t.priority === "media" ? "oklch(0.65 0.15 60)" : "var(--muted)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: t.status === "listo" ? "var(--muted)" : "var(--ink-2)", flex: 1, textDecoration: t.status === "listo" ? "line-through" : "none" }}>{t.title}</span>
                  {t.depends_on === "client" && <span style={{ fontSize: 10, color: "oklch(0.65 0.15 60)", background: "oklch(0.65 0.15 60 / 0.12)", padding: "2px 7px", borderRadius: 100 }}>Cliente</span>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
