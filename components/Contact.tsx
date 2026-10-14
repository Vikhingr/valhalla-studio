"use client";
import { useState, FormEvent } from "react";
import { WhatsappLogo, Envelope } from "@phosphor-icons/react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", project: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSent(true);
    } finally {
      setSending(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "13px 16px",
    color: "var(--ink)",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
    display: "block",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "var(--muted)",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  return (
    <section id="contacto" style={{ padding: "120px 0", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 80,
            alignItems: "start",
          }}
        >
          {/* Info */}
          <div>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--ink)",
                marginBottom: 16,
              }}
            >
              Hablemos de<br />tu proyecto.
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.72, marginBottom: 48, fontSize: 15, maxWidth: "42ch" }}>
              ¿Tienes una idea? Cuéntame de qué se trata y te respondo en menos de 24 horas con una propuesta.
            </p>

            {/* Contact options */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <a
                href="https://wa.me/525543424718?text=Hola%20Gabriel%2C%20me%20interesa%20cotizar%20un%20proyecto"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ background: "var(--green)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.62 0.17 160)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green)"; }}
              >
                <WhatsappLogo size={18} weight="fill" />
                WhatsApp
              </a>

              <a
                href="mailto:contacto@valhallastudio.com.mx"
                className="btn-secondary"
              >
                <Envelope size={18} weight="fill" />
                Email
              </a>
            </div>
          </div>

          {/* Form */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "36px",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "oklch(0.70 0.18 160 / 0.12)",
                    border: "1px solid var(--green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    color: "var(--green)",
                    fontSize: 24,
                  }}
                >
                  ✓
                </div>
                <h3 style={{ color: "var(--ink)", fontSize: "1.3rem", fontWeight: 700, marginBottom: 10 }}>
                  ¡Mensaje enviado!
                </h3>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>Te respondo en menos de 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ color: "var(--ink)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>
                  Cuéntame tu idea
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      style={inputStyle}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onFocus={(e) => (e.target.style.borderColor = "var(--violet-light)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      style={inputStyle}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      onFocus={(e) => (e.target.style.borderColor = "var(--violet-light)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>¿Qué tipo de proyecto?</label>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "var(--violet-light)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  >
                    <option value="" style={{ background: "#0F0F1A" }}>Selecciona una opción</option>
                    <option value="web" style={{ background: "#0F0F1A" }}>Sitio web</option>
                    <option value="app" style={{ background: "#0F0F1A" }}>Aplicación web</option>
                    <option value="automatizacion" style={{ background: "#0F0F1A" }}>Automatización</option>
                    <option value="otro" style={{ background: "#0F0F1A" }}>Otro</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Cuéntame más</label>
                  <textarea
                    required
                    placeholder="Describe tu proyecto..."
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "var(--violet-light)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={sending}
                  style={{ width: "100%", justifyContent: "center", opacity: sending ? 0.7 : 1 }}
                >
                  {sending ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
