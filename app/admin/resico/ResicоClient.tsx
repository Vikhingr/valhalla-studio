/**
 * ResicоClient — Módulo de estimación fiscal mensual RESICO.
 *
 * Funcionalidad principal:
 *   - Selector de mes/año → llama a GET /api/admin/resico?mes=N&año=YYYY
 *   - Muestra ISR estimado según tabla Art. 113-E LISR y IVA neto a pagar
 *   - Lista facturas activas del mes (ingresos base)
 *   - Lista gastos con IVA acreditable (reducen el IVA a pagar)
 *
 * Registro de gastos:
 *   - El usuario sube un XML de CFDI 4.0 (comprobante de gasto)
 *   - parseCFDI() extrae los datos del XML en el cliente (DOMParser)
 *   - Se muestra preview para confirmar antes de guardar
 *   - POST /api/admin/resico guarda en la tabla gastos_resico
 *   - El CFDI UUID tiene restricción UNIQUE para evitar duplicados
 *
 * Nota: El nombre del archivo (ResicоClient) tiene una "о" cirílica por
 * compatibilidad con el sistema de archivos en Windows. No renombrar.
 */
"use client";
import { useState, useEffect, useRef } from "react";
import {
  ChartBar, UploadSimple, Trash, Eye, Warning, CheckCircle,
  ArrowSquareOut, Info,
} from "@phosphor-icons/react";
import GastoViewer from "./GastoViewer";

const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
}

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

interface Factura {
  id: string; fecha: string; receptor_nombre: string;
  descripcion: string; subtotal: number; iva: number; total: number; tipo: string;
}

interface Gasto {
  id: string; fecha: string; emisor_nombre: string; emisor_rfc: string;
  concepto: string; subtotal: number; iva: number; total: number;
  cfdi_uuid: string; mes: number; año: number;
}

interface ResData {
  ingresos: Factura[];
  subtotal_ingresos: number;
  iva_cobrado: number;
  tasa_isr: number;
  isr_estimado: number;
  gastos: Gasto[];
  iva_acreditable: number;
  iva_neto: number;
}

