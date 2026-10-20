/**
 * GastoViewer — Modal de detalle para un gasto RESICO.
 *
 * Muestra los datos del CFDI de egreso: emisor, RFC, concepto, importes.
 * El cfdi_uuid es el folio fiscal oficial del SAT.
 * Se abre desde la tabla de gastos en ResicоClient al presionar el ícono de ojo.
 */
"use client";
import { X } from "@phosphor-icons/react";

interface Gasto {
  id: string;
  fecha: string;
  emisor_nombre: string;
  emisor_rfc: string;
  concepto: string;
  subtotal: number;
  iva: number;
  total: number;
  cfdi_uuid: string;
  mes: number;
  año: number;
}

interface Props {
  gasto: Gasto;
  receptorNombre: string;
  receptorRfc: string;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
}

const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function GastoViewer({ gasto, receptorNombre, receptorRfc, onClose }: Props) {
  const fechaFmt = new Date(gasto.fecha + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "oklch(0.00 0 0 / 0.65)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto",
        background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header violeta — estilo PrintInvoice */}
        <div style={{
          background: "var(--violet)", padding: "20px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderRadius: "12px 12px 0 0",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
              CFDI recibido — Gasto {MESES[gasto.mes]} {gasto.año}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>
              {gasto.emisor_nombre}
            </div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
              RFC {gasto.emisor_rfc}
            </div>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "white" }}>
              <X size={16} />
            </button>
            <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{fmt(gasto.total)}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{fechaFmt}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 32px" }}>

          {/* Emisor / Receptor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Proveedor (Emisor)</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{gasto.emisor_nombre}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", marginTop: 3 }}>RFC {gasto.emisor_rfc}</div>
            </div>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Receptor (Tú)</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{receptorNombre}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", marginTop: 3 }}>RFC {receptorRfc}</div>
            </div>
          </div>

          {/* Concepto */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ display: "flex", padding: "8px 14px", background: "oklch(0.26 0.08 262)", gap: 0 }}>
              {["Concepto", "Importe"].map((h) => (
                <div key={h} style={{ fontSize: 9, fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.05em", flex: h === "Concepto" ? 1 : 0 }}>{h}</div>
              ))}
            </div>
            <div style={{ display: "flex", padding: "12px 14px", alignItems: "center" }}>
              <div style={{ flex: 1, fontSize: 13, color: "var(--ink)" }}>{gasto.concepto}</div>
              <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{fmt(gasto.subtotal)}</div>
            </div>
            {gasto.iva > 0 && (
              <div style={{ display: "flex", padding: "8px 14px", borderTop: "1px solid var(--border)", alignItems: "center" }}>
                <div style={{ flex: 1, fontSize: 11, color: "var(--muted)" }}>IVA 16%</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmt(gasto.iva)}</div>
              </div>
            )}
          </div>

          {/* Totales */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <div style={{ width: 220, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", background: "var(--surface-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                  <span>Subtotal</span><span>{fmt(gasto.subtotal)}</span>
                </div>
                {gasto.iva > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "oklch(0.70 0.18 160)" }}>
                    <span>IVA acreditable</span><span>{fmt(gasto.iva)}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--violet)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: "white" }}>{fmt(gasto.total)}</span>
              </div>
            </div>
          </div>

          {/* Folio fiscal */}
          {gasto.cfdi_uuid && (
            <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Folio Fiscal (UUID)</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", wordBreak: "break-all" }}>{gasto.cfdi_uuid}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
