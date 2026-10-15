"use client";
import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

type ProjectType = "web" | "app" | "automatizacion";
type Complexity = "basico" | "estandar" | "avanzado";

const TYPES: { id: ProjectType; label: string; icon: string }[] = [
  { id: "web",           label: "Sitio web",       icon: "🌐" },
  { id: "app",           label: "Aplicación web",   icon: "💻" },
  { id: "automatizacion",label: "Automatización",   icon: "⚡" },
];

const TIERS: Record<ProjectType, { id: Complexity; label: string; desc: string; min: number; max: number }[]> = {
  web: [
    { id: "basico",    label: "Landing",   desc: "1 página, sin backend, formulario de contacto", min: 4000,  max: 8000 },
    { id: "estandar",  label: "Sitio web", desc: "4–6 páginas, blog básico, formulario + email",  min: 8000,  max: 15000 },
    { id: "avanzado",  label: "Con sistema",desc: "Reservas, auth, panel de admin o catálogo",    min: 15000, max: 35000 },
  ],
  app: [
    { id: "basico",    label: "App básica",  desc: "Auth + roles, dashboard sencillo, CRUD",      min: 25000, max: 45000 },
    { id: "estandar",  label: "App completa",desc: "Múltiples módulos, reportes, integraciones",  min: 40000, max: 70000 },
    { id: "avanzado",  label: "SaaS",        desc: "Multi-tenant, suscripciones, API propia",     min: 60000, max: 120000 },
  ],
  automatizacion: [
    { id: "basico",    label: "Simple",    desc: "Sheets + notificaciones + Zapier/Make",         min: 3000,  max: 6000 },
    { id: "estandar",  label: "Con API",   desc: "Integración con API externa, lógica custom",   min: 8000,  max: 18000 },
    { id: "avanzado",  label: "Multi-sistema",desc: "Flujo completo entre múltiples plataformas", min: 15000, max: 30000 },
  ],
};

const EXTRAS: Record<ProjectType, { id: string; label: string; add: number }[]> = {
  web: [
    { id: "seo",      label: "SEO básico",              add: 2000 },
    { id: "blog",     label: "Blog / CMS",               add: 3000 },
    { id: "multi",    label: "Multiidioma",              add: 2500 },
    { id: "analytics",label: "Google Analytics + Meta Pixel", add: 1500 },
    { id: "whatsapp", label: "Chat WhatsApp flotante",   add: 800 },
  ],
  app: [
    { id: "notif",    label: "Notificaciones email/push", add: 3000 },
    { id: "export",   label: "Exportar a Excel/PDF",      add: 2500 },
    { id: "roles",    label: "Roles avanzados",           add: 4000 },
    { id: "stripe",   label: "Pagos con Stripe/Conekta",  add: 5000 },
    { id: "api",      label: "API REST para externos",    add: 6000 },
  ],
  automatizacion: [
    { id: "report",   label: "Reporte automático",        add: 2000 },
    { id: "notif",    label: "Alertas por WhatsApp/email", add: 1500 },
    { id: "dashboard",label: "Dashboard visual",          add: 4000 },
    { id: "cron",     label: "Ejecución programada",      add: 1000 },
  ],
};

