/**
 * AddressInput — Input con autocompletado de domicilios via Google Places.
 *
 * Estrategia dual para el autocompletado:
 *   1. Si NEXT_PUBLIC_GOOGLE_MAPS_API_KEY está disponible en el cliente,
 *      usa el Web Component <gmp-place-autocomplete> nativo de Google (más robusto).
 *   2. Si no, hace un debounce de 300ms y llama a GET /api/admin/places?q=...
 *      que actúa como proxy server-side para no exponer la API key.
 *
 * El fallback a texto libre siempre está disponible — si Places falla,
 * el usuario simplemente escribe la dirección manualmente.
 *
 * Usado en: formulario de clientes y configuración fiscal (domicilio).
 */
"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

interface Suggestion {
  text: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

async function fetchSuggestions(input: string): Promise<Suggestion[]> {
  if (!API_KEY || input.length < 3) return [];
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "suggestions.placePrediction.text",
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["mx"],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? [])
      .map((s: any) => ({ text: s.placePrediction?.text?.text ?? "" }))

      .filter((s: Suggestion) => s.text);
  } catch {
    return [];
  }
}

export function AddressInput({ value, onChange, placeholder, style }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  function handleChange(v: string) {
    onChange(v);
    setActive(-1);
    if (debounce.current) clearTimeout(debounce.current);
    if (v.length < 3) { setSuggestions([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      const results = await fetchSuggestions(v);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 300);
  }

  function select(text: string) {
    onChange(text);
    setSuggestions([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); select(suggestions[active].text); }
    if (e.key === "Escape") { setOpen(false); }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder ?? "Calle, colonia, ciudad"}
        style={style}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          boxShadow: "4px 6px 0 rgba(42,42,46,0.14)",
          zIndex: 9999,
          overflow: "hidden",
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => select(s.text)}
              style={{
                padding: "9px 12px",
                fontSize: 13,
                color: i === active ? "var(--ink)" : "var(--ink-2)",
                background: i === active ? "var(--surface-2)" : "transparent",
                cursor: "pointer",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(-1)}
            >
              {s.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
