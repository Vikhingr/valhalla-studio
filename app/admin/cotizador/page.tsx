"use client";
import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

type ProjectType = "web" | "app" | "automatizacion";

const TYPES: { id: ProjectType; label: string; icon: string }[] = [
  { id: "web",            label: "Sitio web",     icon: "🌐" },
  { id: "app",            label: "App / Sistema",  icon: "💻" },
  { id: "automatizacion", label: "Automatización", icon: "⚡" },
];

// Presets: conjuntos de features preseleccionados para arrancar rápido
const PRESETS: Record<ProjectType, { label: string; features: string[] }[]> = {
  web: [
    { label: "Landing",      features: ["base", "contacto"] },
    { label: "Sitio web",    features: ["base", "paginas", "contacto", "seo"] },
    { label: "Blog",         features: ["base", "paginas", "contacto", "blog", "seo"] },
    { label: "Con sistema",  features: ["base", "paginas", "contacto", "auth", "admin"] },
    { label: "E-commerce",   features: ["base", "paginas", "contacto", "catalogo", "carrito", "pagos"] },
  ],
  app: [
    { label: "MVP básico",   features: ["setup", "auth", "modulo"] },
    { label: "App completa", features: ["setup", "auth", "roles", "modulo", "dashboard", "notif"] },
    { label: "SaaS",         features: ["setup", "auth", "roles", "modulo", "dashboard", "notif", "pagos_app", "api"] },
  ],
  automatizacion: [
    { label: "Notificaciones", features: ["base_auto", "notif_auto"] },
    { label: "Con API",        features: ["base_auto", "api_auto", "notif_auto"] },
    { label: "Multi-sistema",  features: ["base_auto", "api_auto", "notif_auto", "cron", "errores"] },
  ],
};

type Feature = { id: string; label: string; desc: string; price: number; unit?: string };

const FEATURES: Record<ProjectType, { group: string; items: Feature[] }[]> = {
  web: [
    { group: "Base", items: [
      { id: "base",     label: "Diseño a medida",       desc: "Diseño responsive + setup de hosting y dominio + 1 página", price: 5500 },
      { id: "paginas",  label: "Páginas adicionales",   desc: "Por cada página extra (nosotros, servicios, portafolio…)",  price: 1100, unit: "c/u" },
    ]},
    { group: "Funcionalidades", items: [
      { id: "contacto", label: "Formulario de contacto", desc: "Formulario + email automático al recibir mensaje",          price: 1500 },
      { id: "blog",     label: "Blog / CMS editable",    desc: "Crea y edita publicaciones sin tocar código",               price: 4200 },
      { id: "auth",     label: "Login / Registro",       desc: "Auth completo con sesiones, recuperación de contraseña",   price: 5500 },
      { id: "admin",    label: "Panel de administración",desc: "Gestiona contenido, usuarios o datos desde un dashboard",  price: 9500 },
      { id: "reservas", label: "Reservas / Calendario",  desc: "Sistema de citas o reservas con disponibilidad",           price: 7500 },
      { id: "catalogo", label: "Catálogo de productos",  desc: "Listado con filtros, búsqueda y detalle de producto",      price: 6000 },
      { id: "carrito",  label: "Carrito de compras",     desc: "Carrito, checkout y gestión de órdenes",                   price: 5500 },
      { id: "pagos",    label: "Pasarela de pagos",       desc: "Stripe, Conekta u OXXO Pay integrado",                    price: 8500 },
    ]},
    { group: "Marketing / SEO", items: [
      { id: "seo",      label: "SEO técnico",             desc: "Meta tags, sitemap, schema markup, velocidad",            price: 2800 },
      { id: "analytics",label: "GA4 + Meta Pixel",        desc: "Analytics, eventos y remarketing configurado",           price: 1800 },
      { id: "multi",    label: "Multiidioma (ES + EN)",   desc: "Todo el sitio traducido con selector de idioma",          price: 3800 },
      { id: "whatsapp", label: "Chat WhatsApp flotante",  desc: "Botón flotante que abre WhatsApp con mensaje predefinido",price: 1200 },
      { id: "speed",    label: "Optimización de velocidad",desc: "Core Web Vitals 90+, lazy load, compresión de imágenes", price: 2200 },
    ]},
  ],
  app: [
    { group: "Base", items: [
      { id: "setup",    label: "Arquitectura + setup",    desc: "Configuración del proyecto, CI/CD, base de datos, entornos", price: 6000 },
    ]},
    { group: "Usuarios y acceso", items: [
      { id: "auth",     label: "Auth (login/registro)",   desc: "Registro, login, recuperación de contraseña, sesiones",  price: 5500 },
      { id: "roles",    label: "Roles y permisos",        desc: "Múltiples roles con control de acceso por función",      price: 4500 },
    ]},
    { group: "Módulos y datos", items: [
      { id: "modulo",   label: "Módulo CRUD",             desc: "Crear, leer, actualizar y eliminar (por módulo)",        price: 4000, unit: "c/u" },
      { id: "dashboard",label: "Dashboard con métricas",  desc: "Gráficas, KPIs y estadísticas en tiempo real",          price: 6000 },
      { id: "export",   label: "Exportar Excel / PDF",    desc: "Reportes descargables desde la app",                    price: 3200 },
    ]},
    { group: "Extras", items: [
      { id: "notif",    label: "Notificaciones email/push",desc: "Emails transaccionales y push notifications",          price: 3800 },
      { id: "pagos_app",label: "Pagos (Stripe / Conekta)", desc: "Cobros únicos o suscripciones recurrentes",            price: 7000 },
      { id: "api",      label: "API REST documentada",    desc: "API con Swagger para integraciones externas",           price: 9000 },
      { id: "movil",    label: "App móvil (React Native)", desc: "Versión iOS y Android de la misma app",                price: 35000 },
    ]},
  ],
  automatizacion: [
    { group: "Base", items: [
      { id: "base_auto",label: "Configuración inicial",   desc: "Setup de Make / n8n, credenciales, primer flujo",       price: 3500 },
    ]},
    { group: "Flujos e integraciones", items: [
      { id: "flujo",    label: "Flujo adicional",          desc: "Por cada flujo o automatización extra",                 price: 2500, unit: "c/u" },
      { id: "api_auto", label: "Integración API externa",  desc: "Conectar con API de tercero (CRM, ERP, plataforma…)",  price: 4500, unit: "c/u" },
      { id: "sheets",   label: "Google Sheets conectado",  desc: "Leer/escribir datos en Sheets automáticamente",        price: 2000 },
      { id: "crm",      label: "CRM conectado",            desc: "HubSpot, Pipedrive, Notion u otro CRM",                price: 4000 },
    ]},
    { group: "Salidas y alertas", items: [
      { id: "notif_auto",label: "Alertas WhatsApp / email",desc: "Notificaciones automáticas por WhatsApp Business o email", price: 2200 },
      { id: "reporte",  label: "Reporte automático",       desc: "PDF o Sheets generado y enviado automáticamente",      price: 2800 },
      { id: "dashboard_auto",label: "Dashboard en tiempo real",desc: "Visualización de datos del flujo en un panel",     price: 6000 },
    ]},
    { group: "Avanzado", items: [
      { id: "cron",     label: "Ejecución programada",     desc: "Flujos que corren a hora o día definido (cron)",       price: 1800 },
      { id: "errores",  label: "Manejo de errores",        desc: "Alertas de fallo, reintentos y logs de errores",       price: 2500 },
      { id: "ia",       label: "IA (GPT / Gemini)",        desc: "Clasificación, resumen o decisiones automáticas con IA", price: 8000 },
    ]},
  ],
};

