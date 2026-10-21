import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad — Valhalla Studio",
  description: "Aviso de privacidad de Valhalla Studio conforme a la LFPDPPP.",
  robots: { index: false },
};

export default function AvisoPrivacidad() {
  return (
    <main
      id="inicio"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        justifyContent: "center",
        padding: "48px 16px 64px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* Encabezado */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-hand), cursive",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--ink)",
            textDecoration: "none",
            marginBottom: 40,
          }}
        >
          <span style={{ color: "var(--violet)" }}>←</span> Valhalla <span style={{ color: "var(--violet)" }}>Studio</span>
        </a>

        {/* Hoja de cuaderno */}
        <div
          style={{
            background: "var(--surface)",
            backgroundImage:
              "linear-gradient(90deg, transparent 44px, #d98f8f 44px, #d98f8f 46px, transparent 46px), repeating-linear-gradient(var(--surface) 0 31px, rgba(42,91,215,0.13) 31px 32px)",
            border: "2px solid var(--ink)",
            borderRadius: "var(--hand-radius, 6px)",
            boxShadow: "5px 7px 0 rgba(42,42,46,0.14)",
            padding: "40px 36px 48px 64px",
            position: "relative",
            transform: "rotate(-0.3deg)",
          }}
        >
          {/* Cinta adhesiva */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              width: 120,
              height: 28,
              transform: "translateX(-50%) rotate(-2deg)",
              background: "rgba(215,205,170,0.78)",
              border: "1px solid rgba(42,42,46,0.14)",
            }}
          />

          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              margin: "0 0 6px",
            }}
          >
            Última actualización: 21 de octubre de 2026
          </p>

          <h1
            style={{
              fontFamily: "var(--font-hand), cursive",
              fontSize: 42,
              fontWeight: 700,
              color: "var(--ink)",
              margin: "0 0 32px",
              lineHeight: 1.1,
            }}
          >
            Aviso de Privacidad
          </h1>

          <Seccion titulo="Responsable del tratamiento">
            <p>
              <strong>Gabriel Castañeda</strong>, con nombre comercial{" "}
              <strong>Valhalla Studio</strong>, con domicilio en la Ciudad de
              México, México.
            </p>
            <p>
              Contacto:{" "}
              <a href="mailto:contacto@valhallastudio.com.mx" style={{ color: "var(--violet)" }}>
                contacto@valhallastudio.com.mx
              </a>
            </p>
          </Seccion>

          <Seccion titulo="Datos personales que recabamos">
            <p>
              Únicamente a través del formulario de contacto del sitio web
              recabamos:
            </p>
            <ul>
              <li>Nombre</li>
              <li>Correo electrónico</li>
              <li>Teléfono (campo opcional)</li>
              <li>Descripción de la consulta o proyecto</li>
            </ul>
            <p>
              No recabamos datos sensibles, financieros ni de menores de edad.
            </p>
          </Seccion>

          <Seccion titulo="Finalidades del tratamiento">
            <p>
              <strong>Finalidad primaria:</strong> responder su mensaje de
              contacto y dar seguimiento a posibles propuestas de colaboración o
              trabajo freelance.
            </p>
            <p>
              No utilizamos sus datos para publicidad propia, venta a terceros
              ni análisis estadístico.
            </p>
          </Seccion>

          <Seccion titulo="Transferencias de datos personales">
            <p>
              Sus datos <strong>no se venden ni comparten</strong> con terceros
              con fines comerciales. Se transmiten de forma técnica a:
            </p>
            <ul>
              <li>
                <strong>Resend Inc.</strong> — proveedor de correo electrónico,
                utilizado exclusivamente para la entrega técnica de su mensaje.
                Actúa como encargado del tratamiento y no usa sus datos para
                fines propios.
              </li>
              <li>
                <strong>Cloudflare Inc.</strong> — para la verificación
                anti-bot (Turnstile) al enviar el formulario.
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="Uso de cookies y tecnologías de seguimiento">
            <p>
              Este sitio <strong>no usa cookies de publicidad ni de análisis</strong>{" "}
              (sin Google Analytics, sin píxeles de seguimiento).
            </p>
            <p>Tecnologías técnicas presentes:</p>
            <ul>
              <li>
                <strong>Google Fonts</strong> (Google LLC): al cargar las
                tipografías del sitio, Google puede registrar técnicamente la
                dirección IP del visitante. No controlamos este proceso. Consulte
                la{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--violet)" }}
                >
                  política de privacidad de Google
                </a>
                .
              </li>
              <li>
                <strong>Cloudflare Turnstile</strong>: puede establecer cookies
                técnicas durante la verificación anti-bot del formulario.
                Consulte la{" "}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--violet)" }}
                >
                  política de privacidad de Cloudflare
                </a>
                .
              </li>
              <li>
                <strong>Cookie de sesión administrativa</strong>: solo utilizada
                por el administrador del sitio para acceder al panel privado.
                Los visitantes no reciben esta cookie.
              </li>
            </ul>
          </Seccion>

          <Seccion titulo="Derechos ARCO">
            <p>
              Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u
              Oponerse</strong> (derechos ARCO) al tratamiento de sus datos
              personales, así como a revocar el consentimiento otorgado.
            </p>
            <p>
              Para ejercer sus derechos, envíe un correo a{" "}
              <a href="mailto:contacto@valhallastudio.com.mx" style={{ color: "var(--violet)" }}>
                contacto@valhallastudio.com.mx
              </a>{" "}
              indicando el derecho que desea ejercer y los datos necesarios para
              atender su solicitud. Daremos respuesta en un plazo máximo de{" "}
              <strong>20 días hábiles</strong>.
            </p>
          </Seccion>

          <Seccion titulo="Cambios a este aviso">
            <p>
              Cualquier modificación al presente aviso será publicada en esta
              misma página. La fecha de última actualización aparece al inicio
              del documento.
            </p>
          </Seccion>
        </div>
      </div>
    </main>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: "var(--font-hand), cursive",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 10px",
          borderBottom: "2px solid rgba(42,91,215,0.2)",
          paddingBottom: 6,
        }}
      >
        {titulo}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-body), cursive",
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--ink)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
