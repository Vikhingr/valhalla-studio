"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, Eye, FilePdf, Prohibit, Warning, CheckCircle, ArrowRight,
} from "@phosphor-icons/react";
import type { Factura, Client } from "@/lib/types";
import { USOS_CFDI, FORMAS_PAGO, REGIMENES_FISCALES, CATALOGO_SERVICIOS, USOS_CFDI_DEFAULT } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
}

// RFC de 12 caracteres = Persona Moral → aplica retención de IVA
function detectaPM(rfc: string): boolean {
  const clean = rfc.replace(/\s/g, "").toUpperCase();
  return clean.length === 12 && clean !== "XAXX010101000" && clean !== "XEXX010101000";
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
  boxSizing: "border-box",
};

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

const EMPTY_FORM = {
  client_id: "",
  tipo_servicio: "landing",
  descripcion: "",
  fecha: new Date().toISOString().split("T")[0],
  subtotal: "",
  with_iva: true,
  forma_pago: "99",
  uso_cfdi: "G03",
  receptor_rfc: "XAXX010101000",
  receptor_nombre: "",
  receptor_regimen: "616",
  receptor_cp: "00000",
};

type FormState = typeof EMPTY_FORM;

interface Props {
  initial: Factura[];
  clients: Pick<Client, "id" | "name" | "company" | "rfc" | "nombre_fiscal" | "regimen_fiscal" | "codigo_postal">[];
  facturapiconfigured: boolean;
  emisorNombre: string;
  usosCfdiVisibles: string[] | null;
}