// Parse CFDI 4.0 XML (client-side)
function parseCFDI(xml: string) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const NS  = "http://www.sat.gob.mx/cfd/4";
  const TFD = "http://www.sat.gob.mx/TimbreFiscalDigital";

  const comp   = doc.documentElement;
  const emisor = comp.getElementsByTagNameNS(NS, "Emisor")[0];
  const tfd    = comp.getElementsByTagNameNS(TFD, "TimbreFiscalDigital")[0];
  const imps   = comp.getElementsByTagNameNS(NS, "Impuestos")[0];
  const conc   = comp.getElementsByTagNameNS(NS, "Concepto")[0];

  const fecha = comp.getAttribute("Fecha")?.slice(0, 10) ?? "";
  const subtotal = parseFloat(comp.getAttribute("SubTotal") ?? "0");
  const total    = parseFloat(comp.getAttribute("Total") ?? "0");
  const iva = parseFloat(imps?.getAttribute("TotalImpuestosTrasladados") ?? "0");

  return {
    fecha,
    subtotal,
    total,
    iva,
    emisor_nombre: emisor?.getAttribute("Nombre") ?? "",
    emisor_rfc:    emisor?.getAttribute("Rfc") ?? "",
    concepto:      conc?.getAttribute("Descripcion") ?? "",
    cfdi_uuid:     tfd?.getAttribute("UUID") ?? "",
  };
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "13px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{title}</h2>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function StatBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: "var(--surface-2)", border: `1px solid ${accent ? "oklch(0.58 0.22 293 / 0.4)" : "var(--border)"}`, borderRadius: 8, padding: "14px 18px", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent ? "var(--violet-light)" : "var(--ink)", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function ResicоClient() {
  const [mes, setMes] = useState(() => new Date().getMonth() + 1);
  const [año, setAño] = useState(() => new Date().getFullYear());
  const [data, setData]     = useState<ResData | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ rfc_emisor: string; nombre_emisor: string } | null>(null);

  // Gastos upload state
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof parseCFDI> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Viewer
  const [viewGasto, setViewGasto] = useState<Gasto | null>(null);

  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then((r) => r.json())
      .then((d) => setConfig({ rfc_emisor: d.rfc_emisor ?? "", nombre_emisor: d.nombre_fiscal ?? d.nombre_comercial ?? d.nombre_emisor ?? "" }));
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/resico?mes=${mes}&año=${año}`);
    const d   = await res.json();
    setData(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, [mes, año]);

  function handleXML(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCFDI(ev.target?.result as string);
        if (!parsed.cfdi_uuid) { setUploadErr("No se encontró UUID en el XML — verifica que sea un CFDI válido"); return; }
        if (!parsed.emisor_rfc) { setUploadErr("No se encontró RFC del emisor"); return; }
        // Assign mes/año from fecha
        const d = new Date(parsed.fecha + "T12:00:00");
        setPreview({ ...parsed });
      } catch {
        setUploadErr("Error al leer el XML — verifica que sea un CFDI 4.0 válido");
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  }

  async function confirmUpload() {
    if (!preview) return;
    setUploading(true);
    setUploadErr(null);
    const fecha = new Date(preview.fecha + "T12:00:00");
    const body = {
      ...preview,
      mes: fecha.getMonth() + 1,
      año: fecha.getFullYear(),
    };
    const res = await fetch("/api/admin/resico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) { setUploadErr(d.error ?? "Error al guardar"); setUploading(false); return; }
    setPreview(null);
    setUploading(false);
    load();
  }

  async function deleteGasto(id: string) {
    if (!confirm("¿Eliminar este gasto del registro?")) return;
    await fetch(`/api/admin/resico/${id}`, { method: "DELETE" });
    load();
  }

  const thStyle: React.CSSProperties = { padding: "7px 10px", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" };
  const tdStyle: React.CSSProperties = { padding: "9px 10px", fontSize: 12, color: "var(--ink)", borderBottom: "1px solid var(--border-subtle)" };
  const tdR: React.CSSProperties    = { ...tdStyle, textAlign: "right" };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <ChartBar size={20} weight="duotone" style={{ color: "var(--violet-light)" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>RESICO</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Estimación de ISR e IVA mensual basada en tus facturas emitidas.</p>
      </div>

      {/* Disclaimer */}
      <div style={{ display: "flex", gap: 10, background: "oklch(0.22 0.05 60 / 0.15)", border: "1px solid oklch(0.65 0.15 60 / 0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
        <Info size={16} style={{ color: "oklch(0.75 0.15 60)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "oklch(0.75 0.15 60)", lineHeight: 1.6 }}>
          <strong>Estimación orientativa.</strong> Estos cálculos se basan en la tabla RESICO Art. 113-E LISR vigente a 2025 y en las facturas registradas en esta app. Verifica siempre con tu contador antes de declarar.
        </p>
      </div>

      {/* Selector de mes */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24 }}>
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px", color: "var(--ink)", fontSize: 13, cursor: "pointer" }}>
          {MESES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select value={año} onChange={(e) => setAño(Number(e.target.value))}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px", color: "var(--ink)", fontSize: 13, cursor: "pointer" }}>
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {loading && <span style={{ fontSize: 12, color: "var(--muted)" }}>Cargando…</span>}
      </div>

      {data && (
        <>
          {/* ── Resumen declaración ── */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
            <StatBox label="ISR estimado" value={fmt(data.isr_estimado)} sub={`Tasa ${pct(data.tasa_isr)} sobre ${fmt(data.subtotal_ingresos)}`} accent />
            <StatBox label="IVA a pagar" value={fmt(data.iva_neto)} sub={`Cobrado ${fmt(data.iva_cobrado)} − Acreditable ${fmt(data.iva_acreditable)}`} accent />
            <StatBox label="Total ingresos" value={fmt(data.subtotal_ingresos)} sub={`${data.ingresos.length} factura${data.ingresos.length !== 1 ? "s" : ""} activa${data.ingresos.length !== 1 ? "s" : ""}`} />
          </div>

          {/* Botón declarar */}
          <div style={{ marginBottom: 24 }}>
            <a
              href="https://www.sat.gob.mx/declaracion/79213/presenta-tu-declaracion-provisional-o-definitiva-de-impuestos-federales"
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 8, background: "var(--violet)", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <ArrowSquareOut size={15} /> Declarar en SAT
            </a>
            <span style={{ marginLeft: 12, fontSize: 11, color: "var(--muted)" }}>
              Abre el portal de declaraciones provisionales del SAT
            </span>
          </div>

          {/* ── Ingresos ── */}
          <Section title={`Ingresos — ${MESES[mes]} ${año}`} icon={<CheckCircle size={15} weight="fill" style={{ color: "oklch(0.70 0.18 160)" }} />}>
            {data.ingresos.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>Sin facturas activas en este mes</p>
            ) : (
              <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Fecha</th>
                      <th style={thStyle}>Cliente</th>
                      <th style={thStyle}>Concepto</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Subtotal</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>IVA</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ingresos.map((f) => (
                      <tr key={f.id}>
                        <td style={tdStyle}>{f.fecha}</td>
                        <td style={tdStyle}>{f.receptor_nombre}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)", fontSize: 11 }}>{f.descripcion}</td>
                        <td style={tdR}>{fmt(f.subtotal)}</td>
                        <td style={{ ...tdR, color: "var(--muted)" }}>{fmt(f.iva)}</td>
                        <td style={{ ...tdR, fontWeight: 600 }}>{fmt(f.total)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "var(--surface-2)" }}>
                      <td colSpan={3} style={{ ...tdStyle, fontWeight: 700, borderBottom: "none" }}>Base ISR (subtotales)</td>
                      <td style={{ ...tdR, fontWeight: 700, borderBottom: "none" }}>{fmt(data.subtotal_ingresos)}</td>
                      <td style={{ ...tdR, fontWeight: 700, borderBottom: "none" }}>{fmt(data.iva_cobrado)}</td>
                      <td style={{ ...tdR, borderBottom: "none" }}></td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </Section>

          {/* ── Gastos con IVA acreditable ── */}
          <Section title="Gastos con IVA acreditable" icon={<UploadSimple size={15} style={{ color: "var(--violet-light)" }} />}>

            {/* Upload XML */}
            <div style={{ marginBottom: 16 }}>
              <input ref={fileRef} type="file" accept=".xml" style={{ display: "none" }} onChange={handleXML} />

              {!preview ? (
                <button onClick={() => fileRef.current?.click()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "1px dashed var(--violet)", background: "oklch(0.58 0.22 293 / 0.06)", color: "var(--violet-light)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <UploadSimple size={15} /> Subir XML de gasto
                </button>
              ) : (
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>Vista previa del CFDI leído:</div>
                  <div className="resico-preview-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[
                      ["Emisor", preview.emisor_nombre],
                      ["RFC", preview.emisor_rfc],
                      ["Concepto", preview.concepto],
                      ["Fecha", preview.fecha],
                      ["Subtotal", fmt(preview.subtotal)],
                      ["IVA", fmt(preview.iva)],
                      ["Total", fmt(preview.total)],
                      ["UUID", preview.cfdi_uuid.slice(0, 18) + "…"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ fontSize: 12 }}>
                        <span style={{ color: "var(--muted)" }}>{k}: </span>
                        <span style={{ color: "var(--ink)", fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={confirmUpload} disabled={uploading}
                      style={{ padding: "7px 14px", borderRadius: 7, background: "var(--violet)", color: "white", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: uploading ? 0.6 : 1 }}>
                      {uploading ? "Guardando…" : "Confirmar y registrar"}
                    </button>
                    <button onClick={() => setPreview(null)}
                      style={{ padding: "7px 14px", borderRadius: 7, background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {uploadErr && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, color: "oklch(0.72 0.18 25)", fontSize: 12, background: "oklch(0.22 0.06 25 / 0.15)", border: "1px solid oklch(0.50 0.15 25 / 0.35)", borderRadius: 7, padding: "8px 12px" }}>
                  <Warning size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {uploadErr}
                </div>
              )}
            </div>

            {/* Lista de gastos */}
            {data.gastos.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted)", paddingTop: 4 }}>No hay gastos registrados para este mes. Sube los XML de tus facturas de teléfono, internet, etc.</p>
            ) : (
              <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Proveedor</th>
                      <th style={thStyle}>Concepto</th>
                      <th style={thStyle}>Fecha</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>IVA acreditable</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gastos.map((g) => (
                      <tr key={g.id}>
                        <td style={tdStyle}>{g.emisor_nombre}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)", fontSize: 11 }}>{g.concepto}</td>
                        <td style={tdStyle}>{g.fecha}</td>
                        <td style={{ ...tdR, color: "oklch(0.70 0.18 160)", fontWeight: 600 }}>{fmt(g.iva)}</td>
                        <td style={tdR}>{fmt(g.total)}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button onClick={() => setViewGasto(g)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, borderRadius: 5 }}>
                              <Eye size={14} />
                            </button>
                            <button onClick={() => deleteGasto(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "oklch(0.65 0.15 25)", padding: 4, borderRadius: 5 }}>
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "var(--surface-2)" }}>
                      <td colSpan={3} style={{ ...tdStyle, fontWeight: 700, borderBottom: "none" }}>Total IVA acreditable</td>
                      <td style={{ ...tdR, fontWeight: 700, color: "oklch(0.70 0.18 160)", borderBottom: "none" }}>{fmt(data.iva_acreditable)}</td>
                      <td colSpan={2} style={{ ...tdStyle, borderBottom: "none" }}></td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </Section>

          {/* ── Desglose final ── */}
          <Section title="Resumen para declaración" icon={<ChartBar size={15} style={{ color: "var(--violet-light)" }} />}>
            <div className="resico-final-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 560 }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>ISR Provisional</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  <span>Ingresos cobrados</span><span>{fmt(data.subtotal_ingresos)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                  <span>Tasa RESICO</span><span>{pct(data.tasa_isr)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "var(--violet-light)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <span>ISR a pagar</span><span>{fmt(data.isr_estimado)}</span>
                </div>
              </div>

              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>IVA</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  <span>IVA cobrado</span><span>{fmt(data.iva_cobrado)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                  <span>IVA acreditable</span><span>− {fmt(data.iva_acreditable)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "var(--violet-light)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <span>IVA a pagar</span><span>{fmt(data.iva_neto)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: "12px 16px", background: "oklch(0.22 0.05 60 / 0.10)", border: "1px solid oklch(0.65 0.15 60 / 0.25)", borderRadius: 8, fontSize: 12, color: "oklch(0.75 0.12 60)", lineHeight: 1.7 }}>
              <strong>Recuerda:</strong> declara antes del <strong>día 17 de {MESES[mes === 12 ? 1 : mes + 1]}</strong>. ISR e IVA se declaran en la misma sesión del portal SAT.
            </div>
          </Section>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .resico-preview-grid { grid-template-columns: 1fr !important; }
          .resico-final-grid { grid-template-columns: 1fr !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Viewer modal */}
      {viewGasto && config && (
        <GastoViewer
          gasto={viewGasto}
          receptorNombre={config.nombre_emisor}
          receptorRfc={config.rfc_emisor}
          onClose={() => setViewGasto(null)}
        />
      )}
    </div>
  );
}
