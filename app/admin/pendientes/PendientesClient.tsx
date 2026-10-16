"use client";
import { useState } from "react";
import type { Task, TaskStatus, TaskPriority, TaskDependsOn } from "@/lib/types";
import { PRIORITY_COLORS, STATUS_LABELS } from "@/lib/types";
import { Plus, X, Trash, Check } from "@phosphor-icons/react";

const EMPTY: Omit<Task, "id" | "created_at" | "projects"> = {
  title: "",
  project_id: null,
  depends_on: "me",
  priority: "media",
  status: "pendiente",
  due_date: null,
};

const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 12px", color: "var(--ink)", fontSize: 13, outline: "none", fontFamily: "inherit" };
const radioStyle = (active: boolean, color: string): React.CSSProperties => ({
  padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: active ? 600 : 500,
  cursor: "pointer", border: `1px solid ${active ? color : "var(--border)"}`,
  background: active ? `${color.replace(")", " / 0.15)")}` : "transparent",
  color: active ? color : "var(--ink-2)",
});

type TaskWithProject = Task & { projects: { id: string; name: string } | null };

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "pendiente",   label: "Pendiente" },
  { status: "en_progreso", label: "En progreso" },
  { status: "listo",       label: "Listo" },
];

export default function PendientesClient({
  initial,
  projects,
}: {
  initial: TaskWithProject[];
  projects: { id: string; name: string }[];
}) {
  const [tasks, setTasks] = useState<TaskWithProject[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });
  const [filter, setFilter] = useState<"all" | "me" | "client">("all");
  const [saving, setSaving] = useState(false);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.depends_on === filter);

  async function handleCreate() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, project_id: form.project_id || null, due_date: form.due_date || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data, ...prev]);
        setShowForm(false);
        setForm({ ...EMPTY });
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(task: TaskWithProject) {
    const next: TaskStatus = task.status === "pendiente" ? "en_progreso" : task.status === "en_progreso" ? "listo" : "pendiente";
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const statusDot = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      pendiente: "var(--muted)",
      en_progreso: "var(--violet-light)",
      listo: "oklch(0.70 0.18 160)",
    };
    return colors[status];
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Pendientes</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
            {tasks.filter((t) => t.status !== "listo").length} activos
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px" }}>
          <Plus size={15} weight="bold" /> Nueva tarea
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[
          { id: "all", label: "Todos" },
          { id: "me", label: "Yo" },
          { id: "client", label: "Cliente" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id as typeof filter)}
            style={{
              fontSize: 12, fontWeight: filter === id ? 600 : 500,
              color: filter === id ? "#fff" : "var(--ink-2)",
              background: filter === id ? "var(--violet)" : "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 100, padding: "5px 14px", cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="kanban-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {COLUMNS.map(({ status, label }) => {
          const col = filtered.filter((t) => t.status === status);
          return (
            <div key={status}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusDot(status), display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>{col.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "12px 12px 10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <button
                        onClick={() => toggleStatus(t)}
                        title="Cambiar estado"
                        style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                          border: `2px solid ${t.status === "listo" ? "oklch(0.70 0.18 160)" : "var(--border)"}`,
                          background: t.status === "listo" ? "oklch(0.70 0.18 160)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {t.status === "listo" && <Check size={10} weight="bold" style={{ color: "#fff" }} />}
                      </button>
                      <span style={{ fontSize: 13, color: t.status === "listo" ? "var(--muted)" : "var(--ink)", fontWeight: 500, flex: 1, lineHeight: 1.4, textDecoration: t.status === "listo" ? "line-through" : "none" }}>
                        {t.title}
                      </span>
                      <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2, opacity: 0.5 }} title="Eliminar">
                        <Trash size={13} />
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: PRIORITY_COLORS[t.priority],
                        background: `${PRIORITY_COLORS[t.priority].replace(")", " / 0.12)")}`,
                        padding: "2px 7px", borderRadius: 100,
                      }}>
                        {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                      </span>
                      {t.depends_on === "client" && (
                        <span style={{ fontSize: 10, color: "oklch(0.65 0.15 60)", background: "oklch(0.65 0.15 60 / 0.12)", padding: "2px 7px", borderRadius: 100 }}>
                          Cliente
                        </span>
                      )}
                      {t.projects && (
                        <span style={{ fontSize: 10, color: "var(--muted)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: 100 }}>
                          {(t.projects as { name: string }).name}
                        </span>
                      )}
                      {t.due_date && (
                        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>
                          {new Date(t.due_date + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {col.length === 0 && (
                  <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: "20px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Sin tareas</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New task modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }} onClick={() => setShowForm(false)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>Nueva tarea</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input autoFocus required style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="¿Qué hay que hacer?" />
              </div>
              <div>
                <label style={labelStyle}>Proyecto</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.project_id ?? ""} onChange={(e) => setForm({ ...form, project_id: e.target.value || null })}>
                  <option value="">Sin proyecto</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>¿Depende de?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["me", "client"] as TaskDependsOn[]).map((v) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, depends_on: v })} style={radioStyle(form.depends_on === v, "var(--violet-light)")}>
                      {v === "me" ? "Yo" : "Cliente"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Prioridad</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["alta", "media", "baja"] as TaskPriority[]).map((v) => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, priority: v })} style={radioStyle(form.priority === v, PRIORITY_COLORS[v])}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
                  {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fecha límite</label>
                <input type="date" style={inputStyle} value={form.due_date ?? ""} onChange={(e) => setForm({ ...form, due_date: e.target.value || null })} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: "9px 20px" }}>Cancelar</button>
                <button onClick={handleCreate} disabled={saving || !form.title.trim()} className="btn-primary" style={{ padding: "9px 20px", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .kanban-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
