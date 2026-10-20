// Plantilla del correo que llega a contacto@valhallastudio.com.mx
// Mismo estilo del portafolio: papel, grafito, hoja de cuaderno y lápiz azul.
// Todo va con estilos en línea y tablas para que se vea bien en Gmail, Outlook y Apple Mail.

export type DatosMensaje = {
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
  fecha: string;
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const C = {
  papel: '#efece4',
  hoja: '#f8f6f0',
  grafito: '#2a2a2e',
  suave: '#6d6b70',
  azul: '#2a5bd7',
  renglon: '#d6def4',
  margen: '#e3a9a9',
  cinta: '#e2d9b8',
};
const MANO = "'Caveat','Segoe Print','Bradley Hand','Comic Sans MS',cursive";
const TEXTO = "'Kalam',Georgia,'Times New Roman',serif";
const MONO = "'Courier Prime','Courier New',monospace";

function whatsapp(tel: string) {
  const d = tel.replace(/\D/g, '');
  if (!d) return '';
  return 'https://wa.me/' + (d.length === 10 ? '52' + d : d);
}

function renglon(etiqueta: string, valorHtml: string) {
  return `
    <tr>
      <td style="width:28px;border-right:2px solid ${C.margen};"></td>
      <td style="padding:10px 0 8px 16px;border-bottom:1px solid ${C.renglon};">
        <div style="font-family:${MANO};font-size:22px;font-weight:700;line-height:1.1;color:${C.grafito};">${etiqueta}</div>
        <div style="font-family:${TEXTO};font-size:16px;line-height:1.5;color:${C.grafito};padding-top:2px;">${valorHtml}</div>
      </td>
    </tr>`;
}

export function emailPortafolio(d: DatosMensaje) {
  const nombre = esc(d.nombre);
  const correo = esc(d.correo);
  const tel = d.telefono ? esc(d.telefono) : '';
  const wa = whatsapp(d.telefono);
  const mensaje = esc(d.mensaje).replace(/\r?\n/g, '<br>');
  const responder = `mailto:${encodeURIComponent(d.correo)}?subject=${encodeURIComponent('Re: tu mensaje a Valhalla Studio')}`;

  const boton = (href: string, texto: string, principal: boolean) => `
    <td style="padding:0 10px 10px 0;">
      <a href="${href}" style="display:inline-block;white-space:nowrap;font-family:${MANO};font-size:22px;font-weight:700;line-height:1;text-decoration:none;
        color:${principal ? C.azul : C.grafito};border:2px solid ${principal ? C.azul : C.grafito};border-radius:14px 4px 16px 5px;padding:11px 18px;">${texto}</a>
    </td>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>Nuevo mensaje del portafolio</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Kalam&family=Courier+Prime&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.papel};">
<div style="display:none;max-height:0;overflow:hidden;">${nombre} te escribió desde tu portafolio.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.papel};">
  <tr><td align="center" style="padding:32px 12px;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td align="center" style="padding-bottom:0;">
        <div style="width:110px;height:22px;background:${C.cinta};border:1px solid #d5cba6;"></div>
      </td></tr>
      <tr><td style="background:${C.hoja};border:2px solid ${C.grafito};border-radius:16px 5px 18px 6px;padding:26px 24px 22px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:${MONO};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.suave};white-space:nowrap;padding:4px 10px 4px 0;">Mensaje web</td>
            <td align="right" style="padding:2px 0;">
              <span style="display:inline-block;white-space:nowrap;font-family:${MONO};font-size:12px;letter-spacing:.5px;line-height:1;color:${C.azul};
                background:#eef1fb;border:1.5px solid ${C.azul};border-radius:12px 4px 14px 5px;padding:6px 10px;">${esc(d.fecha)}</span>
            </td>
          </tr>
        </table>
        <div style="font-family:${MANO};font-size:40px;font-weight:700;line-height:1.05;color:${C.grafito};padding:6px 0 4px;">Nuevo mensaje de ${nombre}</div>
        <div style="width:180px;border-bottom:2px solid ${C.grafito};margin:6px 0 18px;"></div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${renglon('Nombre', nombre)}
          ${renglon('Correo', `<a href="mailto:${correo}" style="color:${C.azul};text-decoration:underline;">${correo}</a>`)}
          ${tel ? renglon('Teléfono', wa ? `<a href="${wa}" style="color:${C.azul};text-decoration:underline;">${tel}</a>` : tel) : ''}
          ${renglon('¿Qué necesita?', mensaje)}
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
          <tr>
            ${boton(responder, 'Responder', true)}
            ${wa ? boton(wa, 'WhatsApp', false) : ''}
          </tr>
        </table>

        <div style="font-family:${TEXTO};font-size:13px;line-height:1.5;color:${C.suave};padding-top:10px;">
          Mensaje recibido desde el formulario de valhallastudio.com.mx
        </div>
      </td></tr>
      <tr><td align="right" style="padding:14px 6px 0;font-family:${MONO};font-size:12px;letter-spacing:1px;color:${C.grafito};">
        Design by <span style="font-family:${MANO};font-size:20px;font-weight:700;letter-spacing:0;color:${C.azul};">Valhalla Studio</span>
      </td></tr>
    </table>

  </td></tr>
</table>
</body>
</html>`;
}

// Versión en texto plano (para clientes que no muestran HTML y para evitar spam)
export function textoPortafolio(d: DatosMensaje) {
  return [
    'Nuevo mensaje · Valhalla Studio',
    '',
    `Nombre: ${d.nombre}`,
    `Correo: ${d.correo}`,
    `Teléfono: ${d.telefono || '—'}`,
    `Fecha: ${d.fecha}`,
    '',
    '¿Qué necesita?',
    d.mensaje,
    '',
    'Mensaje recibido desde el formulario de valhallastudio.com.mx',
  ].join('\n');
}
