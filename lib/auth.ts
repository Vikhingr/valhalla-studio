import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const jar = await cookies();
  const token = jar.get("admin_token")?.value;
  if (!token || token !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
