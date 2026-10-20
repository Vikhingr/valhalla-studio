/**
 * ConfiguracionClient — Módulo de configuración fiscal del emisor.
 *
 * Gestiona la fila única `id='global'` de la tabla `configuracion`.
 * Secciones:
 *   1. Datos fiscales básicos: RFC, nombre, régimen, CP, domicilio.
 *   2. FacturAPI: clave de API (test/live), modo de operación.
 *      La clave se cifra en el servidor (AES-256) antes de guardarse.
 *   3. Certificado de Sello Digital (CSD): sube .cer, .key y contraseña.
 *      Los tres archivos se cifran en el servidor.
 *   4. Usos CFDI visibles: subset del catálogo SAT que aparece en el
 *      formulario de factura (evita mostrar todos los ~20 usos).
 *   5. Alertas RESICO: días de anticipación para avisar del vencimiento.
 *
 * Los campos sensibles nunca regresan al cliente (solo boolean has_*).
 * El EyeSlash/Eye toggle muestra/oculta la clave de FacturAPI en el input.
 */
"use client";
import { useState, useRef } from "react";
import { CheckCircle, Warning, Eye, EyeSlash, UploadSimple, Gear } from "@phosphor-icons/react";
import type { ConfiguracionFiscal } from "@/lib/types";
import { REGIMENES_FISCALES, USOS_CFDI, USOS_CFDI_DEFAULT } from "@/lib/types";
import { AddressInput } from "@/components/AddressInput";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 7,
  padding: "9px 12px",
  color: "var(--ink)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
        {label} {required && <span style={{ color: "oklch(0.47 0.18 25)" }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
      color: ok ? "oklch(0.52 0.18 160)" : "var(--muted)",
      background: ok ? "oklch(0.62 0.18 160 / 0.1)" : "var(--surface-2)",
      border: `1px solid ${ok ? "oklch(0.62 0.18 160 / 0.3)" : "var(--border)"}`,
      borderRadius: 100, padding: "3px 10px",
    }}>
      {ok ? <CheckCircle size={12} weight="fill" /> : <Warning size={12} weight="fill" />}
      {label}
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type InitialConfig = ConfiguracionFiscal & {
  updated_at: string | null;
  resico_alerta_1?: number | null;
  resico_alerta_2?: number | null;
  resico_alerta_3?: number | null;
};

