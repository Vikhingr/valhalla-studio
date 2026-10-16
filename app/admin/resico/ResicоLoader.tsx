/**
 * ResicоLoader — Wrapper "use client" que importa ResicоClient con SSR desactivado.
 *
 * ResicоClient usa `document` y fetch del lado cliente, lo que hace que Next.js falle
 * en prerender. dynamic({ ssr: false }) difiere la carga hasta el lado cliente.
 * Este componente es el intermediario necesario porque `dynamic` solo funciona
 * dentro de Client Components cuando se usa en el App Router.
 *
 * El nombre usa "о" cirílica — ver nota en resico/page.tsx.
 */
"use client";
import dynamic from "next/dynamic";

const ResicоClient = dynamic(() => import("./ResicоClient"), { ssr: false });

export default function ResicоLoader() {
  return <ResicоClient />;
}
