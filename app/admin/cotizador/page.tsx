"use client";
import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

type ProjectType = "web" | "app" | "automatizacion";
type Complexity = "basico" | "estandar" | "avanzado" | "premium";

const TYPES: { id: ProjectType; label: string; icon: string }[] = [
  { id: "web",            label: "Sitio web",      icon: "🌐" },
  { id: "app",            label: "App / Sistema",   icon: "💻" },
  { id: "automatizacion", label: "Automatización",  icon: "⚡" },
];

const TIERS: Record<ProjectType, { id: Complexity; label: string; desc: string; price: number }[]> = {
  web: [
    { id: "basico",   label: "Landing page",    desc: "1 página, diseño a medida, formulario de contacto, sin backend",           price: 9500   },
    { id: "estandar", label: "Sitio informativo",desc: "4–8 páginas, blog o CMS, formulario + email automático",                  price: 18000  },
    { id: "avanzado", label: "Sitio con sistema",desc: "Reservas, auth, catálogo, carrito o panel de administración",             price: 38000  },
    { id: "premium",  label: "E-commerce",       desc: "Tienda completa, pasarela de pagos, inventario, panel admin",             price: 60000  },
  ],
  app: [
    { id: "basico",   label: "App básica",       desc: "Auth + roles, dashboard, CRUD de 2–3 módulos, sin integraciones",        price: 48000  },
    { id: "estandar", label: "App completa",      desc: "Múltiples módulos, reportes, exportación, 1–2 integraciones externas",  price: 85000  },
    { id: "avanzado", label: "SaaS / plataforma", desc: "Multi-tenant, suscripciones, API propia, panel de configuración",       price: 130000 },
    { id: "premium",  label: "Sistema empresarial",desc: "ERP / CRM a medida, flujos complejos, integraciones múltiples",        price: 200000 },
  ],
  automatizacion: [
    { id: "basico",   label: "Flujo simple",     desc: "Google Sheets + notificaciones, Make/n8n, 1–2 pasos",                    price: 8500   },
    { id: "estandar", label: "Con integración",  desc: "API externa, lógica condicional, formularios o CRM conectado",           price: 22000  },
    { id: "avanzado", label: "Multi-sistema",    desc: "3+ plataformas, flujos paralelos, manejo de errores y reintentos",       price: 45000  },
    { id: "premium",  label: "Con IA",           desc: "Agentes IA, procesamiento de documentos, decisiones automáticas",       price: 85000  },
  ],
};

const EXTRAS: Record<ProjectType, { id: string; label: string; price: number }[]> = {
  web: [
    { id: "seo",       label: "SEO técnico + contenido inicial",   price: 2800 },
    { id: "blog",      label: "Blog / CMS editable",               price: 4200 },
    { id: "multi",     label: "Multiidioma (ES + EN)",             price: 3800 },
    { id: "analytics", label: "GA4 + Meta Pixel + reportes",       price: 1800 },
    { id: "whatsapp",  label: "Chat WhatsApp flotante",            price: 1200 },
    { id: "speed",     label: "Optimización de velocidad (Core Web Vitals)", price: 2200 },
  ],
  app: [
    { id: "notif",     label: "Notificaciones email / push",       price: 3800 },
    { id: "export",    label: "Exportar a Excel / PDF",            price: 3200 },
    { id: "roles",     label: "Roles y permisos avanzados",        price: 5000 },
    { id: "pagos",     label: "Pagos con Stripe / Conekta / OXXO", price: 7000 },
    { id: "api",       label: "API REST documentada (Swagger)",    price: 9000 },
    { id: "movil",     label: "App móvil (React Native básico)",   price: 35000 },
  ],
  automatizacion: [
    { id: "report",    label: "Reporte automático (PDF / Sheets)", price: 2800 },
    { id: "notif",     label: "Alertas por WhatsApp y email",      price: 2200 },
    { id: "dashboard", label: "Dashboard visual en tiempo real",   price: 6000 },
    { id: "cron",      label: "Ejecución programada (cron)",       price: 1800 },
    { id: "ia",        label: "Clasificación con IA (GPT/Gemini)", price: 8000 },
  ],
};

