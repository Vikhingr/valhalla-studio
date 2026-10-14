import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, project, message } = await req.json();

  try {
    await resend.emails.send({
      from: "Valhalla Studio <contacto@valhallastudio.com.mx>",
      to: "contacto@valhallastudio.com.mx",
      replyTo: email,
      subject: `Nuevo contacto de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Nuevo mensaje desde el portafolio</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Tipo de proyecto:</strong> ${project || "No especificado"}</p>
          <hr style="border: 1px solid #eee; margin: 16px 0;" />
          <p><strong>Mensaje:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
