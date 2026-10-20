# Valhalla Studio — versión a lápiz

## Qué cambió
- `/` ahora es el portafolio 3D a lápiz (`public/index.html` + `public/galeria/`).
  Se sirve con un rewrite en `next.config.ts`.
- El formulario "Mensaje" del portafolio envía con Resend vía `app/api/portafolio/`
  (asunto: `[Valhalla Studio] Nuevo mensaje · Nombre`, replyTo del visitante).
- Se quitó la landing anterior (`app/page.tsx`, `components/Hero, About, Projects,
  Services, Contact, Navbar, Footer, FloatingWhatsApp`) y `app/api/contact`.
- La Oficina Virtual (`/admin`) conserva toda su lógica y datos; solo cambió el estilo:
  papel, grafito, lápiz azul, tipografías Caveat / Kalam / Courier Prime,
  menú tipo cuaderno, tarjetas con borde a mano.
- La factura impresa mantiene letra limpia y bordes rectos (es un documento fiscal).
- Nueva página 404 a lápiz.

## Antes de publicar
1. Copia tu `.env.local` del proyecto original a esta carpeta (no se copió por seguridad).
2. `npm install` y `npm run dev` para revisarlo en tu compu.
3. En tu hosting deben seguir las mismas variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
   ADMIN_PASSWORD, SESSION_SECRET, RESEND_API_KEY (y las de FacturAPI / Google Places si las usas).