const MAINT: Record<ProjectType, { label: string; price: number; desc: string }[]> = {
  web: [
    { label: "Básico",    price: 900,  desc: "Actualizaciones, hosting supervisado, correcciones menores" },
    { label: "Estándar",  price: 2000, desc: "Todo lo anterior + cambios de contenido y soporte" },
    { label: "Premium",   price: 4000, desc: "Todo lo anterior + funciones pequeñas nuevas al mes" },
  ],
  app: [
    { label: "Básico",    price: 2500, desc: "Hosting + corrección de bugs + respaldo" },
    { label: "Estándar",  price: 5000, desc: "Todo lo anterior + mejoras continuas" },
    { label: "Premium",   price: 8000, desc: "Soporte prioritario + features mensuales" },
  ],
  automatizacion: [
    { label: "Monitoreo", price: 900,  desc: "Verificación, ajustes y alertas de fallo" },
    { label: "Activo",    price: 2200, desc: "Modificaciones frecuentes y nuevas reglas" },
  ],
};

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function CotizadorPage() {
  const [type, setType]           = useState<ProjectType>("web");
  const [complexity, setComplexity] = useState<Complexity>("basico");
  const [extras, setExtras]       = useState<string[]>([]);
  const [copied, setCopied]       = useState(false);

  const tier       = TIERS[type].find((t) => t.id === complexity)!;
  const extraList  = EXTRAS[type].filter((e) => extras.includes(e.id));
  const extraTotal = extraList.reduce((s, e) => s + e.price, 0);
  const total      = tier.price + extraTotal;
  const anticipo   = Math.round(total * 0.5 / 500) * 500;
  const mitad      = Math.round(total * 0.25 / 500) * 500;

  function toggleExtra(id: string) {
    setExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  }

  function buildProposal() {
    const typeLabel = TYPES.find((t) => t.id === type)!.label;
    const lines = [
      `Propuesta — ${typeLabel}: ${tier.label}`,
      "",
      `Alcance: ${tier.desc}`,
      extraList.length > 0 ? `Incluye: ${extraList.map((e) => e.label).join(", ")}` : "",
      "",
      `Inversión total: ${fmt(total)} MXN`,
      "",
      "Estructura de pago:",
      `  • 50% anticipo para iniciar — ${fmt(anticipo)} MXN`,
      `  • 25% al aprobar el diseño  — ${fmt(mitad)} MXN`,
      `  • 25% al entregar           — ${fmt(mitad)} MXN`,
      "",
      "Mantenimiento mensual opcional:",
      ...MAINT[type].map((m) => `  • ${m.label} (${fmt(m.price)}/mes): ${m.desc}`),
      "",
      "Tiempo estimado de entrega: te lo confirmo después de revisar el alcance completo.",
      "",
      "¿Tienes preguntas? Respondo en menos de 24 horas.",
      "— Gabriel Castañeda · Valhalla Studio",
    ].filter(Boolean);
    return lines.join("\n");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildProposal());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>Cotizador</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>
        Precios exactos basados en el mercado freelance CDMX 2025–2026. Genera propuesta lista para copiar.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* ── Controles ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Tipo */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Tipo de proyecto</div>
            <div style={{ display: "flex", gap: 10 }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setType(t.id); setComplexity("basico"); setExtras([]); }}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer", textAlign: "center",
                    border: `1px solid ${type === t.id ? "var(--violet)" : "var(--border)"}`,
                    background: type === t.id ? "oklch(0.58 0.22 293 / 0.12)" : "transparent",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 5 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: type === t.id ? "var(--violet-light)" : "var(--ink-2)" }}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Complejidad */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Alcance del proyecto</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TIERS[type].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setComplexity(t.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    border: `1px solid ${complexity === t.id ? "var(--violet)" : "var(--border)"}`,
                    background: complexity === t.id ? "oklch(0.58 0.22 293 / 0.10)" : "transparent",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: complexity === t.id ? "var(--violet-light)" : "var(--ink)", marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", maxWidth: 280 }}>{t.desc}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: complexity === t.id ? "var(--violet-light)" : "var(--ink-2)", flexShrink: 0, marginLeft: 16 }}>
                    {fmt(t.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Extras opcionales</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {EXTRAS[type].map((e) => {
                const active = extras.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => toggleExtra(e.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 7, cursor: "pointer", textAlign: "left",
                      border: `1px solid ${active ? "var(--violet)" : "var(--border)"}`,
                      background: active ? "oklch(0.58 0.22 293 / 0.08)" : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${active ? "var(--violet)" : "var(--border)"}`,
                        background: active ? "var(--violet)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {active && <Check size={10} weight="bold" style={{ color: "#fff" }} />}
                      </div>
                      <span style={{ fontSize: 13, color: active ? "var(--ink)" : "var(--ink-2)" }}>{e.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? "var(--violet-light)" : "var(--muted)", flexShrink: 0, marginLeft: 12 }}>
                      +{fmt(e.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Resultado ── */}
        <div style={{ position: "sticky", top: 28 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>

            {/* Precio total */}
            <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", background: "oklch(0.58 0.22 293 / 0.07)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Precio del proyecto
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {fmt(total)}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>MXN · IVA no incluido</div>
            </div>

            {/* Desglose */}
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Desglose</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{tier.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{fmt(tier.price)}</span>
              </div>
              {extraList.map((e) => (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{e.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--violet-light)" }}>+{fmt(e.price)}</span>
                </div>
              ))}
              {extraList.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Total</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{fmt(total)}</span>
                </div>
              )}
            </div>

            {/* Pagos */}
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Esquema de pagos</div>
              {[
                { label: "50% anticipo para iniciar", amount: anticipo },
                { label: "25% al aprobar diseño",      amount: mitad },
                { label: "25% al entregar",            amount: mitad },
              ].map(({ label, amount }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{fmt(amount)}</span>
                </div>
              ))}
            </div>

            {/* Mantenimiento */}
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Mantenimiento mensual</div>
              {MAINT[type].map((m) => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>{fmt(m.price)}<span style={{ fontWeight: 400, color: "var(--muted)" }}>/mes</span></span>
                </div>
              ))}
            </div>

            {/* Botón */}
            <div style={{ padding: "16px 22px" }}>
              <button
                onClick={handleCopy}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: copied ? "oklch(0.65 0.18 160)" : "var(--violet)",
                  color: "#fff", fontSize: 13, fontWeight: 600, transition: "background 0.2s",
                }}
              >
                {copied ? <><Check size={15} weight="bold" /> Propuesta copiada</> : <><Copy size={15} /> Copiar propuesta</>}
              </button>
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
                Texto listo para WhatsApp o email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla de referencia CDMX ── */}
      <div style={{ marginTop: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Referencia de mercado — Freelancer CDMX 2025–2026</div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
          Precios investigados en múltiples fuentes del mercado local. Perfil: freelancer con experiencia comprobable y proyectos reales. No son rangos orientativos — son los precios que cobra este perfil.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            { category: "Sitios web", rows: [
              ["Landing page (1 pág.)",        "$9,500"],
              ["Sitio informativo (4–8 págs.)", "$18,000"],
              ["Con auth / reservas / admin",   "$38,000"],
              ["E-commerce completo",           "$60,000"],
            ]},
            { category: "Apps y sistemas", rows: [
              ["App básica (auth + CRUD)",      "$48,000"],
              ["App completa (módulos + reportes)", "$85,000"],
              ["SaaS / multi-tenant",           "$130,000"],
              ["Sistema empresarial",           "$200,000"],
            ]},
            { category: "Automatizaciones", rows: [
              ["Flujo simple (Make/n8n)",        "$8,500"],
              ["Con integración API",            "$22,000"],
              ["Multi-sistema",                  "$45,000"],
              ["Con agente IA",                  "$85,000"],
            ]},
            { category: "Mantenimiento /mes", rows: [
              ["Web básico",                    "$900"],
              ["Web estándar",                  "$2,000"],
              ["App básica",                    "$2,500"],
              ["App estándar",                  "$5,000"],
            ]},
          ].map(({ category, rows }) => (
            <div key={category}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--violet-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>{category}</div>
              {rows.map(([label, price]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>{price}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 16 }}>
          Fuentes: Nebugrama, Cubosweb, Evarian Dev, IAmanos, Gabriel Neuman, Bridge Studio · Mercado freelance CDMX
        </p>
      </div>
    </div>
  );
}
