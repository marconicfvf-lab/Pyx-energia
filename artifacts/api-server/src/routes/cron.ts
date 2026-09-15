import { Router, type IRouter } from "express";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { runCampaignPass } from "../services/campaigns";

const router: IRouter = Router();

/**
 * Dispatch pass for hosts without a long-lived process (serverless), where the
 * in-process scheduler never runs. Disabled unless CRON_SECRET is configured.
 * Aceita GET (agendadores como o cron da Vercel) e POST (disparo manual).
 */
router.all("/cron/campaigns", async (req, res): Promise<void> => {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  if (!env.cronSecret) {
    res.status(404).json({ error: "Cron desabilitado" });
    return;
  }

  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.query["token"];
  if (token !== env.cronSecret) {
    res.status(401).json({ error: "Token de cron inválido" });
    return;
  }

  try {
    await runCampaignPass();
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "Falha no disparo agendado");
    res.status(500).json({ error: "Falha no disparo agendado" });
  }
});

export default router;