export default function ConfiguracionClient({ initial }: { initial: InitialConfig }) {
  const [form, setForm] = useState({
    rfc_emisor: initial.rfc_emisor ?? "",
    nombre_emisor: initial.nombre_emisor ?? "",
    nombre_comercial: initial.nombre_comercial ?? "",
    regimen_fiscal: initial.regimen_fiscal ?? "612",
    codigo_postal: initial.codigo_postal ?? "",
    domicilio_fiscal: initial.domicilio_fiscal ?? "",
    facturapi_mode: initial.facturapi_mode ?? "test",
    facturapi_key: "",
    csd_password: "",
  });

  const [alertas, setAlertas] = useState({
    a1: initial.resico_alerta_1 ?? 5,
    a2: initial.resico_alerta_2 ?? 10,
    a3: initial.resico_alerta_3 ?? 15,
  });

  const [hasCer, setHasCer] = useState(initial.has_cer);
  const [hasKey, setHasKey] = useState(initial.has_key);
  const [hasPassword, setHasPassword] = useState(initial.has_password);
  const [hasFacApi, setHasFacApi] = useState(initial.has_facturapi_key);

  const [cerFile, setCerFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCsdPass, setShowCsdPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initial.updated_at);
  const [error, setError] = useState<string | null>(null);

  // Usos CFDI visibles: null = usar defaults
  const [usosVisibles, setUsosVisibles] = useState<string[]>(
    initial.usos_cfdi_visibles ?? USOS_CFDI_DEFAULT
  );

  const cerRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleUso(value: string) {
    setUsosVisibles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        rfc_emisor: form.rfc_emisor.toUpperCase().trim(),
        nombre_emisor: form.nombre_emisor.trim(),
        nombre_comercial: form.nombre_comercial.trim(),
        regimen_fiscal: form.regimen_fiscal,
        codigo_postal: form.codigo_postal.trim(),
        domicilio_fiscal: form.domicilio_fiscal.trim() || null,
        facturapi_mode: form.facturapi_mode,
        usos_cfdi_visibles: usosVisibles,
      };

      if (form.facturapi_key.trim()) payload.facturapi_key = form.facturapi_key.trim();
      if (form.csd_password.trim()) payload.csd_password = form.csd_password.trim();
      if (cerFile) payload.cer_data = await fileToBase64(cerFile);
      if (keyFile) payload.key_data = await fileToBase64(keyFile);
      payload.resico_alerta_1 = alertas.a1;
      payload.resico_alerta_2 = alertas.a2;
      payload.resico_alerta_3 = alertas.a3;

      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar");
        return;
      }

      if (form.facturapi_key.trim()) setHasFacApi(true);
      if (cerFile) setHasCer(true);
      if (keyFile) setHasKey(true);
      if (form.csd_password.trim()) setHasPassword(true);

      setForm((f) => ({ ...f, facturapi_key: "", csd_password: "" }));
      setCerFile(null);
      setKeyFile(null);
      setSavedAt(new Date().toISOString());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Gear size={20} weight="duotone" style={{ color: "var(--violet-light)" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>Configuración Fiscal</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Datos del emisor y credenciales para emitir CFDI con Facturapi.
          {savedAt && (
            <span style={{ marginLeft: 8, color: "oklch(0.52 0.18 160)" }}>
              ✓ Guardado {new Date(savedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </p>
      </div>

      {/* Datos del emisor */}
      <Section title="Datos del emisor (CFDI 4.0)">
        <div className="config-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="RFC" required hint="13 caracteres para persona física">
            <input
              style={{ ...inputStyle, textTransform: "uppercase" }}
              value={form.rfc_emisor}
              onChange={(e) => set("rfc_emisor", e.target.value.toUpperCase())}
              placeholder="ABCD123456EFG"
              maxLength={13}
            />
          </Field>
          <Field label="Código postal" required>
            <input
              style={inputStyle}
              value={form.codigo_postal}
              onChange={(e) => set("codigo_postal", e.target.value)}
              placeholder="06600"
              maxLength={5}
            />
          </Field>
        </div>
        <Field label="Nombre o razón social" required>
          <input
            style={inputStyle}
            value={form.nombre_emisor}
            onChange={(e) => set("nombre_emisor", e.target.value)}
            placeholder="TU NOMBRE COMPLETO EN MAYÚSCULAS"
          />
        </Field>
        <Field label="Domicilio fiscal" hint="Aparece en la factura impresa. Puedes buscar con Google Places si tienes la clave configurada.">
          <AddressInput
            value={form.domicilio_fiscal}
            onChange={(v) => set("domicilio_fiscal", v)}
            placeholder="Calle, número, colonia, alcaldía / municipio, estado, C.P."
            style={inputStyle}
          />
        </Field>
        <Field label="Nombre comercial" hint="Opcional — aparece en PDF como nombre de la empresa">
          <input
            style={inputStyle}
            value={form.nombre_comercial}
            onChange={(e) => set("nombre_comercial", e.target.value)}
            placeholder="Valhalla Studio"
          />
        </Field>
        <Field label="Régimen fiscal" required>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={form.regimen_fiscal}
            onChange={(e) => set("regimen_fiscal", e.target.value)}
          >
            {REGIMENES_FISCALES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
      </Section>

      {/* Usos CFDI visibles */}
      <Section title="Usos CFDI visibles en facturas">
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          Selecciona cuáles aparecen en el formulario al crear una factura.
          Seleccionados: <strong style={{ color: "var(--ink)" }}>{usosVisibles.length}</strong> de {USOS_CFDI.length}
        </p>
        <div className="config-cfdi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {USOS_CFDI.map((uso) => {
            const activo = usosVisibles.includes(uso.value);
            return (
              <label
                key={uso.value}
                style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  background: activo ? "oklch(0.60 0.18 262 / 0.06)" : "var(--surface-2)",
                  border: `1px solid ${activo ? "oklch(0.60 0.18 262 / 0.3)" : "var(--border)"}`,
                  borderRadius: 7, padding: "7px 10px", fontSize: 12, transition: "all 0.1s",
                }}
                onClick={() => toggleUso(uso.value)}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${activo ? "var(--violet)" : "var(--border)"}`,
                  background: activo ? "var(--violet)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {activo && <CheckCircle size={11} weight="fill" style={{ color: "#fff" }} />}
                </div>
                <span style={{ color: activo ? "var(--ink)" : "var(--muted)", fontWeight: activo ? 500 : 400, lineHeight: 1.3 }}>
                  <strong style={{ fontFamily: "monospace", fontSize: 11 }}>{uso.value}</strong>{" "}
                  {uso.label.replace(`${uso.value} — `, "")}
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Facturapi */}
      <Section title="Facturapi (PAC para timbrado)">
        <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
          Crea tu cuenta en <strong style={{ color: "var(--ink)" }}>facturapi.io</strong> y obtén tu API key. Modo test es gratis y genera CFDIs de prueba; modo live requiere suscripción y genera CFDIs válidos ante el SAT.
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>Modo:</span>
          {(["test", "live"] as const).map((m) => (
            <label key={m} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13 }}>
              <div
                onClick={() => set("facturapi_mode", m)}
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${form.facturapi_mode === m ? "var(--violet)" : "var(--border)"}`,
                  background: form.facturapi_mode === m ? "var(--violet)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                {form.facturapi_mode === m && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <span style={{ color: form.facturapi_mode === m ? "var(--ink)" : "var(--muted)", fontWeight: form.facturapi_mode === m ? 600 : 400 }}>
                {m === "test" ? "Test (pruebas)" : "Live (producción SAT)"}
              </span>
            </label>
          ))}
        </div>

        <Field label="API Key de Facturapi" hint={hasFacApi ? "Ya hay una API key guardada. Pega una nueva para reemplazarla." : undefined}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type={showApiKey ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: 40 }}
                value={form.facturapi_key}
                onChange={(e) => set("facturapi_key", e.target.value)}
                placeholder={hasFacApi ? "••••••••••••••••••••••••" : "sk_live_... o sk_test_..."}
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}
              >
                {showApiKey ? <EyeSlash size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <StatusBadge ok={hasFacApi} label={hasFacApi ? "Configurado" : "Sin configurar"} />
          </div>
        </Field>
      </Section>

      {/* CSD */}
      <Section title="Certificado de Sello Digital (CSD)">
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          El CSD lo genera el SAT para tu RFC. Los archivos .cer y .key se almacenan <strong style={{ color: "var(--ink)" }}>cifrados con AES-256</strong> usando tu SESSION_SECRET. Nunca son visibles en texto plano.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* .cer */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
            <StatusBadge ok={hasCer || !!cerFile} label={cerFile ? cerFile.name : hasCer ? ".cer cargado" : "Sin .cer"} />
            <button
              type="button"
              onClick={() => cerRef.current?.click()}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--violet-light)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
            >
              <UploadSimple size={13} /> {hasCer ? "Reemplazar .cer" : "Cargar .cer"}
            </button>
            <input ref={cerRef} type="file" accept=".cer" style={{ display: "none" }} onChange={(e) => setCerFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* .key */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
            <StatusBadge ok={hasKey || !!keyFile} label={keyFile ? keyFile.name : hasKey ? ".key cargado" : "Sin .key"} />
            <button
              type="button"
              onClick={() => keyRef.current?.click()}
              style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--violet-light)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
            >
              <UploadSimple size={13} /> {hasKey ? "Reemplazar .key" : "Cargar .key"}
            </button>
            <input ref={keyRef} type="file" accept=".key" style={{ display: "none" }} onChange={(e) => setKeyFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Contraseña */}
          <Field label="Contraseña del CSD" hint={hasPassword ? "Ya hay contraseña guardada. Escribe una nueva para reemplazarla." : undefined}>
            <div style={{ position: "relative" }}>
              <input
                type={showCsdPass ? "text" : "password"}
                style={{ ...inputStyle, paddingRight: 40 }}
                value={form.csd_password}
                onChange={(e) => set("csd_password", e.target.value)}
                placeholder={hasPassword ? "••••••••" : "Contraseña del CSD (del SAT)"}
              />
              <button
                type="button"
                onClick={() => setShowCsdPass((v) => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 0 }}
              >
                {showCsdPass ? <EyeSlash size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>
      </Section>

      {/* Alertas RESICO */}
      <Section title="Alertas RESICO — Declaración mensual">
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          Configura los días del mes en que aparece el aviso en el Dashboard recordándote declarar antes del día 17.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(["a1", "a2", "a3"] as const).map((k, i) => (
            <Field key={k} label={`Alerta ${i + 1} — día del mes`} hint="Debe ser menor al 17">
              <input
                type="number"
                min={1} max={16}
                style={{ ...inputStyle, width: 90 }}
                value={alertas[k]}
                onChange={(e) => setAlertas((prev) => ({ ...prev, [k]: Math.min(16, Math.max(1, Number(e.target.value))) }))}
              />
            </Field>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)" }}>
          Valores por defecto: día 5, 10 y 15. El aviso aparece solo el día exacto si aún no ha pasado el día 17.
        </p>
      </Section>

      {error && (
        <div style={{ background: "oklch(0.88 0.10 25 / 0.2)", border: "1px solid oklch(0.50 0.15 25 / 0.4)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "oklch(0.62 0.12 25)", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ padding: "11px 28px", fontSize: 14, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
      <style>{`
        @media (max-width: 560px) {
          .config-two-col { grid-template-columns: 1fr !important; }
          .config-cfdi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
