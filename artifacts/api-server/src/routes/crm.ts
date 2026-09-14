import { Router, type IRouter, type Request } from "express";
import { and, asc, count, desc, eq, ilike, lte, or, sum } from "drizzle-orm";
import { db, activitiesTable, followUpTasksTable, leadsTable } from "@workspace/db";
import {
  CreateLeadActivityBody,
  CreateLeadActivityParams,
  CreateLeadActivityResponse,
  CreateLeadBody,
  CreateLeadResponse,
  CreateLeadTaskBody,
  CreateLeadTaskParams,
  CreateLeadTaskResponse,
  GetDashboardKpisResponse,
  GetLeadParams,
  GetLeadResponse,
  ListLeadActivitiesParams,
  ListLeadActivitiesResponse,
  ListLeadTasksParams,
  ListLeadTasksResponse,
  ListLeadsQueryParams,
  ListLeadsResponse,
  UpdateFollowUpTaskBody,
  UpdateFollowUpTaskParams,
  UpdateFollowUpTaskResponse,
  UpdateLeadBody,
  UpdateLeadParams,
  UpdateLeadResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
const LGPD_CONSENT =
  "Autorizo a PYX Energia a tratar meus dados para contato comercial e simulação de economia, conforme a LGPD.";

function parseId(req: Request, schema: typeof GetLeadParams): number | null {
  const parsed = schema.safeParse(req.params);
  return parsed.success ? parsed.data.id : null;
}

async function leadExists(id: number): Promise<boolean> {
  const [lead] = await db
    .select({ id: leadsTable.id })
    .from(leadsTable)
    .where(eq(leadsTable.id, id))
    .limit(1);
  return Boolean(lead);
}

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [lead] = await db
    .insert(leadsTable)
    .values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      customerType: parsed.data.customerType,
      cpfCnpj: parsed.data.cpfCnpj,
      state: parsed.data.state,
      city: parsed.data.city,
      distributor: parsed.data.distributor,
      averageBill: parsed.data.averageBill,
      estimatedMonthlySavings: parsed.data.estimatedMonthlySavings,
      estimatedAnnualSavings: parsed.data.estimatedAnnualSavings,
      source: parsed.data.source,
      consentAt: new Date(),
      consentText: parsed.data.consentText,
    })
    .returning();
  res.status(201).json(CreateLeadResponse.parse(lead));
});

router.use(requireAuth);

router.get("/leads", async (req, res): Promise<void> => {
  const query = ListLeadsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const filters = [];
  if (query.data.search) {
    const term = `%${query.data.search}%`;
    filters.push(or(ilike(leadsTable.name, term), ilike(leadsTable.phone, term)));
  }
  if (query.data.stage) filters.push(eq(leadsTable.stage, query.data.stage));
  if (query.data.state) filters.push(eq(leadsTable.state, query.data.state));
  if (query.data.customerType) {
    filters.push(eq(leadsTable.customerType, query.data.customerType));
  }
  const leads = await db
    .select()
    .from(leadsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(leadsTable.createdAt));
  res.json(ListLeadsResponse.parse(leads));
});

router.get("/leads/:id", async (req, res): Promise<void> => {
  const id = parseId(req, GetLeadParams);
  if (!id) {
    res.status(400).json({ error: "ID de lead inválido" });
    return;
  }
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!lead) {
    res.status(404).json({ error: "Lead não encontrado" });
    return;
  }
  const [activities, tasks] = await Promise.all([
    db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.leadId, id))
      .orderBy(desc(activitiesTable.createdAt)),
    db
      .select()
      .from(followUpTasksTable)
      .where(eq(followUpTasksTable.leadId, id))
      .orderBy(asc(followUpTasksTable.dueAt)),
  ]);
  res.json(GetLeadResponse.parse({ ...lead, activities, tasks }));
});

router.patch("/leads/:id", async (req, res): Promise<void> => {
  const id = parseId(req, UpdateLeadParams);
  if (!id) {
    res.status(400).json({ error: "ID de lead inválido" });
    return;
  }
  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Lead não encontrado" });
    return;
  }
  const [lead] = await db
    .update(leadsTable)
    .set(parsed.data)
    .where(eq(leadsTable.id, id))
    .returning();
  if (parsed.data.stage && parsed.data.stage !== existing.stage) {
    await db.insert(activitiesTable).values({
      leadId: id,
      type: "mudanca_etapa",
      content: `Etapa alterada de ${existing.stage} para ${parsed.data.stage}.`,
    });
  }
  res.json(UpdateLeadResponse.parse(lead));
});