const MAINT: Record<ProjectType, { label: string; price: number; desc: string }[]> = {
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

function fmt(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function CotizadorPage() {
  const [type, setType]       = useState<ProjectType>("web");
  const [selected, setSelected] = useState<string[]>(["base", "contacto"]);
  const [withIVA, setWithIVA] = useState(false);
  const [copied, setCopied]   = useState(false);

  function applyPreset(features: string[]) {
    setSelected(features);
  }

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  }

  function switchType(t: ProjectType) {
    setType(t);
    setSelected(PRESETS[t][0].features);
  }

  // Calcular total
  const allFeatures = FEATURES[type].flatMap((g) => g.items);
  const selectedFeatures = allFeatures.filter((f) => selected.includes(f.id));
  const subtotal = selectedFeatures.reduce((s, f) => s + f.price, 0);
  const iva      = withIVA ? Math.round(subtotal * 0.16) : 0;
  const total    = subtotal + iva;
  const anticipo = Math.round(total * 0.5 / 500) * 500;
  const mitad    = Math.round(total * 0.25 / 500) * 500;
  const resto    = total - anticipo - mitad;

  function buildProposal() {
    const typeLabel = TYPES.find((t) => t.id === type)!.label;
    const lines = [
      `Propuesta — ${typeLabel}`,
      "",
      "Incluye:",
      ...selectedFeatures.map((f) => `  • ${f.label}${f.unit ? ` (${f.unit})` : ""} — ${fmt(f.price)}`),
      "",
      ...(withIVA ? [
        `Subtotal: ${fmt(subtotal)} MXN`,
        `IVA (16%): ${fmt(iva)} MXN`,
      ] : []),
      `Total: ${fmt(total)} MXN${withIVA ? " (IVA incluido)" : " (+ IVA si aplica)"}`,
      "",
      "Estructura de pago:",
      `  • 50% anticipo para iniciar — ${fmt(anticipo)} MXN`,
      `  • 25% al aprobar diseño     — ${fmt(mitad)} MXN`,
      `  • 25% al entregar           — ${fmt(resto)} MXN`,
      "",
      "Mantenimiento mensual opcional:",
      ...MAINT[type].map((m) => `  • ${m.label} — ${fmt(m.price)}/mes`),
      "",
      "¿Tienes preguntas? Respondo en menos de 24 horas.",
      "— Gabriel Castañeda · Valhalla Studio",
    ];
    return lines.join("\n");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildProposal());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>Cotizador</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
        Arma el proyecto componente por componente. Cada funcionalidad tiene precio individual.
      </p>

      {/* Tipo */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => switchType(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${type === t.id ? "var(--violet)" : "var(--border)"}`,
              background: type === t.id ? "oklch(0.58 0.22 293 / 0.12)" : "transparent",
              fontSize: 13, fontWeight: 600,
              color: type === t.id ? "var(--violet-light)" : "var(--ink-2)",
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", alignSelf: "center", marginRight: 4 }}>PLANTILLAS:</span>
        {PRESETS[type].map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.features)}
            style={{
              padding: "5px 12px", borderRadius: 100, cursor: "pointer", fontSize: 12, fontWeight: 500,
              border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--ink-2)",
              transition: "border-color 0.15s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* ── Lista de features ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FEATURES[type].map((group) => (
            <div key={group.group} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{group.group}</span>
              </div>
              <div style={{ padding: "8px 0" }}>
                {group.items.map((f) => {
                  const active = selected.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggle(f.id)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 16px", cursor: "pointer", textAlign: "left",
                        border: "none", borderBottom: "1px solid var(--border-subtle)",
                        background: active ? "oklch(0.58 0.22 293 / 0.07)" : "transparent",
                        transition: "background 0.1s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                          border: `1.5px solid ${active ? "var(--violet)" : "var(--border)"}`,
                          background: active ? "var(--violet)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {active && <Check size={11} weight="bold" style={{ color: "#fff" }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--ink)" : "var(--ink-2)" }}>
                            {f.label}
                            {f.unit && <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)", marginLeft: 6 }}>({f.unit})</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{f.desc}</div>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, marginLeft: 16, textAlign: "right" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: active ? "var(--violet-light)" : "var(--ink-2)" }}>{fmt(f.price)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Panel derecho ── */}
        <div style={{ position: "sticky", top: 28 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>

            {/* Total */}
            <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", background: "oklch(0.58 0.22 293 / 0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total del proyecto</div>
                <button
                  onClick={() => setWithIVA((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100,
                    border: `1px solid ${withIVA ? "var(--violet)" : "var(--border)"}`,
                    background: withIVA ? "oklch(0.58 0.22 293 / 0.15)" : "transparent",
                    cursor: "pointer", fontSize: 11, fontWeight: 600,
                    color: withIVA ? "var(--violet-light)" : "var(--muted)",
                  }}
                >
                  IVA 16%
                </button>
              </div>
              {withIVA && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 3 }}>
                    <span>Subtotal</span><span>{fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                    <span>IVA (16%)</span><span>{fmt(iva)}</span>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 34, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {fmt(total)}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>
                MXN · {withIVA ? "IVA incluido" : "IVA no incluido"}
              </div>
            </div>

            {/* Desglose seleccionado */}
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)", maxHeight: 240, overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Incluye ({selectedFeatures.length})
              </div>
              {selectedFeatures.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--muted)" }}>Selecciona al menos una funcionalidad.</p>
              ) : (
                selectedFeatures.map((f) => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--ink-2)", minWidth: 0 }}>{f.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", flexShrink: 0 }}>{fmt(f.price)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Pagos */}
            {total > 0 && (
              <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Esquema de pagos</div>
                {[
                  { label: "50% anticipo",      amount: anticipo },
                  { label: "25% al diseño",     amount: mitad },
                  { label: "25% al entregar",   amount: resto },
                ].map(({ label, amount }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{fmt(amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Mantenimiento */}
            <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Mantenimiento /mes</div>
              {MAINT[type].map((m) => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{fmt(m.price)}<span style={{ fontWeight: 400, color: "var(--muted)" }}>/mes</span></span>
                </div>
              ))}
            </div>

            {/* Copiar */}
            <div style={{ padding: "16px 22px" }}>
              <button
                onClick={handleCopy}
                disabled={total === 0}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 16px", borderRadius: 8, border: "none", cursor: total === 0 ? "not-allowed" : "pointer",
                  background: copied ? "oklch(0.65 0.18 160)" : "var(--violet)",
                  color: "#fff", fontSize: 13, fontWeight: 600, transition: "background 0.2s",
                  opacity: total === 0 ? 0.5 : 1,
                }}
              >
                {copied ? <><Check size={15} weight="bold" /> Copiado</> : <><Copy size={15} /> Copiar propuesta</>}
              </button>
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
                Lista para WhatsApp o email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