const MAINT: Record<ProjectType, { label: string; price: string }[]> = {
  web: [
    { label: "Básico",    price: "$500–1,000/mes (actualizaciones, hosting supervisado)" },
    { label: "Estándar",  price: "$1,000–2,500/mes (+ soporte, cambios menores)" },
    { label: "Premium",   price: "$2,500–5,000/mes (+ nuevas funciones pequeñas)" },
  ],
  app: [
    { label: "Básico",    price: "$1,500–3,000/mes (hosting + correcciones de bugs)" },
    { label: "Estándar",  price: "$3,000–6,000/mes (+ mejoras continuas)" },
    { label: "Premium",   price: "$6,000+/mes (soporte prioritario + features)" },
  ],
  automatizacion: [
    { label: "Monitoreo", price: "$500–1,000/mes (verificación y ajustes)" },
    { label: "Activo",    price: "$1,000–3,000/mes (modificaciones frecuentes)" },
  ],
};

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function CotizadorPage() {
  const [type, setType] = useState<ProjectType>("web");
  const [complexity, setComplexity] = useState<Complexity>("basico");
  const [extras, setExtras] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const tier = TIERS[type].find((t) => t.id === complexity)!;
  const extraList = EXTRAS[type].filter((e) => extras.includes(e.id));
  const extraTotal = extraList.reduce((s, e) => s + e.add, 0);
  const finalMin = tier.min + extraTotal;
  const finalMax = tier.max + extraTotal;
  const deposit = Math.round(finalMin * 0.5 / 1000) * 1000;
  const mid = Math.round(finalMin * 0.25 / 1000) * 1000;

  function toggleExtra(id: string) {
    setExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  }

  function buildProposal() {
    const typeLabel = TYPES.find((t) => t.id === type)!.label;
    const lines = [
      `Propuesta — ${typeLabel} (${tier.label})`,
      "",
      `Alcance: ${tier.desc}`,
      extraList.length > 0 ? `Extras incluidos: ${extraList.map((e) => e.label).join(", ")}` : "",
      "",
      `Inversión estimada: ${fmt(finalMin)} – ${fmt(finalMax)} MXN`,
      "",
      "Estructura de pago:",
      `  • 50% anticipo para iniciar: ${fmt(deposit)} MXN`,
      `  • 25% al aprobar el diseño: ${fmt(mid)} MXN`,
      `  • 25% restante al entregar: ${fmt(mid)} MXN`,
      "",
      "Mantenimiento opcional:",
      ...MAINT[type].map((m) => `  • ${m.label}: ${m.price}`),
      "",
      "¿Tienes preguntas? Respondo en menos de 24 horas.",
      "— Gabriel Castañeda · Valhalla Studio",
    ].filter((l) => l !== undefined);
    return lines.join("\n");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildProposal());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedType = type;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 6 }}>Cotizador</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28 }}>Genera un rango de precio y propuesta para copiar.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* Left: controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Type */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Tipo de proyecto</div>
            <div style={{ display: "flex", gap: 10 }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setType(t.id); setComplexity("basico"); setExtras([]); }}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 8, border: `1px solid ${selectedType === t.id ? "var(--violet)" : "var(--border)"}`,
                    background: selectedType === t.id ? "oklch(0.58 0.22 293 / 0.12)" : "transparent",
                    cursor: "pointer", textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: selectedType === t.id ? "var(--violet-light)" : "var(--ink-2)" }}>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Complejidad</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TIERS[type].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setComplexity(t.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderRadius: 8,
                    border: `1px solid ${complexity === t.id ? "var(--violet)" : "var(--border)"}`,
                    background: complexity === t.id ? "oklch(0.58 0.22 293 / 0.10)" : "transparent",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: complexity === t.id ? "var(--violet-light)" : "var(--ink)", marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.desc}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: complexity === t.id ? "var(--violet-light)" : "var(--ink-2)", flexShrink: 0, marginLeft: 16 }}>
                    {fmt(t.min)}–{fmt(t.max)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Extras</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXTRAS[type].map((e) => {
                const active = extras.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => toggleExtra(e.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 7,
                      border: `1px solid ${active ? "var(--violet)" : "var(--border)"}`,
                      background: active ? "oklch(0.58 0.22 293 / 0.08)" : "transparent",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${active ? "var(--violet)" : "var(--border)"}`,
                        background: active ? "var(--violet)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {active && <Check size={10} weight="bold" style={{ color: "#fff" }} />}
                      </div>
                      <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{e.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>+{fmt(e.add)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: result card */}
        <div style={{ position: "sticky", top: 28 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", background: "oklch(0.58 0.22 293 / 0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Estimado</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                {fmt(finalMin)}
              </div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2 }}>– {fmt(finalMax)} MXN</div>
            </div>

            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Pagos sugeridos</div>
              {[
                { label: "50% anticipo",       amount: deposit },
                { label: "25% al aprobar diseño", amount: mid },
                { label: "25% al entregar",    amount: mid },
              ].map(({ label, amount }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{fmt(amount)}</span>
                </div>
              ))}
            </div>

            {extraList.length > 0 && (
              <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Extras incluidos</div>
                {extraList.map((e) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{e.label}</span>
                    <span style={{ fontSize: 12, color: "var(--violet-light)" }}>+{fmt(e.add)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Mantenimiento mensual</div>
              {MAINT[type].map((m) => (
                <div key={m.label} style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-2)" }}>{m.label}: </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{m.price}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 20px" }}>
              <button
                onClick={handleCopy}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", gap: 8 }}
              >
                {copied ? <><Check size={15} weight="bold" /> Copiado</> : <><Copy size={15} /> Copiar propuesta</>}
              </button>
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
                Texto listo para pegar en WhatsApp o email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CDMX reference table */}
      <div style={{ marginTop: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Tarifas de referencia — CDMX 2025</div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Perfil: iniciando, con 4 proyectos reales no triviales. Estos rangos son para mercado freelance en Ciudad de México.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { category: "Sitios web", rows: [
              ["Landing simple (1 pág.)",      "$4,000 – $8,000"],
              ["Sitio (4–6 págs.)",             "$8,000 – $15,000"],
              ["Con reservas / auth",           "$15,000 – $25,000"],
              ["Con admin panel",               "$20,000 – $35,000"],
            ]},
            { category: "Aplicaciones web", rows: [
              ["Auth + roles básicos",          "$25,000 – $45,000"],
              ["SaaS / dashboard complejo",     "$40,000 – $80,000"],
              ["Simulador con API",             "$20,000 – $40,000"],
            ]},
            { category: "Automatizaciones", rows: [
              ["Google Sheets + notif.",        "$3,000 – $6,000"],
              ["Integración API externa",       "$8,000 – $18,000"],
              ["Multi-sistema",                 "$15,000 – $30,000"],
            ]},
            { category: "Mantenimiento mensual", rows: [
              ["Básico",                        "$500 – $1,000"],
              ["Estándar",                      "$1,000 – $2,500"],
              ["Premium",                       "$2,500 – $5,000"],
            ]},
          ].map(({ category, rows }) => (
            <div key={category}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--violet-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{category}</div>
              {rows.map(([label, price]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", flexShrink: 0 }}>{price}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
