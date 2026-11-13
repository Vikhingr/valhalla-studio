/**
 * PrintCotizacion — Renderizador PDF de cotizaciones para impresión / descarga.
 *
 * Implementación:
 *   - window.print() para imprimir / guardar como PDF desde el browser
 *   - Botones de compartir por WhatsApp y correo
 *   - @media print con colores y layout optimizados para papel
 */
"use client";
import { Printer, ArrowLeft, WhatsappLogo } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import type { Cotizacion } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

const TYPE_LABEL: Record<string, string> = {
  web: "Sitio web",
  app: "App / Sistema",
  automatizacion: "Automatización",
};

const MAINT: Record<string, { label: string; price: number; desc: string }[]> = {
  web: [
    { label: "Básico",   price: 900,  desc: "Actualizaciones, hosting supervisado, correcciones" },
    { label: "Estándar", price: 2000, desc: "Todo lo anterior + cambios de contenido y soporte" },
    { label: "Premium",  price: 4000, desc: "Todo lo anterior + funciones pequeñas mensuales" },
  ],
  app: [
    { label: "Básico",   price: 2500, desc: "Hosting + corrección de bugs + respaldo" },
    { label: "Estándar", price: 5000, desc: "Todo lo anterior + mejoras continuas" },
    { label: "Premium",  price: 8000, desc: "Soporte prioritario + features mensuales" },
  ],
  automatizacion: [
    { label: "Monitoreo", price: 900,  desc: "Verificación, ajustes y alertas de fallo" },
    { label: "Activo",    price: 2200, desc: "Modificaciones frecuentes y nuevas reglas" },
  ],
};

interface Props {
  cotizacion: Cotizacion;
  folio: number;
  emisorNombre: string;
  emisorRfc: string;
}

