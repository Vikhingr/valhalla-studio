/**
 * ClienteDetailPage — Vista de detalle de un cliente (Server Component).
 *
 * Carga en paralelo el cliente y sus proyectos asociados.
 * Si el cliente no existe devuelve 404 vía notFound().
 * Muestra: info básica, referencia ProtonPass (si existe) y lista de proyectos
 * con su etapa actual renderizada como badge de color.
 */
import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STAGES } from "@/lib/types";
import type { Project } from "@/lib/types";
import { ArrowLeft, Key } from "@phosphor-icons/react/dist/ssr";

export const instant = false;

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createServerClient();

  const [{ data: client }, { data: projects }] = await Promise.all([
    db.from("clients").select("*").eq("id", id).single(),
    db.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900 }}>
      <style>{`.cliente-project-link:hover { border-color: oklch(0.38 0.03 280) !important; }`}</style>
      <Link
        href="/admin/clientes"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Clientes
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 4 }}>
        {client.name}
      </h1>
      {client.company && (
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>{client.company}</p>
      )}

      {/* Info card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "18px 20px",
          marginBottom: 28,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { label: "Email", value: client.email },
          { label: "Teléfono", value: client.phone },
          { label: "Notas", value: client.notes },
        ].map(({ label, value }) =>
          value ? (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{value}</div>
            </div>
          ) : null
        )}
        {client.protonpass_ref && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              ProtonPass
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--violet-light)", background: "oklch(0.58 0.22 262 / 0.12)", padding: "4px 10px", borderRadius: 100 }}>
              <Key size={11} /> {client.protonpass_ref}
            </span>
          </div>
        )}
      </div>

      {/* Projects */}
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 14 }}>
        Proyectos ({projects?.length ?? 0})
      </h2>

      {(!projects || projects.length === 0) ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "32px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Sin proyectos aún.</p>
          <Link
            href="/admin/proyectos"
            style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "var(--violet-light)", textDecoration: "none" }}
          >
            Crear proyecto →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(projects as Project[]).map((p) => {
            const stage = STAGES.find((s) => s.id === p.stage);
            return (
              <Link
                key={p.id}
                href={`/admin/proyectos/${p.id}`}
                className="cliente-project-link"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "14px 18px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "border-color 0.15s",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{p.name}</div>
                  {p.deadline && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                      Entrega: {new Date(p.deadline + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.quoted_price && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>
                      {p.quoted_price.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 })}
                    </span>
                  )}
                  {stage && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: stage.color,
                        background: `${stage.color.replace(")", " / 0.12)")}`,
                        padding: "4px 10px",
                        borderRadius: 100,
                      }}
                    >
                      {stage.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
