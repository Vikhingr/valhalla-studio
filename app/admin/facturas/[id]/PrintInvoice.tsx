"use client";
import { Printer, FilePdf, ArrowLeft, Prohibit, Warning } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import type { Factura } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 });
}

const USOS_MAP: Record<string, string> = {
  G01: "G01 — Adquisición de mercancias",
  G03: "G03 — Gastos en general",
  I04: "I04 — Equipo de cómputo",
  P01: "P01 — Por definir",
  S01: "S01 — Sin efectos fiscales",
};

const FORMAS_MAP: Record<string, string> = {
  "01": "01 — Efectivo",
  "02": "02 — Cheque nominativo",
  "03": "03 — Transferencia electrónica",
  "04": "04 — Tarjeta de crédito",
  "28": "28 — Tarjeta de débito",
  "99": "99 — Por definir",
};

interface Props {
  factura: Factura & { clients?: { id: string; name: string; company: string | null; email: string | null; rfc: string | null; nombre_fiscal: string | null } | null };
  emisor: { nombre: string; rfc: string; regimen: string };
  hasCfdiDownload: boolean;
}

function QrCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 100, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
    }
  }, [url]);
  return <canvas ref={canvasRef} style={{ display: "block", width: 100, height: 100 }} />;
}

export default function PrintInvoice({ factura, emisor, hasCfdiDownload }: Props) {
  const router = useRouter();

  const isCancelled = factura.status === "cancelada";
  const isCfdi = factura.tipo === "cfdi";

  const FACTURAPI_RFC_PAC = "ICA050422AA8";

  const satVerificationUrl = isCfdi && factura.cfdi_uuid && factura.cfdi_sello
    ? `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${factura.cfdi_uuid}&re=${emisor.rfc}&rr=${factura.receptor_rfc}&tt=${factura.total.toFixed(6)}&fe=${factura.cfdi_sello.slice(-8)}`
    : null;

  const cadenaOriginal = isCfdi && factura.cfdi_uuid && factura.cfdi_fecha_timbrado && factura.cfdi_num_cert_sat && factura.cfdi_sello
    ? `||1.1|${factura.cfdi_uuid}|${factura.cfdi_fecha_timbrado.replace(/\.\d{3}Z$/, "")}|${FACTURAPI_RFC_PAC}|${factura.cfdi_num_cert_sat}|${factura.cfdi_sello}||`
    : null;
  const fechaFmt = new Date(factura.fecha + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      {/* Toolbar — oculto al imprimir */}
      <div className="no-print" style={{ padding: "16px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, padding: "6px 10px", borderRadius: 7 }}>
          <ArrowLeft size={15} /> Volver
        </button>
        <div style={{ flex: 1 }} />
        {hasCfdiDownload && (
          <a
            href={`/api/admin/facturas/${factura.id}/pdf`}
            download
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
          >
            <FilePdf size={15} /> Descargar PDF (Facturapi)
          </a>
        )}
        <button
          onClick={() => window.print()}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px" }}
        >
          <Printer size={15} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Banner de error de timbrado */}
      {factura.facturapi_error && (
        <div className="no-print" style={{ margin: "20px 32px 0", display: "flex", alignItems: "flex-start", gap: 12, background: "oklch(0.22 0.05 25 / 0.12)", border: "1px solid oklch(0.50 0.15 25 / 0.35)", borderRadius: 10, padding: "14px 18px" }}>
          <Warning size={18} weight="fill" style={{ color: "oklch(0.70 0.18 30)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
              Error de timbrado — factura guardada como PDF
            </p>
            <p style={{ fontSize: 12, fontFamily: "monospace", color: "oklch(0.72 0.12 30)", wordBreak: "break-word", lineHeight: 1.6 }}>
              {factura.facturapi_error}
            </p>
          </div>
        </div>
      )}

      {/* Hoja de factura */}
      <div
        id="factura-print"
        style={{
          padding: "40px 48px",
          maxWidth: 760,
          margin: "32px auto",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          position: "relative",
          opacity: isCancelled ? 0.7 : 1,
        }}
      >
        {/* Sello de cancelada */}
        {isCancelled && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-30deg)",
            fontSize: 72, fontWeight: 900, color: "oklch(0.55 0.15 25 / 0.2)",
            letterSpacing: 8, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
          }}>
            CANCELADA
          </div>
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", marginBottom: 6 }}>
              {emisor.nombre}
            </div>
            {emisor.rfc && <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>{emisor.rfc}</div>}
            {emisor.regimen && <div style={{ fontSize: 12, color: "var(--muted)" }}>{emisor.regimen}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {isCfdi ? "Comprobante Fiscal Digital" : "Factura / Recibo de pago"}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {fmt(factura.total)}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{fechaFmt}</div>
            {isCfdi && factura.cfdi_uuid && (
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--muted)", marginTop: 4, wordBreak: "break-all" }}>
                UUID: {factura.cfdi_uuid}
              </div>
            )}
          </div>
        </div>

        {/* Receptor */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Facturar a</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{factura.receptor_nombre}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace", marginTop: 2 }}>{factura.receptor_rfc}</div>
            {factura.clients?.email && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{factura.clients.email}</div>}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Detalles</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Row label="Forma de pago" value={FORMAS_MAP[factura.forma_pago] ?? factura.forma_pago} />
              <Row label="Uso CFDI" value={USOS_MAP[factura.uso_cfdi] ?? factura.uso_cfdi} />
              <Row label="CP receptor" value={factura.receptor_cp} />
            </div>
          </div>
        </div>

        {/* Concepto */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", borderRadius: "6px 0 0 6px" }}>Descripción</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Cant.</th>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", borderRadius: "0 6px 6px 0" }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "14px 14px", fontSize: 13, color: "var(--ink)" }}>{factura.descripcion}</td>
              <td style={{ padding: "14px 14px", fontSize: 13, color: "var(--muted)", textAlign: "right" }}>1</td>
              <td style={{ padding: "14px 14px", fontSize: 13, fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>{fmt(factura.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
          <div style={{ width: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "var(--ink-2)" }}>
              <span>Subtotal</span><span>{fmt(factura.subtotal)}</span>
            </div>
            {factura.iva > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "var(--ink-2)" }}>
                <span>IVA 16%</span><span>{fmt(factura.iva)}</span>
              </div>
            )}
            {factura.iva_retenido > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "oklch(0.65 0.15 200)" }}>
                <span>IVA retenido</span><span>−{fmt(factura.iva_retenido)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontSize: 16, fontWeight: 800, color: "var(--ink)", borderTop: "2px solid var(--border)", marginTop: 4 }}>
              <span>Total</span><span>{fmt(factura.total)}</span>
            </div>
          </div>
        </div>

        {/* Sellos digitales */}
        {isCfdi && (factura.cfdi_sello || factura.cfdi_sello_sat) && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              {satVerificationUrl && (
                <div style={{ flexShrink: 0 }}>
                  <QrCanvas url={satVerificationUrl} />
                  {factura.cfdi_fecha_timbrado && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Fecha y hora de certificación</div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--muted)" }}>
                        {new Date(factura.cfdi_fecha_timbrado).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "medium" })}
                      </div>
                    </div>
                  )}
                  {factura.cfdi_num_cert_sat && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Núm. serie certificado del SAT</div>
                      <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--muted)", wordBreak: "break-all" }}>{factura.cfdi_num_cert_sat}</div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {cadenaOriginal && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Cadena original del complemento de certificación digital del SAT</div>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--muted)", wordBreak: "break-all", lineHeight: 1.5 }}>{cadenaOriginal}</div>
                  </div>
                )}
                {factura.cfdi_sello && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Sello digital del CFDI</div>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--muted)", wordBreak: "break-all", lineHeight: 1.5 }}>{factura.cfdi_sello}</div>
                  </div>
                )}
                {factura.cfdi_sello_sat && (
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Sello digital del SAT</div>
                    <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--muted)", wordBreak: "break-all", lineHeight: 1.5 }}>{factura.cfdi_sello_sat}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
          {isCfdi ? (
            <span>Comprobante Fiscal Digital por Internet (CFDI) 4.0 — Timbrado por Facturapi</span>
          ) : (
            <span>Este documento es un recibo de pago. Para solicitar CFDI oficial contacte a {emisor.nombre}.</span>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #factura-print { border: none !important; box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
      `}</style>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
      <span style={{ color: "var(--muted)", minWidth: 90 }}>{label}</span>
      <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
