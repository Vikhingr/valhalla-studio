/**
 * PrintInvoice — Renderizador PDF de facturas para impresión / descarga.
 *
 * Genera una representación visual de la factura que cumple con los requisitos
 * del SAT para comprobantes CFDI 4.0 (Art. 29-A CFF):
 *   - Datos completos del emisor y receptor
 *   - UUID (folio fiscal) como texto y como QR Code
 *   - Importe en letra (numToWords) — requerimiento SAT
 *   - Cadena original y sellos digitales (emisor y SAT) para CFDIs timbrados
 *   - Régimen fiscal y uso CFDI con descripción completa del catálogo SAT
 *
 * Implementación:
 *   - QR Code generado con la librería `qrcode` en el cliente (canvas → data URL)
 *   - El QR apunta al verificador del SAT: verificacfdi.facturaelectronica.sat.gob.mx
 *   - window.print() para imprimir / guardar como PDF desde el browser
 *   - Para CFDIs timbrados también ofrece descarga del PDF oficial de FacturAPI
 *     (botón "Descargar PDF oficial") via GET /api/admin/facturas/[id]/pdf
 *
 * numToWords: convierte el monto total a español (ej. "1,234.56" → "MIL DOSCIENTOS
 * TREINTA Y CUATRO PESOS 56/100 M.N.") sin dependencia externa.
 */
"use client";
import { Printer, FilePdf, ArrowLeft, Warning, ShieldCheck } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { Factura } from "@/lib/types";
import { REGIMENES_FISCALES, USOS_CFDI } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
}

function numToWords(n: number): string {
  const ONES = [
    "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
    "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
    "VEINTE", "VEINTIÚN", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE",
  ];
  const TENS = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const HUNDS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  if (n === 0) return "CERO";
  let r = "";
  if (n >= 1000000) {
    const m = Math.floor(n / 1000000);
    r += (m === 1 ? "UN MILLÓN" : numToWords(m) + " MILLONES") + " ";
    n %= 1000000;
  }
  if (n >= 1000) {
    const t = Math.floor(n / 1000);
    r += (t === 1 ? "MIL" : numToWords(t) + " MIL") + " ";
    n %= 1000;
  }
  if (n >= 100) {
    if (n === 100) { r += "CIEN"; n = 0; }
    else { r += HUNDS[Math.floor(n / 100)] + " "; n %= 100; }
  }
  if (n > 0 && n < 30) { r += ONES[n]; }
  else if (n >= 30) {
    const d = Math.floor(n / 10), u = n % 10;
    r += TENS[d] + (u > 0 ? " Y " + ONES[u] : "");
  }
  return r.trim();
}

function importeEnLetra(total: number): string {
  const pesos = Math.floor(total);
  const centavos = Math.round((total - pesos) * 100);
  return `${numToWords(pesos)} PESOS ${centavos.toString().padStart(2, "0")}/100 MXN`;
}

const FORMAS_MAP: Record<string, string> = {
  "01": "01 — Efectivo",
  "02": "02 — Cheque nominativo",
  "03": "03 — Transferencia electrónica de fondos",
  "04": "04 — Tarjeta de crédito",
  "05": "05 — Monedero electrónico",
  "06": "06 — Dinero electrónico",
  "28": "28 — Tarjeta de débito",
  "29": "29 — Tarjeta de servicios",
  "99": "99 — Por definir",
};

interface Props {
  factura: Factura & {
    clients?: { id: string; name: string; company: string | null; email: string | null; rfc: string | null; nombre_fiscal: string | null; domicilio: string | null } | null;
  };
  emisor: { nombre: string; nombre_fiscal: string; rfc: string; regimen: string; cp: string; domicilio_fiscal?: string };
  hasCfdiDownload: boolean;
  folio: number;
}

function QrCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 96, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
    }
  }, [url]);
  return <canvas ref={canvasRef} style={{ display: "block", width: 96, height: 96 }} />;
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
      {children}
    </div>
  );
}

function SValue({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ fontSize: 9, fontFamily: mono ? "monospace" : undefined, color: "var(--muted)", wordBreak: "break-all", lineHeight: 1.5 }}>
      {children}
    </div>
  );
}

type CancelStatus = "none" | "pending" | "accepted" | "rejected";

