// Ruta del servidor que recibe el formulario "Mensaje" del portafolio y lo envía con Resend.
// Va en tu proyecto de valhallastudio.com.mx en:  app/api/portafolio/route.ts  (junto con email.ts)
// Usa la misma variable que ya tienes: RESEND_API_KEY en .env.local (y en Vercel → Settings → Environment Variables).

import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { emailPortafolio, textoPortafolio } from './email';

const resend = new Resend(process.env.RESEND_API_KEY);
const CORREO = 'contacto@valhallastudio.com.mx';

// Sitios desde donde se permite enviar (si el portafolio vive en otro dominio, agrégalo aquí)
const ORIGENES = ['https://www.valhallastudio.com.mx', 'https://valhallastudio.com.mx'];

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ORIGENES.includes(origin) ? origin : ORIGENES[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

const limpio = (v: unknown, max: number) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req.headers.get('origin')) });
}

export async function POST(req: Request) {
  const headers = cors(req.headers.get('origin'));

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'formato' }, { status: 400, headers }); }

  // Campo trampa: las personas no lo ven, los bots sí lo llenan
  if (body._honey) return NextResponse.json({ ok: true }, { headers });

  const nombre = limpio(body.nombre, 80);
  const correo = limpio(body.correo, 120);
  const telefono = limpio(body.telefono, 30);
  const mensaje = String(body.mensaje ?? '').trim().slice(0, 3000);

  if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return NextResponse.json({ ok: false, error: 'datos' }, { status: 422, headers });
  }

  // Fecha para el badge, hora de CDMX. Ej.: "20 oct 2026 · 10:42"
  const ahora = new Date();
  const zona = { timeZone: 'America/Mexico_City' } as const;
  const dia = ahora.toLocaleDateString('es-MX', { ...zona, day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '');
  const hora = ahora.toLocaleTimeString('es-MX', { ...zona, hour: '2-digit', minute: '2-digit', hour12: false });
  const fecha = `${dia} · ${hora}`;
  const datos = { nombre, correo, telefono, mensaje, fecha };

  const { error } = await resend.emails.send({
    from: `Valhalla Studio <${CORREO}>`,
    to: CORREO,
    replyTo: correo,
    subject: `Valhalla Studio · Nuevo mensaje de ${nombre}`,
    html: emailPortafolio(datos),
    text: textoPortafolio(datos),
  });

  if (error) {
    console.error('Resend portafolio:', error);
    return NextResponse.json({ ok: false, error: 'envio' }, { status: 502, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}
