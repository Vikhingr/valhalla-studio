"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            el: HTMLInputElement,
            opts?: { componentRestrictions?: { country: string }; fields?: string[]; types?: string[] }
          ) => { addListener(e: string, cb: () => void): void; getPlace(): { formatted_address?: string } };
        };
      };
    };
    _gmCb?: () => void;
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function AddressInput({ value, onChange, placeholder, style }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!API_KEY) return;
    if (window.google?.maps?.places) { setReady(true); return; }
    window._gmCb = () => setReady(true);
    if (!document.getElementById("gm-places-script")) {
      const s = document.createElement("script");
      s.id = "gm-places-script";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=_gmCb&loading=async`;
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || !window.google?.maps?.places) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "mx" },
      fields: ["formatted_address"],
      types: ["address"],
    });
    ac.addListener("place_changed", () => {
      const p = ac.getPlace();
      if (p.formatted_address) onChange(p.formatted_address);
    });
  }, [ready, onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Calle, colonia, ciudad"}
      style={style}
      autoComplete="off"
    />
  );
}
