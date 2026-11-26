import { trackWhatsAppClick } from "@/lib/tracking";

// Número comercial da PYX (só dígitos, com DDI). Pode ser trocado por VITE_WHATSAPP_NUMBER no Vercel.
export const WHATSAPP_NUMBER = ((import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || "5581988358272").replace(/\D/g, "");

export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Abre o WhatsApp registrando o clique como conversão. */
export function openWhatsApp(origin: string, text?: string): void {
  trackWhatsAppClick(origin);
  window.open(whatsappUrl(text), "_blank", "noopener");
}
