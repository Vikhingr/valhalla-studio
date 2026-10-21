# Valhalla Studio — valhallastudio.com.mx

Web personal de Gabriel Castañeda (Gabo): portafolio público + oficina virtual privada.
Responde siempre en español.

@AGENTS.md

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript. Lee `AGENTS.md`: esta versión de Next tiene cambios; revisa `node_modules/next/dist/docs/` antes de usar APIs nuevas.
- Supabase (PostgreSQL) con cliente de servidor `lib/supabase.ts` (service role, solo servidor).
- Resend para correos. Vercel publica solo cada push a `main`.
- Variables en `.env.local` (no se sube): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD, SESSION_SECRET, RESEND_API_KEY.

## Estructura
- `/` → **portafolio 3D a lápiz**: un solo archivo `public/index.html` (Three.js r128 desde cdnjs, todo inline). Se sirve con un rewrite en `next.config.ts`.
  - Datos editables al inicio del `<script>`: `CONFIG` (nombre, WhatsApp, correo, links, decoraciones), `PROJECTS` (tarjetas, tecnologías, galería), `FRAMES` (cuadros del pasillo).
  - Galería de imágenes en `public/galeria/<proyecto>/`.
  - Capítulos: entrada (pared y puerta) → pasillo (cuadros, ventana) → proyectos (televisores en el cielo) → contacto (letreros en el mar). Menú de capítulos abajo a la izquierda.
- `/admin` → **Oficina Virtual** (privada, sin link público). Login con contraseña; cookie `admin_token` validada en `proxy.ts` y `lib/auth.ts`.
  - Secciones: Dashboard, Clientes, Proyectos, Pendientes, Cotizaciones, Cotizador, Facturas (CFDI 4.0 con FacturAPI), RESICO, Decoraciones, Configuración.
- `app/api/portafolio/` → formulario "Mensaje" del portafolio. Envía con Resend a contacto@valhallastudio.com.mx, `replyTo` del visitante, asunto `Valhalla Studio · Nuevo mensaje de <nombre>`. Plantilla en `email.ts` (estilo cuaderno, tablas e inline styles).

## Decoraciones de temporada
- Lista y reglas en `lib/decoraciones.ts` (fechas `MM-DD` hora CDMX; Constitución, Juárez y Revolución usan regla de "n-ésimo lunes" + día histórico).
- Panel: `/admin/decoraciones` → guarda en `configuracion.decoraciones` (jsonb). SQL: `supabase-decoraciones.sql`.
- Pública: `GET /api/decoraciones` (caché 5 min). El portafolio la consulta al cargar; si falla usa `CONFIG.decoraciones` de `public/index.html`.
- **Si agregas o cambias una decoración, actualiza las dos listas** (`lib/decoraciones.ts` y `CONFIG.decoraciones` + `DECO_SPEC` en `public/index.html`).
- Vista previa de cualquier decoración: `/?decoracion=<id>`.

## Estilo visual (mantenerlo en todo)
- Dibujo a lápiz sobre papel arrugado: papel `#efece4`, grafito `#2a2a2e`, lápiz azul `#2a5bd7` (acento). Colores extra solo como "lápiz de color".
- Tipografías: Caveat (títulos a mano), Kalam (texto), Courier Prime (datos/etiquetas).
- Bordes dibujados a mano (`--hand-radius`), cinta adhesiva, renglones de cuaderno.
- En el panel las variables de color se llaman `--violet*` por historia, pero hoy son el lápiz azul. La factura impresa (`#factura-print`) usa letra limpia: no aplicarle estilo a mano.

## Reglas de trabajo
- Haz commit y push al terminar cada cambio que funcione, con mensaje en español que describa qué cambió.
- Antes de hacer push corre `npm run build` y asegúrate de que pase.
- No subas: `.env.local`, `.claude/`, `.agents/`, `skills-lock.json`, `Firmas/`, `Promos/` (ya están en `.gitignore`).
- La web anterior está respaldada en la rama `web-anterior`; no la borres.
- Nunca pongas claves o tokens en el código ni en `public/`.
