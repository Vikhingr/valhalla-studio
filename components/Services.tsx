/**
 * Services — Sección de servicios del sitio público.
 *
 * Muestra los tres servicios principales: Web, Apps Web y Automatizaciones.
 * Componente de Server — sin estado, importa íconos del bundle /ssr para SSR.
 * El diseño usa un grid de dos columnas (ícono + contenido) con lista de features.
 */
import { Globe, DeviceMobile, Gear } from "@phosphor-icons/react/dist/ssr";

const services = [
  {
    Icon: Globe,
    title: "Diseño y Desarrollo Web",
    desc: "Sitios que convierten. Desde landing pages de alto impacto hasta sitios con múltiples secciones, sistema de reservas y formularios. Diseño visual + código real, sin templates.",
    items: ["Landing pages", "Sitios de negocios", "Portales con autenticación", "SEO técnico"],
  },
  {
    Icon: DeviceMobile,
    title: "Aplicaciones Web",
    desc: "Apps con lógica real. Dashboards, simuladores, plataformas de comunidad, sistemas con roles de usuario. Diseño pensado para la experiencia, funcionalidad pensada para el negocio.",
    items: ["Dashboards", "Plataformas SaaS", "Sistemas con roles", "Integraciones API"],
  },
  {
    Icon: Gear,
    title: "Automatizaciones",
    desc: "Herramientas internas que ahorran horas de trabajo manual. Flujos automatizados entre tus sistemas: hojas de cálculo, CRMs, correos y más.",
    items: ["Google Sheets / Drive", "Flujos automatizados", "Notificaciones", "Reportes automáticos"],
  },
];

export default function Services() {
  return (
    <section id="servicios" className="services-section" style={{ padding: "120px 0", background: "var(--section-alt)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ maxWidth: 540, marginBottom: 72 }}>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--ink)",
              marginBottom: 16,
            }}
          >
            Un solo interlocutor.<br />
            Todo cubierto.
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.72 }}>
            Sin intermediarios, sin malentendidos. Diseño y desarrollo bajo el mismo techo.
          </p>
        </div>

        {/* Services list */}
        <div>
          {services.map(({ Icon, title, desc, items }, i) => (
            <div
              key={title}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: "0 32px",
                padding: "40px 0",
                borderTop: i === 0 ? "1px solid var(--border)" : undefined,
                borderBottom: "1px solid var(--border)",
              }}
            >
              {/* Icon column */}
              <div style={{ paddingTop: 4 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--violet-light)",
                  }}
                >
                  <Icon size={22} weight="duotone" />
                </div>
              </div>

              {/* Content column */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0 48px", alignItems: "start" }} className="service-row">
                <div>
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--ink)",
                      letterSpacing: "-0.02em",
                      marginBottom: 10,
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.72, maxWidth: "60ch" }}>
                    {desc}
                  </p>
                </div>

                {/* Feature tags */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }} className="service-tags">
                  {items.map((item) => (
                    <span
                      key={item}
                      style={{
                        color: "var(--violet-light)",
                        fontSize: 12,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <a href="#contacto" className="btn-primary">
            Cotiza tu proyecto
          </a>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Cada proyecto es único — te respondo en menos de 24 horas.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .services-section { padding: 72px 0 !important; }
        }
        @media (max-width: 640px) {
          .service-row { grid-template-columns: 1fr !important; gap: 16px !important; }
          .service-tags { align-items: flex-start !important; flex-direction: row !important; flex-wrap: wrap !important; }
        }
      `}</style>
    </section>
  );
}
