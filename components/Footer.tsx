export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Valhalla<span style={{ color: "var(--violet-light)" }}>Studio</span>
          </span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          © 2026 Gabriel Castañeda · Valhalla Studio
        </p>
      </div>
    </footer>
  );
}
