import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const input = req.nextUrl.searchParams.get("q");
  if (!input || input.length < 3) return NextResponse.json({ suggestions: [] });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ suggestions: [] });

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.text",
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ["mx"],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Places API error:", res.status, err);
      return NextResponse.json({ suggestions: [] });
    }

    const data = await res.json();
    const suggestions = (data.suggestions ?? [])
      .map((s: any) => s.placePrediction?.text?.text ?? "")
      .filter(Boolean);

    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error("Places fetch error:", e);
    return NextResponse.json({ suggestions: [] });
  }
}
