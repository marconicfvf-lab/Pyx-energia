import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { campaignsTable, contactsTable, db } from "@workspace/db";
import {
  CreateCampaignBody,
  CreateCampaignResponse,
  DispatchCampaignParams,
  DispatchCampaignResponse,
  ImportCampaignContactsBody,
  ImportCampaignContactsParams,
  ImportCampaignContactsResponse,
  ListCampaignContactsParams,
  ListCampaignContactsResponse,
  ListCampaignsResponse,
  UpdateCampaignBody,
  UpdateCampaignParams,
  UpdateCampaignResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { dispatchNext, importContacts, parseCsv, type ContactRow } from "../services/campaigns";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/campaigns", async (_req, res): Promise<void> => {
  const campaigns = await db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt));
  res.json(ListCampaignsResponse.parse(campaigns));
});

router.post("/campaigns", async (req, res): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [campaign] = await db.insert(campaignsTable).values(parsed.data).returning();
  res.status(201).json(CreateCampaignResponse.parse(campaign));
});

router.patch("/campaigns/:id", async (req, res): Promise<void> => {
  const params = UpdateCampaignParams.safeParse(req.params);
  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Requisição inválida" });
    return;
  }
  const [campaign] = await db
    .update(campaignsTable)
    .set(parsed.data)
    .where(eq(campaignsTable.id, params.data.id))
    .returning();
  if (!campaign) {
    res.status(404).json({ error: "Campanha não encontrada" });
    return;
  }
  res.json(UpdateCampaignResponse.parse(campaign));
});

router.get("/campaigns/:id/contacts", async (req, res): Promise<void> => {
  const params = ListCampaignContactsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "ID de campanha inválido" });
    return;
  }
  const contacts = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.campaignId, params.data.id))
    .orderBy(desc(contactsTable.createdAt));
  res.json(ListCampaignContactsResponse.parse(contacts));
});

router.post("/campaigns/:id/contacts", async (req, res): Promise<void> => {
  const params = ImportCampaignContactsParams.safeParse(req.params);
  const parsed = ImportCampaignContactsBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Requisição inválida" });
    return;
  }
  const [campaign] = await db
    .select({ id: campaignsTable.id })
    .from(campaignsTable)
    .where(eq(campaignsTable.id, params.data.id));
  if (!campaign) {
    res.status(404).json({ error: "Campanha não encontrada" });
    return;
  }
  const rows: ContactRow[] = [];
  const errors: string[] = [];
  if (parsed.data.csv) {
    const parsedCsv = parseCsv(parsed.data.csv);
    rows.push(...parsedCsv.rows);
    errors.push(...parsedCsv.errors);
  }
  for (const row of parsed.data.contacts ?? []) {
    rows.push({
      name: row.name,
      phone: row.phone,
      ...(row.city ? { city: row.city } : {}),
      ...(row.business ? { business: row.business } : {}),
    });
  }
  if (rows.length === 0) {
    res.status(400).json({ error: "Nenhum contato válido encontrado" });
    return;
  }
  const result = await importContacts(campaign.id, rows);
  res.status(201).json(
    ImportCampaignContactsResponse.parse({
      ...result,
      errors: [...errors, ...result.errors].slice(0, 50),
    }),
  );
});

router.post("/campaigns/:id/dispatch", async (req, res): Promise<void> => {
  const params = DispatchCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "ID de campanha inválido" });
    return;
  }
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, params.data.id));
  if (!campaign) {
    res.status(404).json({ error: "Campanha não encontrada" });
    return;
  }
  const outcome = await dispatchNext(campaign);
  res.json(DispatchCampaignResponse.parse(outcome));
});

export default router;
