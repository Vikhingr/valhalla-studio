"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, ProjectStage } from "@/lib/types";

type ClientSummary = { id: string; name: string; company: string | null };
import { STAGES } from "@/lib/types";
import { Plus, PencilSimple, Trash, X, Key } from "@phosphor-icons/react";

const EMPTY_FORM = {
  name: "", client_id: "", stage: "cotizacion" as ProjectStage,
  start_date: "", deadline: "", quoted_price: "", paid_amount: "",
  project_url: "", notes: "", protonpass_ref: "",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }} onClick={onClose}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 12px", color: "var(--ink)", fontSize: 13, outline: "none", fontFamily: "inherit" };

type ProjectWithClient = Project & { clients: ClientSummary | null };

export default function ProyectosClient({ initial, clients }: { initial: ProjectWithClient[]; clients: ClientSummary[] }) {
  const [projects, setProjects] = useState<ProjectWithClient[]>(initial);
  const [filter, setFilter] = useState<string>("all");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const filtered = filter === "all" ? projects : projects.filter((p) => p.stage === filter);

  function openCreate() { setForm(EMPTY_FORM); setEditing(null); setModal("create"); }
  function openEdit(p: Project) {
    setForm({
      name: p.name, client_id: p.client_id ?? "",
      stage: p.stage, start_date: p.start_date ?? "",
      deadline: p.deadline ?? "", quoted_price: p.quoted_price?.toString() ?? "",
      paid_amount: p.paid_amount?.toString() ?? "", project_url: p.project_url ?? "",
      notes: p.notes ?? "", protonpass_ref: p.protonpass_ref ?? "",
    });
    setEditing(p); setModal("edit");
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await fetch("/api/admin/proyectos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { const data = await res.json(); setProjects((prev) => [data, ...prev]); }
      } else if (editing) {
        const res = await fetch(`/api/admin/proyectos/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { const data = await res.json(); setProjects((prev) => prev.map((p) => (p.id === editing.id ? data : p))); }
      }
      setModal(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("¿Eliminar este proyecto? También se eliminarán sus tareas.")) return;
    const res = await fetch(`/api/admin/proyectos/${id}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const formEl = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><label style={labelStyle}>Nombre del proyecto *</label><input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Sitio web Pepe's Barber Shop" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Cliente</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="">Sin cliente</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Etapa</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as ProjectStage })}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Fecha inicio</label><input type="date" style={inputStyle} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
        <div><label style={labelStyle}>Fecha límite</label><input type="date" style={inputStyle} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Precio cotizado (MXN)</label><input type="number" style={inputStyle} value={form.quoted_price} onChange={(e) => setForm({ ...form, quoted_price: e.target.value })} placeholder="18000" /></div>
        <div><label style={labelStyle}>Monto cobrado (MXN)</label><input type="number" style={inputStyle} value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} placeholder="9000" /></div>
      </div>
      <div><label style={labelStyle}>URL del proyecto</label><input type="url" style={inputStyle} value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} placeholder="https://cliente.com" /></div>
      <div>
        <label style={labelStyle}>Referencia ProtonPass</label>
        <div style={{ position: "relative" }}>
          <Key size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input style={{ ...inputStyle, paddingLeft: 30 }} value={form.protonpass_ref} onChange={(e) => setForm({ ...form, protonpass_ref: e.target.value })} placeholder="Carpeta Clientes/NombreCliente" />
        </div>
      </div>
      <div><label style={labelStyle}>Notas</label><textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={() => setModal(null)} className="btn-secondary" style={{ padding: "9px 20px" }}>Cancelar</button>
        <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn-primary" style={{ padding: "9px 20px", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Proyectos</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{projects.length} proyecto{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={openCreate} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px" }}>
            <Plus size={15} weight="bold" /> Nuevo proyecto
          </button>
        </div>

        {/* Stage filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {[{ id: "all", label: "Todos", color: "var(--ink-2)" }, ...STAGES].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              style={{
                fontSize: 12, fontWeight: filter === s.id ? 600 : 500,
                color: filter === s.id ? "#fff" : "var(--ink-2)",
                background: filter === s.id ? "var(--violet)" : "var(--surface)",
                border: "1px solid var(--border)", borderRadius: 100, padding: "5px 14px", cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: 14 }}>Sin proyectos{filter !== "all" ? " en esta etapa" : ""}.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((p) => {
              const stage = STAGES.find((s) => s.id === p.stage)!;
              const pending = (p.quoted_price ?? 0) - (p.paid_amount ?? 0);
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/admin/proyectos/${p.id}`)}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", cursor: "pointer", transition: "border-color 0.15s", display: "flex", alignItems: "center", gap: 16 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(0.38 0.03 280)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {p.clients?.name ?? "Sin cliente"}
                      {p.deadline && ` · Entrega: ${new Date(p.deadline + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    {p.quoted_price && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                          {p.quoted_price.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}
                        </div>
                        {pending > 0 && (
                          <div style={{ fontSize: 11, color: "oklch(0.65 0.12 40)" }}>
                            Pendiente: {pending.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}
                          </div>
                        )}
                      </div>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, color: stage.color, background: `oklch(from ${stage.color} l c h / 0.12)`, padding: "4px 10px", borderRadius: 100 }}>
                      {stage.label}
                    </span>
                    <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }} title="Editar"><PencilSimple size={14} /></button>
                      <button onClick={(e) => handleDelete(p.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }} title="Eliminar"><Trash size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo proyecto" : "Editar proyecto"} onClose={() => setModal(null)}>
          {formEl}
        </Modal>
      )}
    </>
  );
}
