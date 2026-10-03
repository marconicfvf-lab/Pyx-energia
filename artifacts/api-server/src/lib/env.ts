function str(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

const salesWhatsapp = str("PYX_SALES_WHATSAPP", "5581999725151");

export const env = {
  /** "evolution" | "cloud" | "log" (log only records, never sends). */
  whatsappProvider: str("WHATSAPP_PROVIDER", "log"),
  evolutionBaseUrl: str("EVOLUTION_API_URL"),
  evolutionApiKey: str("EVOLUTION_API_KEY"),
  evolutionInstance: str("EVOLUTION_INSTANCE"),
  cloudPhoneNumberId: str("WHATSAPP_PHONE_NUMBER_ID"),
  cloudAccessToken: str("WHATSAPP_ACCESS_TOKEN"),
  webhookToken: str("WHATSAPP_WEBHOOK_TOKEN"),
  geminiApiKey: str("GEMINI_API_KEY"),
  geminiModel: str("GEMINI_MODEL", "gemini-3.6-flash"),
  salesWhatsapp,
  alertWhatsapp: str("PYX_ALERT_WHATSAPP", salesWhatsapp),
  appUrl: str("APP_URL", "https://pyxenergia.com"),
  /** Shared secret for the scheduled dispatch endpoint; empty disables it. */
  cronSecret: str("CRON_SECRET"),
  /** Directory with the built SPA; empty means the API serves no static files. */
  staticDir: str("STATIC_DIR"),
} as const;
