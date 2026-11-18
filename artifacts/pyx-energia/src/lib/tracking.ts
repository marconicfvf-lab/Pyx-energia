// Rastreamento para campanhas (Meta e Google). Só carrega os scripts depois do
// consentimento do visitante (LGPD) e só se os IDs estiverem definidos nas
// variáveis de ambiente VITE_* (Vercel). Sem ID, nada é carregado.

const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim();
const GTM_ID = (import.meta.env.VITE_GTM_ID as string | undefined)?.trim();
const GA4_ID = (import.meta.env.VITE_GA4_ID as string | undefined)?.trim();
const GADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim();
const GADS_LEAD_LABEL = (import.meta.env.VITE_GADS_LEAD_LABEL as string | undefined)?.trim();
const GADS_WHATSAPP_LABEL = (import.meta.env.VITE_GADS_WHATSAPP_LABEL as string | undefined)?.trim();

const CONSENT_KEY = "pyx_consent";
const ATTR_KEY = "pyx_attribution";
const ATTR_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"] as const;

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
  _fbq?: unknown;
};

const w = window as Win;
let loaded = false;

export function trackingConfigured(): boolean {
  return Boolean(META_PIXEL_ID || GTM_ID || GA4_ID || GADS_ID);
}

export function getConsent(): "granted" | "denied" | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(value: "granted" | "denied"): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* navegação privada: segue sem persistir */
  }
  if (value === "granted") loadScripts();
}

function loadScript(src: string): void {
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  document.head.appendChild(el);
}

function loadScripts(): void {
  if (loaded || getConsent() !== "granted") return;
  loaded = true;

  const googleId = GA4_ID || GADS_ID;
  if (GTM_ID || googleId) {
    w.dataLayer = w.dataLayer || [];
    // O GTM e o gtag exigem o objeto "arguments" (não um array) no dataLayer.
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
    w.gtag("js", new Date());
  }
  if (GTM_ID) {
    (w.dataLayer as unknown[]).push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`);
  }
  if (googleId && w.gtag) {
    if (GA4_ID) w.gtag("config", GA4_ID);
    if (GADS_ID) w.gtag("config", GADS_ID);
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`);
  }

  if (META_PIXEL_ID) {
    if (!w.fbq) {
      const fbq = function (...args: unknown[]) {
        if ((fbq as { callMethod?: (...a: unknown[]) => void }).callMethod) {
          (fbq as { callMethod: (...a: unknown[]) => void }).callMethod(...args);
        } else {
          (fbq.queue as unknown[]).push(args);
        }
      } as NonNullable<Win["fbq"]>;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      w.fbq = fbq;
      w._fbq = fbq;
    }
    w.fbq("init", META_PIXEL_ID);
    w.fbq("track", "PageView");
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
  }
}

/** Chamar uma vez na inicialização do app. */
export function initTracking(): void {
  captureAttribution();
  loadScripts();
}

export function trackPageView(path: string): void {
  if (getConsent() !== "granted") return;
  w.gtag?.("event", "page_view", { page_path: path });
  // O PageView inicial do Meta já é disparado no carregamento; navegações internas:
  if (loaded && document.readyState === "complete") w.fbq?.("track", "PageView");
}

/** Guarda UTMs e IDs de clique (gclid/fbclid) da primeira visita com anúncio. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const key of ATTR_PARAMS) {
      const value = params.get(key);
      if (value) found[key] = value.slice(0, 120);
    }
    if (Object.keys(found).length > 0) {
      localStorage.setItem(ATTR_KEY, JSON.stringify({ ...found, landing: window.location.pathname, at: new Date().toISOString() }));
    }
  } catch {
    /* ignora */
  }
}

export function getAttribution(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Texto curto com a origem do anúncio, para gravar junto do lead. */
export function attributionLabel(): string {
  const attr = getAttribution();
  const parts = ATTR_PARAMS.filter((key) => attr[key]).map((key) => `${key}=${attr[key]}`);
  return parts.join(" ");
}

export function withAttribution(source: string): string {
  const label = attributionLabel();
  return label ? `${source} | ${label}` : source;
}

function gadsConversion(label: string | undefined, value?: number): void {
  if (!GADS_ID || !label) return;
  w.gtag?.("event", "conversion", { send_to: `${GADS_ID}/${label}`, value, currency: "BRL" });
}

/** Lead cadastrado (formulário do simulador ou da página de empresas). */
export function trackLead(origin: string, monthlyBill?: number): void {
  if (getConsent() !== "granted") return;
  w.fbq?.("track", "Lead", { content_name: origin, value: monthlyBill, currency: "BRL" });
  w.gtag?.("event", "generate_lead", { origin, value: monthlyBill, currency: "BRL" });
  gadsConversion(GADS_LEAD_LABEL, monthlyBill);
}

/** Clique para falar no WhatsApp. */
export function trackWhatsAppClick(origin: string): void {
  if (getConsent() !== "granted") return;
  w.fbq?.("track", "Contact", { content_name: origin });
  w.gtag?.("event", "whatsapp_click", { origin });
  gadsConversion(GADS_WHATSAPP_LABEL);
}
