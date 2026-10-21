/**
 * DecoracionesClient — Interruptores y fechas de las decoraciones de temporada del portafolio.
 *
 * Cada decoración se muestra en la página principal solo entre "desde" y "hasta" (hora CDMX)
 * y solo si está encendida. "Vista previa" abre /?decoracion=<id> para verla cualquier día.
 * Guardar hace PUT /api/admin/decoraciones. La web pública la toma en máx. 5 minutos (caché).
 */
"use client";
import { useMemo, useState } from "react";
import { CheckCircle, Confetti, Eye, Warning } from "@phosphor-icons/react";
import { DECORACIONES_DEFAULT, DECORACIONES_DETALLE, MESES_LARGOS, type Decoracion, type ModoLunes, decoracionDeHoy, enRango, hoyCDMX, nLunes } from "@/lib/decoraciones";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const selectStyle: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7,
  padding: "7px 8px", color: "var(--ink)", fontSize: 14, fontFamily: "inherit",
};

function Fecha({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  const [m, d] = value.split("-");
  const set = (mm: string, dd: string) => onChange(`${mm}-${dd}`);
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
      <span style={{ minWidth: 40, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>{label}</span>
      <select aria-label={`${label}: día`} value={d} disabled={disabled} onChange={(e) => set(m, e.target.value)} style={selectStyle}>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((x) => <option key={x} value={x}>{Number(x)}</option>)}
      </select>
      <select aria-label={`${label}: mes`} value={m} disabled={disabled} onChange={(e) => set(e.target.value, d)} style={selectStyle}>
        {MESES.map((x, i) => <option key={x} value={String(i + 1).padStart(2, "0")}>{x}</option>)}
      </select>
    </label>
  );
}

function rango(d: Decoracion) {
  const f = (s: string) => `${Number(s.slice(3))} ${MESES[Number(s.slice(0, 2)) - 1]}`;
  return d.desde === d.hasta ? f(d.desde) : `${f(d.desde)} – ${f(d.hasta)}`;
}

export default function DecoracionesClient({ initial, sinColumna }: { initial: Decoracion[]; sinColumna: boolean }) {
  const [lista, setLista] = useState<Decoracion[]>(initial);
  const [guardado, setGuardado] = useState<Decoracion[]>(initial);
  const [estado, setEstado] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const hoy = hoyCDMX();
  const deHoy = useMemo(() => decoracionDeHoy(lista, hoy), [lista, hoy]);
  const cambios = JSON.stringify(lista) !== JSON.stringify(guardado);

  const actualizar = (id: string, campos: Partial<Decoracion>) =>
    setLista((l) => l.map((d) => (d.id === id ? { ...d, ...campos } : d)));

  async function guardar() {
    setGuardando(true); setEstado(null);
    try {
      const res = await fetch("/api/admin/decoraciones", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decoraciones: lista }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "No se pudo guardar");
      setLista(j.decoraciones); setGuardado(j.decoraciones);
      setEstado({ tipo: "ok", texto: "Guardado. La web lo mostrará en máximo 5 minutos." });
    } catch (e) {
      setEstado({ tipo: "error", texto: `No se guardó: ${(e as Error).message}. Revisa que ejecutaste supabase-decoraciones.sql.` });
    } finally { setGuardando(false); }
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 10 }}>
          <Confetti size={26} /> Decoraciones
        </h1>
        <button className="btn-primary" onClick={guardar} disabled={!cambios || guardando} style={{ opacity: !cambios || guardando ? 0.5 : 1 }}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 18, maxWidth: "62ch" }}>
        La entrada de tu web se decora sola en estas fechas (hora de CDMX) y vuelve a la normalidad al terminar.
        Apaga las que no quieras o cambia sus días.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", marginBottom: 18, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14 }}>
        <Confetti size={18} style={{ color: "var(--violet)" }} />
        {deHoy
          ? <span>Hoy tu web muestra: <strong>{deHoy.nombre}</strong></span>
          : <span style={{ color: "var(--muted)" }}>Hoy tu web no tiene decoración.</span>}
      </div>

      {sinColumna && (
        <div role="alert" style={{ display: "flex", gap: 10, padding: "12px 16px", marginBottom: 18, background: "oklch(0.96 0.05 60 / 0.7)", border: "1px solid oklch(0.57 0.15 60 / 0.4)", borderRadius: 10, fontSize: 13 }}>
          <Warning size={18} weight="fill" style={{ color: "oklch(0.55 0.15 60)", flexShrink: 0 }} />
          <span>Falta un paso en Supabase: ejecuta el archivo <code>supabase-decoraciones.sql</code> en el SQL Editor. Mientras tanto la web usa las fechas de fábrica.</span>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {lista.map((d) => {
          const activaHoy = d.activa && deHoy?.id === d.id;
          const fabrica = DECORACIONES_DEFAULT.find((x) => x.id === d.id)!;
          const esFabrica = fabrica.desde === d.desde && fabrica.hasta === d.hasta;
          return (
            <div key={d.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", opacity: d.activa ? 1 : 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: "1 1 240px", minWidth: 0 }}>
                  <input type="checkbox" checked={d.activa} onChange={(e) => actualizar(d.id, { activa: e.target.checked })} style={{ width: 18, height: 18 }} />
                  <span style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{d.nombre}</h3>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{DECORACIONES_DETALLE[d.id]}</span>
                  </span>
                </label>
                {activaHoy && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "oklch(0.52 0.18 160)", background: "oklch(0.62 0.18 160 / 0.1)", border: "1px solid oklch(0.62 0.18 160 / 0.3)", borderRadius: 100, padding: "3px 10px" }}>
                    <CheckCircle size={12} weight="fill" /> En la web hoy
                  </span>
                )}
                {!activaHoy && d.activa && enRango(d, hoy) && (
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Hoy gana otra decoración</span>
                )}
                <a href={`/?decoracion=${d.id}`} target="_blank" rel="noopener" className="btn-secondary" style={{ padding: "7px 14px", fontSize: 17 }}>
                  <Eye size={16} /> Vista previa
                </a>
              </div>
              {d.lunes ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 12, paddingLeft: 28 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                    <span style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: "0.05em" }}>Mostrar</span>
                    <select value={d.modo ?? "ambos"} disabled={!d.activa} onChange={(e) => actualizar(d.id, { modo: e.target.value as ModoLunes })} style={selectStyle}>
                      <option value="ambos">el lunes de descanso y el día histórico</option>
                      <option value="lunes">solo el lunes de descanso</option>
                      <option value="historico">solo el día histórico</option>
                    </select>
                  </label>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    Descanso: {d.lunes.n === 1 ? "primer" : "tercer"} lunes de {MESES_LARGOS[d.lunes.mes - 1]} (en {hoy.y}: lunes {nLunes(hoy.y, d.lunes.mes, d.lunes.n)}
                    {" · "}en {hoy.y + 1}: lunes {nLunes(hoy.y + 1, d.lunes.mes, d.lunes.n)})
                  </span>
                  {d.modo !== "lunes" && (
                    <Fecha label="Histórico" value={d.desde} disabled={!d.activa} onChange={(v) => actualizar(d.id, { desde: v, hasta: v })} />
                  )}
                </div>
              ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 12, paddingLeft: 28 }}>
                <Fecha label="Desde" value={d.desde} disabled={!d.activa} onChange={(v) => actualizar(d.id, { desde: v })} />
                <Fecha label="Hasta" value={d.hasta} disabled={!d.activa} onChange={(v) => actualizar(d.id, { hasta: v })} />
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  {rango(d)}
                  {!esFabrica && (
                    <button type="button" onClick={() => actualizar(d.id, { desde: fabrica.desde, hasta: fabrica.hasta })}
                      style={{ marginLeft: 8, background: "none", border: 0, color: "var(--violet)", textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                      volver a {rango(fabrica)}
                    </button>
                  )}
                </span>
              </div>
              )}
            </div>
          );
        })}
      </div>

      {estado && (
        <p role="status" style={{ marginTop: 16, fontSize: 14, color: estado.tipo === "ok" ? "oklch(0.52 0.18 160)" : "oklch(0.50 0.16 25)" }}>
          {estado.texto}
        </p>
      )}
      <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
        Si dos fechas se enciman, se muestra la que está más arriba en la lista.
      </p>
    </div>
  );
}