export default function PrintCotizacion({ cotizacion: c, folio, emisorNombre, emisorRfc }: Props) {
  const router = useRouter();

  const segundoPago = Math.round((c.total - c.anticipo) * 0.5);
  const pagoFinal   = c.total - c.anticipo - segundoPago;
  const maint       = MAINT[c.project_type] ?? MAINT.web;

  const fechaFmt = new Date(c.created_at).toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric",
  });

  function buildWhatsApp() {
    const lineas = [
      `*Cotización — ${c.name}*`,
      `${TYPE_LABEL[c.project_type] ?? c.project_type}`,
      "",
      "*Incluye:*",
      ...c.selected_features.map(f => `  • ${f.label} — ${fmt(f.price)}`),
      "",
      ...(c.with_iva ? [
        `Subtotal: ${fmt(c.subtotal)}`,
        `IVA (16%): ${fmt(c.iva)}`,
      ] : []),
      `*Total: ${fmt(c.total)} MXN*${c.with_iva ? " (IVA incluido)" : " (+ IVA si aplica)"}`,
      "",
      "*Estructura de pago:*",
      `  • 50% anticipo para iniciar — ${fmt(c.anticipo)}`,
      `  • 25% al aprobar diseño     — ${fmt(segundoPago)}`,
      `  • 25% al entregar           — ${fmt(pagoFinal)}`,
      "",
      "¿Tienes preguntas? Respondo en menos de 24 horas.",
      `— Gabriel Castañeda · ${emisorNombre}`,
    ];
    return `https://wa.me/?text=${encodeURIComponent(lineas.join("\n"))}`;
  }

  function buildEmail() {
    const subject = `Cotización — ${c.name}`;
    const body = [
      `Hola, te comparto la cotización para ${c.name}:`,
      "",
      "Incluye:",
      ...c.selected_features.map(f => `  • ${f.label} — ${fmt(f.price)}`),
      "",
      ...(c.with_iva ? [
        `Subtotal: ${fmt(c.subtotal)}`,
        `IVA (16%): ${fmt(c.iva)}`,
      ] : []),
      `Total: ${fmt(c.total)} MXN${c.with_iva ? " (IVA incluido)" : " (+ IVA si aplica)"}`,
      "",
      "Estructura de pago:",
      `  50% anticipo para iniciar — ${fmt(c.anticipo)}`,
      `  25% al aprobar diseño     — ${fmt(segundoPago)}`,
      `  25% al entregar           — ${fmt(pagoFinal)}`,
      "",
      "¿Tienes alguna pregunta? Quedo a tus órdenes.",
      `— Gabriel Castañeda · ${emisorNombre}`,
    ].join("\n");
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const th: React.CSSProperties = {
    padding: "8px 10px", fontSize: 10, fontWeight: 700,
    color: "white", textTransform: "uppercase" as const,
    letterSpacing: "0.05em", textAlign: "left" as const,
    background: "oklch(0.26 0.08 262)", borderBottom: "none",
  };
  const td: React.CSSProperties = { padding: "10px 10px", fontSize: 12, color: "var(--ink)", verticalAlign: "top" as const };
  const tdR: React.CSSProperties = { ...td, textAlign: "right" as const };

  return (
    <>
      {/* Toolbar */}
      <div className="no-print" style={{ padding: "14px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, padding: "6px 10px", borderRadius: 7 }}>
          <ArrowLeft size={15} /> Volver
        </button>
        <div style={{ flex: 1 }} />

        <a href={buildWhatsApp()} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          <WhatsappLogo size={15} /> WhatsApp
        </a>

        <a href={buildEmail()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Correo
        </a>

        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 2px" }} />

        <button onClick={() => window.print()} className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px" }}>
          <Printer size={15} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Hoja de cotización */}
      <div id="cotizacion-print" style={{
        maxWidth: 820, margin: "32px auto",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden",
      }}>

        {/* ── Header azul ── */}
        <div className="cot-header" style={{
          background: "var(--violet)", padding: "28px 40px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{emisorNombre}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Cotización · {TYPE_LABEL[c.project_type] ?? c.project_type}
            </div>
            {folio > 0 && (
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginTop: 4, letterSpacing: "0.02em" }}>
                No. C-{String(folio).padStart(3, "0")}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>{fmt(c.total)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{fechaFmt}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              MXN{c.with_iva ? " · IVA incluido" : " · + IVA si aplica"}
            </div>
          </div>
        </div>

        {/* ── Nombre del proyecto ── */}
        <div className="cot-name-band" style={{ padding: "16px 40px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
              {emisorRfc ? `RFC ${emisorRfc} · ` : ""}Gabriel Castañeda · valhallastudio.com.mx
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--violet)", background: "oklch(0.58 0.22 262 / 0.1)", border: "1px solid oklch(0.58 0.22 262 / 0.25)", borderRadius: 100, padding: "4px 12px" }}>
            {TYPE_LABEL[c.project_type] ?? c.project_type}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cot-body" style={{ padding: "28px 40px" }}>

          {/* Tabla de servicios */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Servicios incluidos
          </div>
          <div className="cot-items" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: "72%" }}>Servicio</th>
                  <th style={{ ...th, width: "28%", textAlign: "right" }}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {c.selected_features.map((f, i) => (
                  <tr key={f.id} style={{ background: i % 2 === 0 ? "transparent" : "var(--surface-2)" }}>
                    <td style={td}>{f.label}</td>
                    <td style={tdR}>{fmt(f.price)}</td>
                  </tr>
                ))}
                {c.with_iva && (
                  <>
                    <tr style={{ background: "var(--surface-2)" }}>
                      <td style={{ ...td, fontSize: 11, color: "var(--muted)", textAlign: "right", paddingRight: 16 }}>Subtotal</td>
                      <td style={{ ...tdR, fontSize: 11, color: "var(--muted)" }}>{fmt(c.subtotal)}</td>
                    </tr>
                    <tr style={{ background: "var(--surface-2)" }}>
                      <td style={{ ...td, fontSize: 11, color: "var(--muted)", textAlign: "right", paddingRight: 16 }}>IVA 16%</td>
                      <td style={{ ...tdR, fontSize: 11, color: "var(--muted)" }}>{fmt(c.iva)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Totales + Esquema de pagos */}
          <div className="cot-payment" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 24 }}>

            {/* Esquema de pagos */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Estructura de pagos
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                {[
                  { label: "50% anticipo para iniciar", amount: c.anticipo, note: "Al firmar la propuesta" },
                  { label: "25% al aprobar diseño",     amount: segundoPago, note: "Durante el proyecto" },
                  { label: "25% al entregar",           amount: pagoFinal,   note: "Entrega final" },
                ].map(({ label, amount, note }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < 2 ? "1px solid var(--border)" : "none", background: i === 0 ? "oklch(0.58 0.22 262 / 0.06)" : "transparent" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: "var(--ink)" }}>{label}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{note}</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: i === 0 ? "var(--violet)" : "var(--ink)" }}>{fmt(amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caja de total */}
            <div style={{ width: 200, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Resumen
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {c.with_iva ? (
                    <>
                      <TRow label="Subtotal" value={fmt(c.subtotal)} />
                      <TRow label="IVA 16%" value={fmt(c.iva)} />
                    </>
                  ) : (
                    <TRow label={`${c.selected_features.length} servicio${c.selected_features.length !== 1 ? "s" : ""}`} value={fmt(c.total)} />
                  )}
                </div>
                <div className="cot-total-row" style={{ padding: "13px 16px", background: "var(--violet)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Total</span>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "white" }}>{fmt(c.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mantenimiento mensual */}
          <div className="cot-maint" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Mantenimiento mensual (opcional)
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {maint.map((m) => (
                <div key={m.label} style={{ flex: 1, minWidth: 140, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{m.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--violet)", marginTop: 2, letterSpacing: "-0.02em" }}>{fmt(m.price)}<span style={{ fontSize: 10, fontWeight: 400, color: "var(--muted)" }}>/mes</span></div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>
              Esta propuesta tiene vigencia de <strong style={{ color: "var(--ink)" }}>30 días</strong> a partir de su fecha de emisión.<br />
              Los precios están expresados en pesos mexicanos (MXN).
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "right", flexShrink: 0 }}>
              <strong style={{ color: "var(--ink)", display: "block" }}>Gabriel Castañeda</strong>
              {emisorNombre} · valhallastudio.com.mx
            </div>
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
            --violet: #2a5bd7 !important;
            --violet-light: #3b6ee8 !important;
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

          #cotizacion-print {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .cot-header {
            border-radius: 0 !important;
            padding: 12px 24px !important;
          }

          .cot-name-band {
            padding: 10px 24px !important;
          }

          .cot-body {
            padding: 14px 24px !important;
          }

          .cot-items { margin-bottom: 14px !important; }
          .cot-items th { padding: 5px 8px !important; font-size: 9px !important; }
          .cot-items td { padding: 6px 8px !important; font-size: 11px !important; }

          .cot-payment {
            margin-bottom: 14px !important;
          }

          .cot-total-row { padding: 8px 12px !important; }

          .cot-maint { margin-bottom: 14px !important; }
          .cot-maint > div:last-child { gap: 8px !important; }
          .cot-maint > div:last-child > div { padding: 8px 10px !important; min-width: 120px !important; }

          table { page-break-inside: avoid; }
        }
      `}</style>
    </>
  );
}

function TRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "var(--ink)" }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
