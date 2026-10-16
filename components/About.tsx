import Image from "next/image";

const skills = [
  "React / Next.js", "TypeScript", "Tailwind CSS", "Node.js",
  "UI/UX Design", "Figma", "Puppeteer", "Google Sheets API",
  "Framer Motion", "PostgreSQL", "Vercel", "Railway",
];

export default function About() {
  return (
    <section id="sobre-mi" className="about-section" style={{ padding: "120px 0", background: "var(--section-alt)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          className="about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 80,
            alignItems: "start",
          }}
        >
          {/* Photo */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 300,
                  height: 370,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  position: "relative",
                }}
              >
                <Image
                  src="/gabriel.jpg"
                  alt="Gabriel Castañeda"
                  fill
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
              </div>

              {/* Badge — solid, no glass */}
              <div
                className="about-badge"
                style={{
                  position: "absolute",
                  bottom: -16,
                  right: -20,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 18px",
                }}
              >
                <div style={{ color: "var(--violet-light)", fontSize: 16, fontWeight: 700 }}>Viking</div>
                <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>Valhalla Studio</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
                color: "var(--ink)",
                marginBottom: 24,
              }}
            >
              Diseñador que sabe<br />
              <span style={{ color: "var(--violet-light)" }}>programar.</span>
            </h2>

            <p style={{ color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 16, fontSize: 15, maxWidth: "55ch" }}>
              Soy Gabriel Castañeda, estudiante de Ingeniería en Sistemas Computacionales en la UVEG, por egresar. Combino diseño visual de alto impacto con desarrollo real — sin depender de templates, sin sacrificar funcionalidad.
            </p>
            <p style={{ color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 36, fontSize: 15, maxWidth: "55ch" }}>
              Defino la lógica, la arquitectura y la experiencia de usuario, y construyo todo desde cero. El resultado son productos digitales que se ven distintos y funcionan de verdad.
            </p>

            {/* Skills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--ink-2)",
                    padding: "5px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .about-section { padding: 72px 0 !important; }
          .about-grid { gap: 48px !important; }
          .about-badge { right: 0 !important; }
        }
      `}</style>
    </section>
  );
}
