import dynamic from "next/dynamic";

export const instant = false;
export const metadata = { title: "RESICO — Valhalla Studio" };

const ResicоClient = dynamic(() => import("./ResicоClient"), { ssr: false });

export default function ResicоPage() {
  return <ResicоClient />;
}
