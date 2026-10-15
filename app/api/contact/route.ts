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

export async function POST(req: NextRequest) {
  const { name, email, project, message } = await req.json();

  try {
    await resend.emails.send({
      from: "Valhalla Studio <contacto@valhallastudio.com.mx>",
      to: "contacto@valhallastudio.com.mx",
      replyTo: email,
      subject: `Valhalla Studio - Nuevo contacto de ${esc(name)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Nuevo mensaje desde el portafolio</h2>
          <p><strong>Nombre:</strong> ${esc(name)}</p>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Tipo de proyecto:</strong> ${esc(project || "No especificado")}</p>
          <hr style="border: 1px solid #eee; margin: 16px 0;" />
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-line;">${esc(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