export default function FacturasClient({ initial, clients, facturapiconfigured, emisorNombre, usosCfdiVisibles }: Props) {
  const [facturas, setFacturas] = useState<Factura[]>(initial);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [timbradoError, setTimbradoError] = useState<{ message: string; facturaId: string } | null>(null);
  const router = useRouter();

  const usosFiltrados = USOS_CFDI.filter((u) => {
    const visibles = usosCfdiVisibles ?? USOS_CFDI_DEFAULT;
    return visibles.includes(u.value);
  });

  function set(key: keyof FormState, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleClientChange(clientId: string) {
    set("client_id", clientId);
    const c = clients.find((cl) => cl.id === clientId);
    if (c) {
      set("receptor_nombre", c.nombre_fiscal || c.name);
      set("receptor_rfc", c.rfc || "XAXX010101000");
      set("receptor_regimen", c.regimen_fiscal || "616");
      set("receptor_cp", c.codigo_postal || "00000");
    }
  }

  function handleTipoServicioChange(tipoId: string) {
    set("tipo_servicio", tipoId);
    const srv = CATALOGO_SERVICIOS.find((s) => s.id === tipoId);
    if (srv && !form.descripcion.trim()) {
      set("descripcion", srv.label);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setTimbradoError(null);
    setModal(true);
  }

  function closeModal() {
    setModal(false);
    setTimbradoError(null);
  }

  const subtotal = Number(form.subtotal) || 0;
  const iva = form.with_iva ? Math.round(subtotal * 0.16 * 100) / 100 : 0;
  const esPM = detectaPM(form.receptor_rfc);
  const ivaRetenido = iva > 0 && esPM ? Math.round(subtotal * 0.16 * (2 / 3) * 100) / 100 : 0;
  const total = subtotal + iva - ivaRetenido;

  async function handleSave() {
    if (!form.receptor_nombre.trim() || !form.descripcion.trim() || subtotal <= 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? "Error al crear factura"); return; }
      setFacturas((prev) => [data, ...prev]);
      if (data.facturapi_error) {
        // Timbrado falló — factura guardada como PDF, mostrar error en modal
        setTimbradoError({ message: data.facturapi_error, facturaId: data.id });
      } else {
        setModal(false);
      }
    } catch {
      setSaveError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("¿Cancelar esta factura? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/admin/facturas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelada" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFacturas((prev) => prev.map((f) => (f.id === id ? updated : f)));
    }
  }

  const totalActivas = facturas.filter((f) => f.status === "activa").reduce((s, f) => s + f.total, 0);

  return (
    <>
      <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Facturas</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
              {facturas.length} factura{facturas.length !== 1 ? "s" : ""}
              {facturas.length > 0 && <> · <strong style={{ color: "var(--ink)" }}>{fmt(totalActivas)}</strong> emitidos</>}
            </p>
            {!facturapiconfigured && (
              <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "oklch(0.65 0.12 40)", background: "oklch(0.65 0.12 40 / 0.1)", border: "1px solid oklch(0.65 0.12 40 / 0.3)", borderRadius: 100, padding: "4px 10px" }}>
                <Warning size={12} weight="fill" />
                Facturapi no configurado — se emitirán como PDF
              </div>
            )}
          </div>
          <button onClick={openCreate} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", flexShrink: 0 }}>
            <Plus size={15} weight="bold" /> Nueva factura
          </button>
        </div>

        {/* Lista */}
        {facturas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
            <FilePdf size={40} weight="thin" style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 14 }}>Sin facturas aún.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Crea la primera desde el botón de arriba.</p>
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Fecha", "Cliente", "Concepto", "Total", "Tipo", "Estado", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr
                    key={f.id}
                    style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.1s" }}
                    onClick={() => router.push(`/admin/facturas/${f.id}`)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(f.fecha + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--ink-2)" }}>
                      {f.clients?.name ?? f.receptor_nombre}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", maxWidth: 220 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.descripcion}</span>
                      {f.cfdi_uuid && (
                        <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", opacity: 0.7 }}>{f.cfdi_uuid.substring(0, 18)}…</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap" }}>
                      {fmt(f.total)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          display: "inline-block", fontSize: 11, fontWeight: 600, borderRadius: 100, padding: "2px 9px",
                          color: f.tipo === "cfdi" ? "oklch(0.68 0.18 293)" : "oklch(0.65 0.12 40)",
                          background: f.tipo === "cfdi" ? "oklch(0.68 0.18 293 / 0.1)" : "oklch(0.65 0.12 40 / 0.1)",
                          border: `1px solid ${f.tipo === "cfdi" ? "oklch(0.68 0.18 293 / 0.3)" : "oklch(0.65 0.12 40 / 0.3)"}`,
                        }}>
                          {f.tipo === "cfdi" ? "CFDI" : "PDF"}
                        </span>
                        {f.facturapi_error && (
                          <span title={f.facturapi_error} style={{ color: "oklch(0.70 0.18 30)", cursor: "help", display: "flex" }}>
                            <Warning size={13} weight="fill" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, borderRadius: 100, padding: "2px 9px",
                        color: f.status === "activa" ? "oklch(0.70 0.18 160)" : "var(--muted)",
                        background: f.status === "activa" ? "oklch(0.70 0.18 160 / 0.1)" : "var(--surface-2)",
                        border: `1px solid ${f.status === "activa" ? "oklch(0.70 0.18 160 / 0.3)" : "var(--border)"}`,
                      }}>
                        {f.status === "activa" ? <CheckCircle size={11} weight="fill" /> : <Prohibit size={11} />}
                        {f.status === "activa" ? "Activa" : "Cancelada"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => router.push(`/admin/facturas/${f.id}`)}
                          title="Ver factura"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }}
                        >
                          <Eye size={15} />
                        </button>
                        {f.status === "activa" && (
                          <button
                            onClick={() => handleCancel(f.id)}
                            title="Cancelar factura"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }}
                          >
                            <Prohibit size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear factura */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
          onClick={closeModal}
        >
          <div
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                {timbradoError ? "Error de timbrado" : "Nueva factura"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Panel de error de timbrado — reemplaza el form */}
            {timbradoError && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "oklch(0.22 0.05 25 / 0.15)", border: "1px solid oklch(0.50 0.15 25 / 0.35)", borderRadius: 8, padding: "14px 16px" }}>
                  <Warning size={18} weight="fill" style={{ color: "oklch(0.70 0.18 30)", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                      Facturapi no pudo timbrar el CFDI
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                      La factura fue guardada como <strong>PDF</strong>. Resuelve el error y vuelve a intentarlo desde Configuración.
                    </p>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "oklch(0.75 0.12 30)", wordBreak: "break-word", lineHeight: 1.6 }}>
                      {timbradoError.message}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, padding: "10px 14px", lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--ink)" }}>Causas comunes:</strong> API key incorrecta o expirada · RFC del receptor inválido · Datos fiscales incompletos en Configuración · Modo test sin credenciales CSD
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => router.push(`/admin/facturas/${timbradoError.facturaId}`)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                  >
                    Ver factura PDF <ArrowRight size={13} />
                  </button>
                  <button onClick={closeModal} className="btn-primary" style={{ padding: "9px 20px" }}>
                    Cerrar
                  </button>
                </div>
              </div>
            )}


            {!timbradoError && <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Cliente */}
              <Field label="Cliente">
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.client_id} onChange={(e) => handleClientChange(e.target.value)}>
                  <option value="">— Sin cliente vinculado —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</option>
                  ))}
                </select>
              </Field>

              {/* Tipo de servicio */}
              <Field label="Tipo de servicio">
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.tipo_servicio}
                  onChange={(e) => handleTipoServicioChange(e.target.value)}
                >
                  {CATALOGO_SERVICIOS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {(() => {
                  const srv = CATALOGO_SERVICIOS.find((s) => s.id === form.tipo_servicio);
                  return srv ? (
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                      Clave SAT: <code style={{ fontFamily: "monospace" }}>{srv.clave_prod_serv}</code> · Unidad: <code style={{ fontFamily: "monospace" }}>{srv.clave_unidad}</code>
                    </p>
                  ) : null;
                })()}
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Fecha">
                  <input type="date" style={inputStyle} value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
                </Field>
                <Field label="Subtotal (MXN)">
                  <input type="number" min="0" step="0.01" style={inputStyle} value={form.subtotal} onChange={(e) => set("subtotal", e.target.value)} placeholder="0.00" />
                </Field>
              </div>

              <Field label="Descripción del concepto">
                <input style={inputStyle} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Diseño y desarrollo de sitio web" />
              </Field>

              {/* IVA toggle + totales */}
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: (iva > 0 || esPM) ? 10 : 0 }}>
                  <div
                    onClick={() => set("with_iva", !form.with_iva)}
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                      border: `1.5px solid ${form.with_iva ? "var(--violet)" : "var(--border)"}`,
                      background: form.with_iva ? "var(--violet)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {form.with_iva && <CheckCircle size={13} weight="fill" style={{ color: "#fff" }} />}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>Agregar IVA 16%</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{fmt(total)}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Total a recibir</div>
                  </div>
                </div>

                {(iva > 0 || ivaRetenido > 0) && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                      <span>Subtotal</span><span>{fmt(subtotal)}</span>
                    </div>
                    {iva > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                        <span>+ IVA 16%</span><span>{fmt(iva)}</span>
                      </div>
                    )}
                    {ivaRetenido > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "oklch(0.65 0.15 200)" }}>
                        <span>− IVA retenido (Persona Moral)</span><span>−{fmt(ivaRetenido)}</span>
                      </div>
                    )}
                  </div>
                )}

                {esPM && form.with_iva && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "oklch(0.65 0.15 200)", background: "oklch(0.65 0.15 200 / 0.08)", border: "1px solid oklch(0.65 0.15 200 / 0.25)", borderRadius: 6, padding: "5px 10px" }}>
                    <Warning size={12} weight="fill" />
                    Persona Moral — retención de IVA aplicada automáticamente
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Forma de pago">
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.forma_pago} onChange={(e) => set("forma_pago", e.target.value)}>
                    {FORMAS_PAGO.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>
                <Field label="Uso CFDI">
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.uso_cfdi} onChange={(e) => set("uso_cfdi", e.target.value)}>
                    {usosFiltrados.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* Separador receptor */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Datos del receptor</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="RFC receptor">
                      <input
                        style={{ ...inputStyle, textTransform: "uppercase" }}
                        value={form.receptor_rfc}
                        onChange={(e) => set("receptor_rfc", e.target.value.toUpperCase())}
                        placeholder="XAXX010101000"
                      />
                    </Field>
                    <Field label="Código postal">
                      <input style={inputStyle} value={form.receptor_cp} onChange={(e) => set("receptor_cp", e.target.value)} placeholder="06600" maxLength={5} />
                    </Field>
                  </div>
                  <Field label="Nombre o razón social">
                    <input style={inputStyle} value={form.receptor_nombre} onChange={(e) => set("receptor_nombre", e.target.value)} placeholder="NOMBRE COMPLETO DEL RECEPTOR" />
                  </Field>
                  <Field label="Régimen fiscal">
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.receptor_regimen} onChange={(e) => set("receptor_regimen", e.target.value)}>
                      {REGIMENES_FISCALES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              {!facturapiconfigured && (
                <div style={{ fontSize: 12, color: "oklch(0.65 0.12 40)", background: "oklch(0.65 0.12 40 / 0.1)", border: "1px solid oklch(0.65 0.12 40 / 0.3)", borderRadius: 7, padding: "9px 12px" }}>
                  Facturapi no configurado — esta factura se guardará como PDF. Configura Facturapi en Configuración para emitir CFDI válidos.
                </div>
              )}

              {saveError && (
                <div style={{ background: "oklch(0.30 0.10 25 / 0.2)", border: "1px solid oklch(0.50 0.15 25 / 0.4)", borderRadius: 7, padding: "9px 12px", fontSize: 12, color: "oklch(0.80 0.12 25)" }}>
                  {saveError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button onClick={closeModal} className="btn-secondary" style={{ padding: "9px 20px" }}>Cancelar</button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.receptor_nombre.trim() || !form.descripcion.trim() || subtotal <= 0}
                  className="btn-primary"
                  style={{ padding: "9px 20px", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Creando..." : facturapiconfigured ? "Emitir CFDI" : "Crear factura PDF"}
                </button>
              </div>
            </div>}
          </div>
        </div>
      )}
    </>
  );
}
