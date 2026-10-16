/**
 * StageAdvancer — Componente para avanzar la etapa de un proyecto con checklist guiada.
 *
 * Muestra un modal con una checklist específica para cada transición de etapa
 * (ej. cotizacion → discovery incluye "cliente aceptó y hay acuerdo por escrito").
 * La intención es que Gabriel no avance un proyecto sin completar los pasos críticos.
 *
 * Al confirmar, hace PATCH /api/admin/proyectos/[id] con la nueva stage.
 * Las checklists son orientativas (no se persisten en BD) — solo bloquean el botón
 * de confirmar visualmente hasta que el usuario marca todos los items.
 */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Circle, X } from "@phosphor-icons/react";
import { STAGES } from "@/lib/types";
import type { ProjectStage } from "@/lib/types";

type CheckItem = { text: string; tip?: string };

const STAGE_GUIDES: Record<ProjectStage, { title: string; description: string; checklist: CheckItem[] }> = {
  cotizacion: {
    title: "Antes de pasar a Discovery",
    description: "El cliente dijo que sí. Ahora formaliza el acuerdo antes de trabajar.",
    checklist: [
      { text: "El cliente aceptó la propuesta y el precio", tip: "Guarda su confirmación por escrito (WhatsApp o email). Nunca de palabra." },
      { text: "Cobraste el anticipo del 50%", tip: "Sin anticipo, no empieces. Es la regla de oro del freelance." },
      { text: "Tienes claro el alcance: qué incluye y qué NO", tip: "Todo lo que no está en la propuesta es un extra. Dilo desde el inicio." },
      { text: "Estableciste una fecha estimada de entrega", tip: "Sé realista. Es mejor sobre-entregar que incumplir." },
    ],
  },
  discovery: {
    title: "Antes de pasar a Diseño",
    description: "Recopila todo lo que necesitas antes de abrir Figma o tu editor.",
    checklist: [
      { text: "Tienes los textos / copy del sitio", tip: "Pídele al cliente los textos. Sin contenido real no puedes diseñar bien." },
      { text: "Tienes el logo en vectores (SVG o AI)", tip: "Si no tienen logo, es un servicio extra o usas uno temporal." },
      { text: "Tienes referencias visuales del cliente", tip: "Pídele 3-5 sitios que le gusten. Ahorra malentendidos." },
      { text: "Acordaron paleta de colores o estilo", tip: "Aunque sea aproximado, un brief visual evita rediseños." },
      { text: "Definiste el sitemap: qué páginas tendrá", tip: "Landing / Nosotros / Servicios / Contacto — lo que sea, confírmalo." },
    ],
  },
  diseno: {
    title: "Antes de pasar a Desarrollo",
    description: "El diseño debe estar aprobado antes de escribir una sola línea de código.",
    checklist: [
      { text: "Entregaste el diseño en Figma o imágenes", tip: "Comparte un link de Figma o capturas de cada pantalla." },
      { text: "El cliente aprobó el diseño por escrito", tip: "Un '✅ me gusta' en WhatsApp es suficiente. Guárdalo." },
      { text: "Cobraste el segundo pago (25%)", tip: "Aprobación de diseño = segundo cobro. Es el acuerdo." },
      { text: "Tienes todo el contenido final (textos, imágenes)", tip: "Que no te lleguen cambios de contenido en desarrollo." },
      { text: "Confirmaste el dominio y hosting a usar", tip: "¿Tiene dominio? ¿Quién paga el hosting? Aclárate ahora." },
    ],
  },
  desarrollo: {
    title: "Antes de pasar a Revisión",
    description: "Antes de enseñarle al cliente, asegúrate de que funciona correctamente.",
    checklist: [
      { text: "El sitio/app funciona en móvil y desktop", tip: "Prueba en iPhone Safari y Chrome Android. Son los más comunes." },
      { text: "Todos los formularios envían correctamente", tip: "Llénalos tú mismo y verifica que llegan los emails." },
      { text: "Los links y botones funcionan", tip: "Recorre el sitio como si fueras un usuario nuevo." },
      { text: "Las imágenes cargan rápido", tip: "Comprime imágenes con squoosh.app o similar. Nada de 5MB." },
      { text: "Tienes un link de staging para compartir", tip: "Vercel o Netlify dan una URL de preview gratis." },
    ],
  },
  revision: {
    title: "Antes de pasar a Entrega",
    description: "El cliente revisó y aprobó. Implementa sus cambios y cierra.",
    checklist: [
      { text: "Recibiste los cambios del cliente por escrito", tip: "Lista numerada de cambios. Evita el 'y también...' interminable." },
      { text: "Implementaste todos los cambios acordados", tip: "Solo los de la lista. Nada extra sin cobrar." },
      { text: "El cliente confirmó que está conforme", tip: "Pídele un 'aprobado' explícito antes de hacer el deploy." },
      { text: "Hiciste pruebas finales después de los cambios", tip: "Un cambio puede romper otra cosa. Revisa." },
    ],
  },
  entrega: {
    title: "Antes de pasar a Cobranza",
    description: "Sube todo a producción y entrega los accesos al cliente.",
    checklist: [
      { text: "El sitio está publicado en el dominio del cliente", tip: "Verifica que el dominio apunta correctamente y carga con HTTPS." },
      { text: "Entregaste los accesos: hosting, CMS, etc.", tip: "Manda usuario y contraseña por un canal seguro (ProtonMail, etc.)." },
      { text: "Hiciste una grabación rápida de capacitación", tip: "Un video de Loom de 5 minutos explicando cómo editar vale oro." },
      { text: "Enviaste la factura o recibo del pago final", tip: "25% restante. Es el momento de cobrarlo." },
    ],
  },
  cobranza: {
    title: "Antes de cerrar en Mantenimiento",
    description: "Cierra el ciclo financiero y deja todo documentado.",
    checklist: [
      { text: "Recibiste el pago final (25% restante)", tip: "Sin pago, no cierres el proyecto formalmente." },
      { text: "Guardaste todas las credenciales en ProtonPass", tip: "Hosting, dominio, CMS, APIs. Todo en una entrada organizada." },
      { text: "El cliente tiene sus propias copias de los accesos", tip: "No seas el único que tiene las contraseñas de su sitio." },
      { text: "Quedó claro si hay mantenimiento mensual o no", tip: "Si no hay plan, el cliente sabe que los cambios futuros tienen costo." },
    ],
  },
  mantenimiento: {
    title: "Proyecto en mantenimiento activo",
    description: "El proyecto está en producción. Tu trabajo es mantenerlo funcionando.",
    checklist: [
      { text: "Tienes acceso al hosting para hacer actualizaciones", tip: "Guarda los accesos al día en ProtonPass." },
      { text: "El cliente sabe cómo contactarte para reportar problemas", tip: "Define tiempos de respuesta: ej. 24-48 horas hábiles." },
      { text: "Tienes claro qué cubre el plan de mantenimiento", tip: "¿Incluye cambios de contenido? ¿Corrección de bugs? ¿Nuevas funciones?" },
    ],
  },
};

