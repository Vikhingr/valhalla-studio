"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types";
import { Plus, PencilSimple, Trash, X, Key } from "@phosphor-icons/react";

const EMPTY = { name: "", company: "", email: "", phone: "", notes: "", protonpass_ref: "" };

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 7,
  padding: "9px 12px",
  color: "var(--ink)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

export default function ClientesClient({ initial }: { initial: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  function openCreate() {
    setForm(EMPTY);
    setEditing(null);
    setSaveError(null);
    setModal("create");
  }

  function openEdit(c: Client) {
    setForm({
      name: c.name,
      company: c.company ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      notes: c.notes ?? "",
      protonpass_ref: c.protonpass_ref ?? "",
    });
    setEditing(c);
    setSaveError(null);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      if (modal === "create") {
        const res = await fetch("/api/admin/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setSaveError(data.error ?? "Error al guardar"); return; }
        setClients((prev) => [data, ...prev]);
      } else if (editing) {
        const res = await fetch(`/api/admin/clientes/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setSaveError(data.error ?? "Error al guardar"); return; }
        setClients((prev) => prev.map((c) => (c.id === editing.id ? data : c)));
      }
      setModal(null);
    } catch (e) {
      setSaveError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/clientes/${id}`, { method: "DELETE" });
    if (res.ok) setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  const formFields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Nombre *">
        <input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del contacto" />
      </Field>
      <Field label="Empresa">
        <input style={inputStyle} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nombre de la empresa" />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Email">
          <input type="email" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@ejemplo.com" />
        </Field>
        <Field label="Teléfono">
          <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+52 55 0000 0000" />
        </Field>
      </div>
      <Field label="Referencia ProtonPass">
        <div style={{ position: "relative" }}>
          <Key size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            style={{ ...inputStyle, paddingLeft: 30 }}
            value={form.protonpass_ref}
            onChange={(e) => setForm({ ...form, protonpass_ref: e.target.value })}
            placeholder="Carpeta Clientes/NombreCliente"
          />
        </div>
      </Field>
      <Field label="Notas">
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Notas internas sobre el cliente..."
        />
      </Field>
      {saveError && (
        <div style={{ background: "oklch(0.30 0.10 25 / 0.2)", border: "1px solid oklch(0.50 0.15 25 / 0.4)", borderRadius: 7, padding: "9px 12px", fontSize: 12, color: "oklch(0.80 0.12 25)" }}>
          {saveError}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={() => setModal(null)} className="btn-secondary" style={{ padding: "9px 20px" }}>
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn-primary" style={{ padding: "9px 20px", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Clientes</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{clients.length} cliente{clients.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={openCreate} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px" }}>
            <Plus size={15} weight="bold" />
            Nuevo cliente
          </button>
        </div>

        {clients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
            <p style={{ fontSize: 14 }}>Aún no tienes clientes.</p>
            <button onClick={openCreate} style={{ marginTop: 12, fontSize: 13, color: "var(--violet-light)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Agrega el primero
            </button>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Nombre", "Empresa", "Email", "ProtonPass", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.1s" }}
                    onClick={() => router.push(`/admin/clientes/${c.id}`)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-2)" }}>{c.company ?? "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>{c.email ?? "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {c.protonpass_ref ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--violet-light)", background: "oklch(0.58 0.22 293 / 0.12)", padding: "3px 9px", borderRadius: 100 }}>
                          <Key size={10} /> {c.protonpass_ref}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => openEdit(c)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }}
                          title="Editar"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }}
                          title="Eliminar"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo cliente" : "Editar cliente"} onClose={() => setModal(null)}>
          {formFields}
        </Modal>
      )}
    </>
  );
}