router.get("/leads/:id/activities", async (req, res): Promise<void> => {
  const id = parseId(req, ListLeadActivitiesParams);
  if (!id) {
    res.status(400).json({ error: "ID de lead inválido" });
    return;
  }
  if (!(await leadExists(id))) {
    res.status(404).json({ error: "Lead não encontrado" });
    return;
  }
  const activities = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.leadId, id))
    .orderBy(desc(activitiesTable.createdAt));
  res.json(ListLeadActivitiesResponse.parse(activities));
});

router.post("/leads/:id/activities", async (req, res): Promise<void> => {
  const id = parseId(req, CreateLeadActivityParams);
  if (!id) {
    res.status(400).json({ error: "ID de lead inválido" });
    return;
  }
  if (!(await leadExists(id))) {
    res.status(404).json({ error: "Lead não encontrado" });
    return;
  }
  const parsed = CreateLeadActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const request = req as Request & { userId?: string };
  const [activity] = await db
    .insert(activitiesTable)
    .values({ ...parsed.data, leadId: id, authorId: request.userId })
    .returning();
  res.status(201).json(CreateLeadActivityResponse.parse(activity));
});

router.get("/leads/:id/tasks", async (req, res): Promise<void> => {
  const id = parseId(req, ListLeadTasksParams);
  if (!id) {
    res.status(400).json({ error: "ID de lead inválido" });
    return;
  }
  if (!(await leadExists(id))) {
    res.status(404).json({ error: "Lead não encontrado" });
    return;
  }
  const tasks = await db
    .select()
    .from(followUpTasksTable)
    .where(eq(followUpTasksTable.leadId, id))
    .orderBy(asc(followUpTasksTable.dueAt));
  res.json(ListLeadTasksResponse.parse(tasks));
});

router.post("/leads/:id/tasks", async (req, res): Promise<void> => {
  const id = parseId(req, CreateLeadTaskParams);
  if (!id) {
    res.status(400).json({ error: "ID de lead inválido" });
    return;
  }
  if (!(await leadExists(id))) {
    res.status(404).json({ error: "Lead não encontrado" });
    return;
  }
  const parsed = CreateLeadTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db
    .insert(followUpTasksTable)
    .values({ ...parsed.data, leadId: id })
    .returning();
  await db.update(leadsTable).set({ nextFollowUpAt: parsed.data.dueAt }).where(eq(leadsTable.id, id));
  res.status(201).json(CreateLeadTaskResponse.parse(task));
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateFollowUpTaskParams.safeParse(req.params);
  const parsed = UpdateFollowUpTaskBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db
    .update(followUpTasksTable)
    .set({
      ...parsed.data,
      completedAt: parsed.data.completed ? new Date() : parsed.data.completed === false ? null : undefined,
    })
    .where(eq(followUpTasksTable.id, params.data.id))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Tarefa não encontrada" });
    return;
  }
  res.json(UpdateFollowUpTaskResponse.parse(task));
});

router.get("/dashboard/kpis", async (_req, res): Promise<void> => {
  const [total, newest, active, won, lost, savings, due] = await Promise.all([
    db.select({ value: count() }).from(leadsTable),
    db.select({ value: count() }).from(leadsTable).where(eq(leadsTable.stage, "novo")),
    db.select({ value: count() }).from(leadsTable).where(and(
      eq(leadsTable.stage, "qualificacao"),
    )),
    db.select({ value: count() }).from(leadsTable).where(eq(leadsTable.stage, "ganho")),
    db.select({ value: count() }).from(leadsTable).where(eq(leadsTable.stage, "perdido")),
    db.select({ value: sum(leadsTable.estimatedMonthlySavings) }).from(leadsTable),
    db.select({ value: count() }).from(followUpTasksTable).where(
      and(eq(followUpTasksTable.completed, false), lte(followUpTasksTable.dueAt, new Date())),
    ),
  ]);
  const activeLeads = await db
    .select({ value: count() })
    .from(leadsTable)
    .where(and(
      // Won and lost are terminal; all other funnel stages are active.
      or(
        eq(leadsTable.stage, "novo"),
        eq(leadsTable.stage, "qualificacao"),
        eq(leadsTable.stage, "fatura"),
        eq(leadsTable.stage, "proposta"),
        eq(leadsTable.stage, "documentos"),
        eq(leadsTable.stage, "assinatura"),
        eq(leadsTable.stage, "ativacao"),
      ),
    ));
  const result = {
    totalLeads: Number(total[0]?.value ?? 0),
    newLeads: Number(newest[0]?.value ?? 0),
    activeLeads: Number(activeLeads[0]?.value ?? 0),
    wonLeads: Number(won[0]?.value ?? 0),
    lostLeads: Number(lost[0]?.value ?? 0),
    monthlySavings: Number(savings[0]?.value ?? 0),
    dueFollowUps: Number(due[0]?.value ?? 0),
  };
  res.json(GetDashboardKpisResponse.parse(result));
});

export default router;