export default function StageAdvancer({ projectId, currentStage }: { projectId: string; currentStage: ProjectStage }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
  const nextStage = STAGES[currentIndex + 1];
  const guide = STAGE_GUIDES[currentStage];
  const allChecked = guide.checklist.every((_, i) => checked[i]);

  async function advance() {
    if (!nextStage) return;
    setLoading(true);
    const res = await fetch(`/api/admin/proyectos/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage.id }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (!nextStage) return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "oklch(0.70 0.18 160)", background: "oklch(0.70 0.18 160 / 0.1)", border: "1px solid oklch(0.70 0.18 160 / 0.3)", borderRadius: 8, padding: "8px 14px" }}>
      <CheckCircle size={14} weight="fill" /> Proyecto en mantenimiento
    </div>
  );

  return (
    <>
      <button
        onClick={() => { setChecked({}); setOpen(true); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 18px", borderRadius: 8, border: "none",
          background: "var(--violet)", color: "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        Avanzar a {nextStage.label} <ArrowRight size={14} weight="bold" />
      </button>

      {open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--violet-light)", background: "oklch(0.58 0.22 293 / 0.12)", borderRadius: 100, padding: "3px 10px", marginBottom: 8 }}>
                  {STAGES[currentIndex].label} → {nextStage.label}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{guide.title}</h2>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{guide.description}</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, flexShrink: 0 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {guide.checklist.map((item, i) => (
                <div
                  key={i}
                  onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 14px", borderRadius: 9, cursor: "pointer",
                    border: `1px solid ${checked[i] ? "oklch(0.70 0.18 160 / 0.4)" : "var(--border)"}`,
                    background: checked[i] ? "oklch(0.70 0.18 160 / 0.07)" : "var(--surface-2)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    {checked[i]
                      ? <CheckCircle size={18} weight="fill" style={{ color: "oklch(0.70 0.18 160)" }} />
                      : <Circle size={18} style={{ color: "var(--muted)" }} />
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: checked[i] ? "var(--muted)" : "var(--ink)", textDecoration: checked[i] ? "line-through" : "none" }}>
                      {item.text}
                    </div>
                    {item.tip && (
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>
                        {item.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setOpen(false)} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--ink-2)", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button
                onClick={advance}
                disabled={loading}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: allChecked ? "var(--violet)" : "oklch(0.58 0.22 293 / 0.4)",
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {loading ? "Guardando..." : allChecked ? `Avanzar a ${nextStage.label}` : `Avanzar de todas formas`}
              </button>
            </div>

            {!allChecked && (
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
                Puedes avanzar aunque no hayas marcado todo — es solo una guía.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
