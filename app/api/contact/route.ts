import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const projectLabels: Record<string, string> = {
  web: "Sitio web",
  app: "Aplicación web",
  automatizacion: "Automatización",
  otro: "Otro",
};

function buildEmail(name: string, email: string, project: string, message: string) {
  const projectLabel = projectLabels[project] ?? project || "No especificado";
  const date = new Date().toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f0f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f0f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#0f0f1a;border-radius:12px 12px 0 0;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#7c3aed;border-radius:8px;width:34px;height:34px;text-align:center;vertical-align:middle;">
                      <span style="color:#fff;font-size:15px;font-weight:800;line-height:34px;">V</span>
                    </td>
                    <td style="padding-left:10px;vertical-align:middle;">
                      <span style="color:#fff;font-size:15px;font-weight:700;letter-spacing:-0.02em;">Valhalla<span style="color:#a78bfa;">Studio</span></span>
                    </td>
                  </tr>
                </table>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="background:#7c3aed22;border:1px solid #7c3aed55;border-radius:100px;color:#a78bfa;font-size:11px;font-weight:600;padding:4px 12px;letter-spacing:0.03em;">NUEVO CONTACTO</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Hero line -->
        <tr><td style="background:#18182a;padding:20px 36px 24px;border-bottom:1px solid #2a2a40;">
          <p style="margin:0;color:#e2e2f0;font-size:18px;font-weight:700;letter-spacing:-0.02em;">
            ${esc(name)} quiere hablar contigo
          </p>
          <p style="margin:6px 0 0;color:#64648a;font-size:12px;">${date}</p>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:#ffffff;padding:28px 36px;">

          <!-- Info rows -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:16px;border-bottom:1px solid #f0eef8;padding-top:0;">
                <p style="margin:0 0 3px;color:#9090b0;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Nombre</p>
                <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;">${esc(name)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #f0eef8;">
                <p style="margin:0 0 3px;color:#9090b0;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Email</p>
                <a href="mailto:${esc(email)}" style="color:#7c3aed;font-size:14px;font-weight:600;text-decoration:none;">${esc(email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #f0eef8;">
                <p style="margin:0 0 3px;color:#9090b0;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Tipo de proyecto</p>
                <p style="margin:0;">
                  <span style="background:#f3f0ff;border:1px solid #ddd6fe;border-radius:100px;color:#7c3aed;font-size:12px;font-weight:600;padding:3px 12px;">${esc(projectLabel)}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;">
                <p style="margin:0 0 10px;color:#9090b0;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Mensaje</p>
                <div style="background:#f8f7ff;border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:14px 16px;">
                  <p style="margin:0;color:#2d2d4e;font-size:14px;line-height:1.7;white-space:pre-line;">${esc(message)}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Reply CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td align="center">
                <a href="mailto:${esc(email)}?subject=Re: Tu mensaje a Valhalla Studio"
                   style="background:#7c3aed;color:#fff;font-size:13px;font-weight:600;padding:12px 28px;border-radius:100px;text-decoration:none;display:inline-block;">
                  Responder a ${esc(name)} →
                </a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f7ff;border-radius:0 0 12px 12px;padding:16px 36px;border-top:1px solid #ede9fe;">
          <p style="margin:0;color:#9090b0;font-size:11px;text-align:center;">
            Mensaje recibido desde el formulario de <strong style="color:#7c3aed;">valhallaestudio.com.mx</strong>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const { name, email, project, message } = await req.json();

  try {
    await resend.emails.send({
      from: "Valhalla Studio <contacto@valhallastudio.com.mx>",
      to: "contacto@valhallastudio.com.mx",
      replyTo: email,
      subject: `Valhalla Studio — ${esc(name)} quiere hablar contigo`,
      html: buildEmail(name, email, project, message),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
