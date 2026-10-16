"use client";
import dynamic from "next/dynamic";

const ResicоClient = dynamic(() => import("./ResicоClient"), { ssr: false });

export default function ResicоLoader() {
  return <ResicоClient />;
}
