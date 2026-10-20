/**
 * CotizacionesClient — Módulo de seguimiento de cotizaciones.
 *
 * Las cotizaciones se generan desde el cotizador interactivo (/admin/cotizador).
 * Aquí se muestran y se puede registrar su estado de pago:
 *   - anticipo_pagado: se recibió el anticipo
 *   - pagado_completo: liquidación total
 *
 * El botón "Crear proyecto" navega al módulo de proyectos con la cotización
 * pre-seleccionada para autocompletar el precio.
 */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash, ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";
import type { Cotizacion } from "@/lib/types";

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

const TYPE_LABEL: Record<string, string> = {
  web: "Sitio web",
  app: "App / Sistema",
  automatizacion: "Automatización",
};

function PaymentStatus({ cot }: { cot: Cotizacion }) {
  if (cot.pagado_completo) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "oklch(0.52 0.18 160)", background: "oklch(0.62 0.18 160 / 0.1)", border: "1px solid oklch(0.62 0.18 160 / 0.3)", borderRadius: 100, padding: "3px 10px" }}>
        <CheckCircle size={12} weight="fill" /> Pagado completo
      </div>
    );
  }
  if (cot.anticipo_pagado) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "oklch(0.47 0.15 200)", background: "oklch(0.57 0.15 200 / 0.1)", border: "1px solid oklch(0.57 0.15 200 / 0.3)", borderRadius: 100, padding: "3px 10px" }}>
        <CheckCircle size={12} weight="fill" /> Anticipo cobrado
      </div>
    );
  }
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "oklch(0.47 0.12 40)", background: "oklch(0.57 0.12 40 / 0.1)", border: "1px solid oklch(0.57 0.12 40 / 0.3)", borderRadius: 100, padding: "3px 10px" }}>
      <Warning size={12} weight="fill" /> Sin cobrar
    </div>
  );
}

export default function CotizacionesClient() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/cotizaciones")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCotizaciones(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleField(id: string, field: "anticipo_pagado" | "pagado_completo", value: boolean) {
    setUpdating(id + field);
    const updates: Partial<Cotizacion> = { [field]: value };
    if (field === "pagado_completo" && value) updates.anticipo_pagado = true;
    if (field === "anticipo_pagado" && !value) updates.pagado_completo = false;

    const res = await fetch("/api/admin/cotizaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCotizaciones((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
    setUpdating(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    await fetch("/api/admin/cotizaciones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCotizaciones((prev) => prev.filter((c) => c.id !== id));
  }

  function handleCrearProyecto(cotId: string) {
    router.push(`/admin/proyectos?from=${cotId}`);
  }

  if (loading) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>Cotizaciones</h1>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Cargando...</p>
      </div>
    );
  }

  if (cotizaciones.length === 0) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>Cotizaciones</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 40 }}>Propuestas guardadas desde el cotizador.</p>
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--muted)" }}>
          <p style={{ fontSize: 14 }}>Sin cotizaciones guardadas.</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>Ve al Cotizador, arma una propuesta y guárdala.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>Cotizaciones</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
        {cotizaciones.length} cotización{cotizaciones.length !== 1 ? "es" : ""} · Registra pagos y crea proyectos desde aquí.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cotizaciones.map((c) => {
          const segundoPago = Math.round((c.total - c.anticipo) * 0.5);
          const pagoFinal   = c.total - c.anticipo - segundoPago;
          const isUpdating  = updating?.startsWith(c.id) ?? false;

          return (
            <div
              key={c.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "18px 20px",
                opacity: isUpdating ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{c.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 8px" }}>
                      {TYPE_LABEL[c.project_type] ?? c.project_type}
                    </span>
                    <PaymentStatus cot={c} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {new Date(c.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                    {c.with_iva && " · IVA incluido"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>{fmt(c.total)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>MXN total</div>
                </div>
              </div>

              {/* Pagos */}
              <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Registro de pagos
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                  {/* Anticipo */}
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: isUpdating ? "not-allowed" : "pointer" }}>
                    <div
                      onClick={() => !isUpdating && toggleField(c.id, "anticipo_pagado", !c.anticipo_pagado)}
                      style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        border: `1.5px solid ${c.anticipo_pagado ? "oklch(0.52 0.18 160)" : "var(--border)"}`,
                        background: c.anticipo_pagado ? "oklch(0.52 0.18 160)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {c.anticipo_pagado && <CheckCircle size={13} weight="fill" style={{ color: "#fff" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.anticipo_pagado ? "var(--muted)" : "var(--ink-2)", textDecoration: c.anticipo_pagado ? "line-through" : "none" }}>
                        50% anticipo para iniciar
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.anticipo_pagado ? "oklch(0.52 0.18 160)" : "var(--ink)" }}>
                      {fmt(c.anticipo)}
                    </span>
                  </label>

                  {/* Segundo pago */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: "1.5px solid var(--border)", background: "transparent", opacity: 0.4 }} />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--muted)" }}>25% al aprobar diseño</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{fmt(segundoPago)}</span>
                  </div>

                  {/* Pago final */}
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: isUpdating ? "not-allowed" : "pointer" }}>
                    <div
                      onClick={() => !isUpdating && c.anticipo_pagado && toggleField(c.id, "pagado_completo", !c.pagado_completo)}
                      style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        border: `1.5px solid ${c.pagado_completo ? "oklch(0.52 0.18 160)" : "var(--border)"}`,
                        background: c.pagado_completo ? "oklch(0.52 0.18 160)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: c.anticipo_pagado && !isUpdating ? "pointer" : "not-allowed",
                        opacity: c.anticipo_pagado ? 1 : 0.4,
                        transition: "all 0.15s",
                      }}
                    >
                      {c.pagado_completo && <CheckCircle size={13} weight="fill" style={{ color: "#fff" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: c.pagado_completo ? "var(--muted)" : c.anticipo_pagado ? "var(--ink-2)" : "var(--muted)", textDecoration: c.pagado_completo ? "line-through" : "none" }}>
                        25% al entregar
                      </span>
                      {!c.anticipo_pagado && (
                        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 6 }}>(cobra anticipo primero)</span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.pagado_completo ? "oklch(0.52 0.18 160)" : "var(--muted)" }}>
                      {fmt(pagoFinal)}
                    </span>
                  </label>

                </div>
              </div>

              {/* Features */}
              {c.selected_features?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {c.selected_features.map((f) => (
                    <span key={f.id} style={{ fontSize: 11, color: "var(--muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 8px" }}>
                      {f.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "4px 8px", borderRadius: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Trash size={13} /> Eliminar
                </button>
                <button
                  onClick={() => handleCrearProyecto(c.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 16px", borderRadius: 8, border: "none",
                    background: "var(--violet)", color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Crear proyecto <ArrowRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
