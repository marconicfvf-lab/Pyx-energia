import { useState } from "react";
import { getConsent, setConsent, trackingConfigured } from "@/lib/tracking";

export function ConsentBanner() {
  const [visible, setVisible] = useState(() => trackingConfigured() && getConsent() === null);
  if (!visible) return null;

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-black/90 p-4 text-sm text-muted-foreground shadow-2xl backdrop-blur md:flex md:items-center md:gap-4"
    >
      <p className="mb-3 md:mb-0 md:flex-1">
        Usamos cookies para medir a audiência e melhorar nossos anúncios. Veja a{" "}
        <a href="/privacidade" className="text-primary underline">Política de Privacidade</a>.
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => choose("denied")} className="rounded-full border border-white/15 px-4 py-2 text-foreground hover:bg-white/10">
          Recusar
        </button>
        <button type="button" onClick={() => choose("granted")} className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">
          Aceitar
        </button>
      </div>
    </div>
  );
}
