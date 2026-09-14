import { useMemo, useState } from "react";
import {
  getGetDashboardKpisQueryKey,
  getGetLeadQueryKey,
  getListLeadsQueryKey,
  useCreateLeadActivity,
  useCreateLeadTask,
  useGetDashboardKpis,
  useGetLead,
  useListLeads,
  useUpdateFollowUpTask,
  useUpdateLead,
  type LeadStage,
} from "@workspace/api-client-react";
import { useClerk, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Filter,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignsPanel } from "@/components/CampaignsPanel";
import { ConversationsPanel } from "@/components/ConversationsPanel";

const stages: Array<{ value: LeadStage; label: string }> = [
  { value: "novo", label: "Novo" },
  { value: "qualificacao", label: "Qualificação" },
  { value: "fatura", label: "Fatura" },
  { value: "proposta", label: "Proposta" },
  { value: "documentos", label: "Documentos" },
  { value: "assinatura", label: "Assinatura" },
  { value: "ativacao", label: "Ativação" },
  { value: "ganho", label: "Ganho" },
  { value: "perdido", label: "Perdido" },
];

const stageLabel = (stage: string) =>
  stages.find((item) => item.value === stage)?.label ?? stage;
const currency = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(value);
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

function KpiCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "green",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone?: "green" | "amber" | "blue";
}) {
  const colors = {
    green: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white p-12 text-center">
      <ClipboardList className="mb-3 h-10 w-10 text-primary/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function LeadDetailPanel({
  leadId,
  onClose,
}: {
  leadId: number;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const { data: lead, isLoading } = useGetLead(leadId);
  const updateLead = useUpdateLead();
  const createActivity = useCreateLeadActivity();
  const createTask = useCreateLeadTask();
  const updateTask = useUpdateFollowUpTask();
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");

  const refresh = () => {
    client.invalidateQueries({ queryKey: getGetLeadQueryKey(leadId) });
    client.invalidateQueries({ queryKey: getListLeadsQueryKey() });
    client.invalidateQueries({ queryKey: getGetDashboardKpisQueryKey() });
  };

  if (isLoading || !lead) {
    return (
      <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l border-border bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="mb-8 rounded-lg p-2 hover:bg-muted" aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm text-muted-foreground">Carregando dados do lead...</p>
      </aside>
    );
  }

  const submitNote = () => {
    if (!note.trim()) return;
    createActivity.mutate(
      { id: lead.id, data: { type: "nota", content: note.trim() } },
      { onSuccess: () => { setNote(""); refresh(); } },
    );
  };
  const submitTask = () => {
    if (!taskTitle.trim() || !taskDueAt) return;
    createTask.mutate(
      {
        id: lead.id,
        data: { title: taskTitle.trim(), dueAt: new Date(taskDueAt).toISOString() },
      },
      { onSuccess: () => { setTaskTitle(""); setTaskDueAt(""); refresh(); } },
    );
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l border-border bg-white shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Detalhes do lead</p>
          <h2 className="font-display text-xl font-bold">{lead.name}</h2>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted" aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-7 p-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted/50 p-3"><span className="text-muted-foreground">Telefone</span><p className="font-semibold">{lead.phone}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><span className="text-muted-foreground">Documento</span><p className="font-semibold">{lead.cpfCnpj ? `${lead.customerType} · ${lead.cpfCnpj}` : "—"}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><span className="text-muted-foreground">Local</span><p className="font-semibold">{[lead.city, lead.state].filter(Boolean).join(", ") || "—"}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><span className="text-muted-foreground">Conta média</span><p className="font-semibold">{currency(lead.averageBill)}</p></div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">Etapa</label>
          <select
            value={lead.stage}
            onChange={(event) => updateLead.mutate(
              { id: lead.id, data: { stage: event.target.value as LeadStage } },
              { onSuccess: refresh },
            )}
            className="h-10 flex-1 rounded-lg border border-input bg-white px-3 text-sm font-medium"
          >
            {stages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
          </select>
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${lead.name}, aqui é da PYX Energia. Podemos conversar sobre sua economia?`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#25D366] px-3 text-sm font-semibold text-white hover:bg-[#1db954]"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Próximo follow-up</h3>
            <CalendarClock className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ex.: Solicitar fatura" className="h-10 min-w-0 flex-1 rounded-lg border border-input px-3 text-sm" />
            <input type="datetime-local" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} className="h-10 rounded-lg border border-input px-2 text-sm" />
            <Button size="sm" onClick={submitTask} disabled={createTask.isPending}><Plus className="mr-1 h-4 w-4" /> Agendar</Button>
          </div>
          <div className="mt-3 space-y-2">
            {lead.tasks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum follow-up agendado.</p>}
            {lead.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm">
                <div><p className={task.completed ? "text-muted-foreground line-through" : "font-medium"}>{task.title}</p><p className="text-xs text-muted-foreground">{dateTime(task.dueAt)}</p></div>
                <button
                  onClick={() => updateTask.mutate({ id: task.id, data: { completed: !task.completed } }, { onSuccess: refresh })}
                  className={`rounded-md p-1.5 ${task.completed ? "bg-primary text-white" : "border border-border text-muted-foreground hover:text-primary"}`}
                  aria-label={task.completed ? "Reabrir tarefa" : "Concluir tarefa"}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-display font-semibold">Adicionar nota</h3>
          <div className="flex gap-2">
            <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder="Registre o próximo passo..." className="min-w-0 flex-1 resize-none rounded-lg border border-input p-3 text-sm" />
            <Button onClick={submitNote} disabled={!note.trim() || createActivity.isPending} size="sm" className="self-end">Salvar</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-4 font-display font-semibold">Linha do tempo</h3>
          {lead.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">As interações deste lead aparecerão aqui.</p>
          ) : (
            <div className="space-y-4 border-l-2 border-primary/20 pl-4">
              {lead.activities.map((activity) => (
                <div key={activity.id} className="relative">
                  <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{activity.type.replace("_", " ")}</p>
                  <p className="mt-1 text-sm text-foreground">{activity.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{dateTime(activity.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<LeadStage | "">("");
  const [state, setState] = useState<"PE" | "CE" | "">("");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [tab, setTab] = useState<"leads" | "conversas" | "campanhas">("leads");
  const { data: kpis, isLoading: loadingKpis } = useGetDashboardKpis();
  const { data: leads = [], isLoading: loadingLeads } = useListLeads({
    search: search || undefined,
    stage: stage || undefined,
    state: state || undefined,
  });
  const filteredLeads = useMemo(() => leads, [leads]);

  return (
    <div className="min-h-screen bg-[#f5faf7] text-foreground">
      <header className="border-b border-primary/10 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="PYX Energia" className="h-9 w-auto" />
            <div className="hidden border-l border-border pl-3 sm:block"><p className="text-xs text-muted-foreground">Operação comercial</p><p className="font-display font-semibold">Painel CRM</p></div>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-muted-foreground md:block">{user?.firstName ?? "Equipe PYX"}</p>
            <button onClick={() => signOut({ redirectUrl: "/" })} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" title="Sair"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 md:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Visão geral</p>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Olá, {user?.firstName ?? "time"} 👋</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe seus leads e próximos contatos em um só lugar.</p>
        </div>

        <nav className="flex gap-2">
          {(["leads", "conversas", "campanhas"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === item
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total de leads" value={loadingKpis ? "—" : kpis?.totalLeads ?? 0} detail="Todos os contatos captados" icon={Users} />
          <KpiCard title="Em andamento" value={loadingKpis ? "—" : kpis?.activeLeads ?? 0} detail="Leads no funil ativo" icon={TrendingUp} tone="blue" />
          <KpiCard title="Economia estimada" value={loadingKpis ? "—" : currency(kpis?.monthlySavings ?? 0)} detail="Potencial mensal dos leads" icon={CircleDollarSign} />
          <KpiCard title="Follow-ups pendentes" value={loadingKpis ? "—" : kpis?.dueFollowUps ?? 0} detail="Contatos que precisam de atenção" icon={CalendarClock} tone="amber" />
        </div>

        {tab === "conversas" && <ConversationsPanel />}
        {tab === "campanhas" && <CampaignsPanel />}

        {tab === "leads" && (
        <section className="rounded-2xl border border-border/70 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between">
            <div><h2 className="font-display text-xl font-bold">Leads recentes</h2><p className="mt-1 text-sm text-muted-foreground">{filteredLeads.length} contato(s) encontrado(s)</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou telefone" className="h-10 w-full rounded-lg border border-input pl-9 pr-3 text-sm sm:w-64" /></div>
              <div className="relative"><Filter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><select value={stage} onChange={(event) => setStage(event.target.value as LeadStage | "")} className="h-10 w-full appearance-none rounded-lg border border-input bg-white pl-9 pr-8 text-sm sm:w-40"><option value="">Todas as etapas</option>{stages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
              <select value={state} onChange={(event) => setState(event.target.value as "PE" | "CE" | "")} className="h-10 rounded-lg border border-input bg-white px-3 text-sm"><option value="">PE + CE</option><option value="PE">Pernambuco</option><option value="CE">Ceará</option></select>
            </div>
          </div>
          {loadingLeads ? <div className="p-12 text-center text-sm text-muted-foreground">Carregando leads...</div> : filteredLeads.length === 0 ? <div className="p-5"><EmptyState text="Nenhum lead corresponde aos filtros atuais." /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-semibold">Lead</th><th className="px-5 py-3 font-semibold">Local</th><th className="px-5 py-3 font-semibold">Conta média</th><th className="px-5 py-3 font-semibold">Etapa</th><th className="px-5 py-3 font-semibold">Próximo contato</th><th className="px-5 py-3" /></tr></thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="cursor-pointer transition-colors hover:bg-muted/30" onClick={() => setSelectedLeadId(lead.id)}>
                      <td className="px-5 py-4"><p className="font-semibold">{lead.name}</p><p className="text-xs text-muted-foreground">{lead.phone}</p></td>
                      <td className="px-5 py-4"><p>{lead.city ?? "—"}</p><p className="text-xs text-muted-foreground">{[lead.state, lead.distributor].filter(Boolean).join(" · ") || "Em qualificação"}</p></td>
                      <td className="px-5 py-4"><p className="font-medium">{currency(lead.averageBill)}</p><p className="text-xs text-primary">{lead.estimatedMonthlySavings ? `economiza ${currency(lead.estimatedMonthlySavings)}/mês` : "economia a calcular"}</p></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${lead.stage === "ganho" ? "bg-primary/10 text-primary" : lead.stage === "perdido" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{stageLabel(lead.stage)}</span></td>
                      <td className="px-5 py-4 text-muted-foreground">{lead.nextFollowUpAt ? dateTime(lead.nextFollowUpAt) : "—"}</td>
                      <td className="px-5 py-4"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}
      </main>
      {selectedLeadId !== null && <><button onClick={() => setSelectedLeadId(null)} className="fixed inset-0 z-30 cursor-default bg-black/20" aria-label="Fechar detalhes" /><LeadDetailPanel leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} /></>}
    </div>
  );
}