const CANCEL_STATUS_LABEL: Record<CancelStatus, { label: string; color: string; bg: string }> = {
  none:     { label: "No cancelada en SAT",           color: "#6b7280", bg: "oklch(0.20 0.01 280)" },
  pending:  { label: "Pendiente — esperando receptor", color: "#d97706", bg: "oklch(0.22 0.06 60)" },
  accepted: { label: "Cancelada y aceptada por SAT",  color: "#16a34a", bg: "oklch(0.20 0.06 155)" },
  rejected: { label: "Rechazada por el receptor",     color: "#dc2626", bg: "oklch(0.20 0.06 25)" },
};

export default function PrintInvoice({ factura, emisor, hasCfdiDownload, folio }: Props) {
  const router = useRouter();
  const isCancelled = factura.status === "cancelada";
  const isCfdi = factura.tipo === "cfdi";

  const [cancelStatus, setCancelStatus] = useState<CancelStatus | null>(null);
  const [cancelChecking, setCancelChecking] = useState(false);

  async function checkCancelStatus() {
    setCancelChecking(true);
    setCancelStatus(null);
    try {
      const res = await fetch(`/api/admin/facturas/${factura.id}/cancel-status`);
      const data = await res.json();
      if (res.ok) setCancelStatus((data.cancellation_status as CancelStatus) ?? "none");
    } finally {
      setCancelChecking(false);
    }
  }

  const FACTURAPI_RFC_PAC = "PPD101129EA3";
  const selloCfdi = factura.cfdi_sello ?? factura.cfdi_sello_sat;

  const satVerificationUrl = isCfdi && factura.cfdi_uuid && selloCfdi
    ? `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${factura.cfdi_uuid}&re=${emisor.rfc}&rr=${factura.receptor_rfc}&tt=${factura.total.toFixed(6)}&fe=${selloCfdi.slice(-8)}`
    : null;

  const cadenaOriginal = isCfdi && factura.cfdi_uuid && factura.cfdi_fecha_timbrado && factura.cfdi_num_cert_sat && selloCfdi
    ? `||1.1|${factura.cfdi_uuid}|${new Date(factura.cfdi_fecha_timbrado).toISOString().slice(0, 19)}|${FACTURAPI_RFC_PAC}|${selloCfdi}|${factura.cfdi_num_cert_sat}||`
    : null;

  const fechaFmt = new Date(factura.fecha + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });
  const regimenLabel = REGIMENES_FISCALES.find(r => r.value === factura.receptor_regimen)?.label ?? factura.receptor_regimen;
  const regimenEmisorLabel = REGIMENES_FISCALES.find(r => r.value === emisor.regimen)?.label ?? emisor.regimen;
  const usoCfdiLabel = USOS_CFDI.find(u => u.value === factura.uso_cfdi)?.label ?? factura.uso_cfdi;

  const th: React.CSSProperties = {
    padding: "8px 8px", fontSize: 10, fontWeight: 700, color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left",
    background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
  };
  const td: React.CSSProperties = { padding: "10px 8px", fontSize: 12, color: "var(--ink)", verticalAlign: "top" };
  const tdR: React.CSSProperties = { ...td, textAlign: "right" };
  const tdMono: React.CSSProperties = { ...td, fontFamily: "monospace", fontSize: 10, color: "var(--muted)" };

  return (
    <>
      {/* Toolbar */}
      <div className="no-print" style={{ padding: "14px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, padding: "6px 10px", borderRadius: 7 }}>
          <ArrowLeft size={15} /> Volver
        </button>
        <div style={{ flex: 1 }} />

        {hasCfdiDownload && (
          <>
            <a href={`/api/admin/facturas/${factura.id}/pdf`} download
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <FilePdf size={15} /> PDF
            </a>
            <a href={`/api/admin/facturas/${factura.id}/xml`} download
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <FilePdf size={15} /> XML
            </a>
            <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 2px" }} />
            <a
              href={(() => {
                const nombre = factura.receptor_nombre;
                const total = factura.total.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
                const fecha = new Date(factura.fecha + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
                const uuid = factura.cfdi_uuid ? `\nFolio fiscal: ${factura.cfdi_uuid}` : "";
                const verif = satVerificationUrl ? `\nVerificar en SAT: ${satVerificationUrl}` : "";
                const msg = `Hola ${nombre}, te comparto tu factura:\n\nTotal: ${total}\nFecha: ${fecha}${uuid}${verif}\n\nQuedo a tus órdenes.`;
                return `https://wa.me/?text=${encodeURIComponent(msg)}`;
              })()}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={(() => {
                const email = factura.clients?.email ?? "";
                const nombre = factura.receptor_nombre;
                const total = factura.total.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
                const fecha = new Date(factura.fecha + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
                const uuid = factura.cfdi_uuid ? `\nFolio fiscal: ${factura.cfdi_uuid}` : "";
                const verif = satVerificationUrl ? `\n\nVerificar en SAT:\n${satVerificationUrl}` : "";
                const subject = `Tu factura CFDI — ${total}`;
                const body = `Hola ${nombre},\n\nAdjunto tu Comprobante Fiscal Digital (CFDI 4.0).\n\nTotal: ${total}\nFecha: ${fecha}${uuid}${verif}\n\nQuedo a tus órdenes.\n\n${emisor.nombre}`;
                return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              })()}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Correo
            </a>
            <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 2px" }} />
          </>
        )}

        {isCancelled && isCfdi && factura.facturapi_id && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={checkCancelStatus}
              disabled={cancelChecking}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: cancelChecking ? "default" : "pointer", opacity: cancelChecking ? 0.6 : 1 }}
            >
              <ShieldCheck size={15} />
              {cancelChecking ? "Consultando…" : "Estatus SAT"}
            </button>
            {cancelStatus && (() => {
              const s = CANCEL_STATUS_LABEL[cancelStatus];
              return (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                  {s.label}
                </span>
              );
            })()}
          </div>
        )}

        <button onClick={() => window.print()} className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px" }}>
          <Printer size={15} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Error banner */}
      {factura.facturapi_error && (
        <div className="no-print" style={{ margin: "20px 32px 0", display: "flex", alignItems: "flex-start", gap: 12, background: "oklch(0.22 0.05 25 / 0.12)", border: "1px solid oklch(0.50 0.15 25 / 0.35)", borderRadius: 10, padding: "14px 18px" }}>
          <Warning size={18} weight="fill" style={{ color: "oklch(0.70 0.18 30)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Error de timbrado — factura guardada como PDF</p>
            <p style={{ fontSize: 12, fontFamily: "monospace", color: "oklch(0.72 0.12 30)", wordBreak: "break-word", lineHeight: 1.6 }}>{factura.facturapi_error}</p>
          </div>
        </div>
      )}

      {/* Hoja de factura */}
      <div id="factura-print" style={{
        maxWidth: 820, margin: "32px auto",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
        position: "relative", opacity: isCancelled ? 0.7 : 1,
      }}>
        {isCancelled && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-30deg)", fontSize: 72, fontWeight: 900, color: "oklch(0.55 0.15 25 / 0.2)", letterSpacing: 8, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap", zIndex: 10 }}>
            CANCELADA
          </div>
        )}

        {/* ── Header violeta ── */}
        <div className="invoice-header" style={{
          background: "var(--violet)", padding: "28px 40px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{emisor.nombre}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {isCfdi ? "Comprobante Fiscal Digital · CFDI 4.0" : "Factura"}
            </div>
            {folio > 0 && (
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginTop: 4, letterSpacing: "0.02em" }}>
                No. F-{String(folio).padStart(3, "0")}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>{fmt(factura.total)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{fechaFmt}</div>
            {isCfdi && factura.cfdi_uuid && (
              <div style={{ fontSize: 8, fontFamily: "monospace", color: "rgba(255,255,255,0.45)", marginTop: 6, maxWidth: 280, wordBreak: "break-all", lineHeight: 1.5 }}>
                UUID: {factura.cfdi_uuid}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="invoice-body" style={{ padding: "28px 40px" }}>

          {/* ── Emisor + Receptor en cajas ── */}
          <div className="invoice-emisor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Emisor</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{emisor.nombre_fiscal || emisor.nombre}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", marginTop: 3 }}>RFC {emisor.rfc}</div>
              {regimenEmisorLabel && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>{regimenEmisorLabel}</div>}
              {emisor.domicilio_fiscal
                ? <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{emisor.domicilio_fiscal}</div>
                : emisor.cp && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>C.P. {emisor.cp}</div>
              }
              {isCfdi && factura.cfdi_uuid && emisor.cp && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", fontSize: 9, color: "var(--muted)" }}>
                  Lugar de emisión: {emisor.cp}
                </div>
              )}
            </div>

            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--violet)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Receptor</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{factura.receptor_nombre}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", marginTop: 3 }}>RFC {factura.receptor_rfc}</div>
              {factura.clients?.email && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{factura.clients.email}</div>}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 }}>
                <MRow label="Régimen" value={regimenLabel} />
                <MRow label="Domicilio" value={factura.clients?.domicilio || `${factura.receptor_cp}, MEX`} />
                <MRow label="Uso CFDI" value={usoCfdiLabel} />
              </div>
            </div>
          </div>

          {/* Metadata CFDI en línea (solo si está timbrado) */}
          {isCfdi && factura.cfdi_uuid && (
            <div className="invoice-meta" style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20, padding: "9px 14px", background: "var(--surface-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <MRow label="Tipo CFDI" value="I — Ingreso" />
              <MRow label="Versión" value="4.0" />
              <MRow label="Fecha de emisión" value={factura.fecha} />
              {factura.cfdi_fecha_timbrado && (
                <MRow label="Fecha certificación" value={new Date(factura.cfdi_fecha_timbrado).toISOString().slice(0, 19).replace("T", " ")} />
              )}
            </div>
          )}

          {/* ── Concepto table ── */}
          <div className="invoice-items" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "11%" }}>Clave ProdServ</th>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "35%" }}>Concepto</th>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "6%", textAlign: "right" }}>Cant.</th>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "7%", textAlign: "center" }}>Obj. Imp.</th>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "8%", textAlign: "center" }}>Unidad</th>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "16%", textAlign: "right" }}>P. Unitario</th>
                  <th style={{ ...th, background: "oklch(0.26 0.08 293)", color: "white", borderBottom: "none", width: "16%", textAlign: "right" }}>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdMono}>{factura.clave_prod_serv}</td>
                  <td style={td}>{factura.descripcion}</td>
                  <td style={{ ...tdR }}>1</td>
                  <td style={{ ...td, textAlign: "center" }}>02</td>
                  <td style={{ ...td, textAlign: "center", fontFamily: "monospace", fontSize: 10 }}>{factura.clave_unidad}</td>
                  <td style={tdR}>{fmt(factura.subtotal)}</td>
                  <td style={tdR}>{fmt(factura.subtotal)}</td>
                </tr>
                {factura.iva > 0 && (
                  <tr style={{ background: "var(--surface-2)" }}>
                    <td colSpan={5} style={{ ...td, fontSize: 10, color: "var(--muted)", textAlign: "right", paddingRight: 12 }}>
                      IVA 16%, Base: {fmt(factura.subtotal)}
                    </td>
                    <td style={{ ...td, fontSize: 10, color: "var(--muted)", textAlign: "right" }}>Traslado</td>
                    <td style={{ ...td, fontSize: 10, color: "var(--muted)", textAlign: "right" }}>{fmt(factura.iva)}</td>
                  </tr>
                )}
                {factura.iva_retenido > 0 && (
                  <tr style={{ background: "var(--surface-2)" }}>
                    <td colSpan={5} style={{ ...td, fontSize: 10, color: "var(--muted)", textAlign: "right", paddingRight: 12 }}>
                      IVA 10.67% Retenido, Base: {fmt(factura.subtotal)}
                    </td>
                    <td style={{ ...td, fontSize: 10, color: "oklch(0.65 0.15 200)", textAlign: "right" }}>Retención</td>
                    <td style={{ ...td, fontSize: 10, color: "oklch(0.65 0.15 200)", textAlign: "right" }}>−{fmt(factura.iva_retenido)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pago + Totales ── */}
          <div className="invoice-payment" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <MRow label="Forma de pago" value={FORMAS_MAP[factura.forma_pago] ?? factura.forma_pago} />
              <MRow label="Método de pago" value="PUE — Pago en una sola exhibición" />
              <MRow label="Exportación" value="01 — No aplica" />
              <MRow label="Moneda" value="MXN" />
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: "var(--ink-2)", maxWidth: 340, lineHeight: 1.5 }}>
                {importeEnLetra(factura.total)}
              </div>
            </div>

            {/* Caja de totales */}
            <div style={{ width: 224, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                <TRow label="Subtotal" value={fmt(factura.subtotal)} />
                {factura.iva > 0 && <TRow label="IVA 16%" value={fmt(factura.iva)} />}
                {factura.iva_retenido > 0 && <TRow label="IVA retenido" value={`−${fmt(factura.iva_retenido)}`} accent />}
              </div>
              <div className="invoice-total-row" style={{ padding: "13px 16px", background: "var(--violet)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 900, color: "white" }}>{fmt(factura.total)}</span>
              </div>
            </div>
          </div>

          {/* ── Sellos digitales ── */}
          {isCfdi && (factura.cfdi_sello || factura.cfdi_sello_sat) && (
            <div className="invoice-sellos" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {satVerificationUrl && <QrCanvas url={satVerificationUrl} />}
                  {!satVerificationUrl && (
                    <div style={{ width: 96, height: 96, background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, color: "var(--muted)", textAlign: "center", padding: 4 }}>QR no disponible en test</span>
                    </div>
                  )}
                  <div style={{ fontSize: 8, fontFamily: "monospace", color: "var(--muted)", textAlign: "center" }}>Prov. Cert. {FACTURAPI_RFC_PAC}</div>
                  {factura.cfdi_fecha_timbrado && (
                    <div style={{ marginTop: 4, textAlign: "center" }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Fecha certif.</div>
                      <div style={{ fontSize: 8, fontFamily: "monospace", color: "var(--muted)" }}>
                        {new Date(factura.cfdi_fecha_timbrado).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    </div>
                  )}
                  {factura.cfdi_num_cert_sat && (
                    <div style={{ marginTop: 4, textAlign: "center" }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Serie CSD SAT</div>
                      <div style={{ fontSize: 8, fontFamily: "monospace", color: "var(--muted)", wordBreak: "break-all" }}>{factura.cfdi_num_cert_sat}</div>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {factura.cfdi_sello_sat && (
                    <div><SLabel>Sello digital del CFDI</SLabel><SValue mono>{factura.cfdi_sello_sat}</SValue></div>
                  )}
                  {factura.cfdi_sello && (
                    <div><SLabel>Sello digital del emisor (CSD)</SLabel><SValue mono>{factura.cfdi_sello}</SValue></div>
                  )}
                  {cadenaOriginal && (
                    <div><SLabel>Cadena original del complemento de certificación digital del SAT</SLabel><SValue mono>{cadenaOriginal}</SValue></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
            {isCfdi
              ? "Este documento es una representación impresa de un CFDI"
              : `Este documento es un recibo de pago. Para solicitar CFDI oficial contacte a ${emisor.nombre}.`}
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: letter;
          margin: 8mm 10mm;
        }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          :root {
            --bg: #ffffff !important;
            --surface: #ffffff !important;
            --surface-2: #f2f2f5 !important;
            --border: #d4d4dc !important;
            --ink: #111111 !important;
            --ink-2: #444455 !important;
            --muted: #55556a !important;
            --violet: #5b21b6 !important;
            --violet-light: #7c3aed !important;
          }

          aside, header, nav, .adm-topbar { display: none !important; }
          .no-print { display: none !important; }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #111 !important;
          }
          body > div { display: block !important; min-height: auto !important; }
          main { width: 100% !important; overflow: visible !important; }

          #factura-print {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
            opacity: 1 !important;
            overflow: visible !important;
          }

          /* Header compacto */
          .invoice-header {
            border-radius: 0 !important;
            padding: 12px 24px !important;
          }

          /* Body comprimido */
          .invoice-body {
            padding: 12px 24px !important;
          }

          /* Grid emisor/receptor */
          .invoice-emisor-grid {
            gap: 10px !important;
            margin-bottom: 10px !important;
          }
          .invoice-emisor-grid > div { padding: 10px 12px !important; }

          /* Metadatos CFDI */
          .invoice-meta {
            margin-bottom: 10px !important;
            padding: 5px 10px !important;
            gap: 12px !important;
          }

          /* Tabla de conceptos */
          .invoice-items { margin-bottom: 12px !important; }
          .invoice-items th { padding: 5px 6px !important; font-size: 8px !important; }
          .invoice-items td { padding: 5px 6px !important; font-size: 10px !important; }

          /* Pago + totales */
          .invoice-payment {
            margin-bottom: 12px !important;
            padding-bottom: 10px !important;
          }

          /* Totales box */
          .invoice-total-row { padding: 8px 12px !important; }

          /* Sellos compactos */
          .invoice-sellos { margin-bottom: 8px !important; }
          .invoice-sellos canvas { width: 72px !important; height: 72px !important; }

          table { page-break-inside: avoid; }
        }
      `}</style>
    </>
  );
}

function MRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
      <span style={{ color: "var(--muted)", minWidth: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function TRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: bold ? "10px 0 0" : "5px 0", fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 400, color: accent ? "oklch(0.65 0.15 200)" : "var(--ink)", borderTop: bold ? "2px solid var(--border)" : undefined, marginTop: bold ? 4 : 0 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
