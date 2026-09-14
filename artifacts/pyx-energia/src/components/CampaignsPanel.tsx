import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListCampaignContactsQueryKey,
  getListCampaignsQueryKey,
  useCreateCampaign,
  useDispatchCampaign,
  useImportCampaignContacts,
  useListCampaignContacts,
  useListCampaigns,
  useUpdateCampaign,
} from "@workspace/api-client-react";
import { Pause, Play, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_TEMPLATE =
  "Oi {{nome}}, aqui é a Sofia da PYX Energia. Em {{cidade}} já reduzimos a conta de luz de vários clientes sem obra e sem investimento. Quer que eu simule quanto {{negocio}} economizaria?";

function ContactList({ campaignId }: { campaignId: number }) {
  const { data: contacts = [] } = useListCampaignContacts(campaignId);
  const totals = contacts.reduce<Record<string, number>>((acc, contact) => {
    acc[contact.status] = (acc[contact.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(totals).map(([status, total]) => (
          <span key={status} className="rounded-full bg-muted px-2.5 py-1 font-medium">
            {status}: {total}
          </span>
        ))}
        {contacts.length === 0 && (
          <span className="text-muted-foreground">Nenhum contato importado ainda.</span>
        )}
      </div>
    </div>
  );
}

export function CampaignsPanel() {
  const client = useQueryClient();
  const { data: campaigns = [] } = useListCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const importContacts = useImportCampaignContacts();
  const dispatchCampaign = useDispatchCampaign();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [csvByCampaign, setCsvByCampaign] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState("");

  const refresh = (campaignId?: number) => {
    client.invalidateQueries({ queryKey: getListCampaignsQueryKey() });
    if (campaignId) {
      client.invalidateQueries({ queryKey: getListCampaignContactsQueryKey(campaignId) });
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold">Nova campanha de prospecção</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use {"{{nome}}"}, {"{{cidade}}"} e {"{{negocio}}"} para personalizar. O envio respeita
          horário comercial, limite diário, intervalo entre mensagens e a palavra SAIR.
        </p>
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome da campanha"
            aria-label="Nome da campanha"
            className="h-11 w-full rounded-lg border border-input px-3 text-sm"
          />
          <textarea
            value={template}
            onChange={(event) => setTemplate(event.target.value)}
            rows={3}
            aria-label="Mensagem da campanha"
            className="w-full resize-none rounded-lg border border-input p-3 text-sm"
          />
          <Button
            disabled={!name.trim() || template.trim().length < 10 || createCampaign.isPending}
            onClick={() =>
              createCampaign.mutate(
                { data: { name: name.trim(), messageTemplate: template.trim() } },
                {
                  onSuccess: () => {
                    setName("");
                    refresh();
                  },
                },
              )
            }
          >
            Criar campanha
          </Button>
        </div>
      </div>

      {feedback && <p className="text-sm font-medium text-primary">{feedback}</p>}

      {campaigns.map((campaign) => (
        <div key={campaign.id} className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold">{campaign.name}</p>
              <p className="text-xs text-muted-foreground">
                {campaign.status} · até {campaign.dailyLimit} envios/dia · 1 a cada{" "}
                {campaign.minIntervalSeconds}s · {campaign.windowStartHour}h às{" "}
                {campaign.windowEndHour}h
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateCampaign.mutate(
                    {
                      id: campaign.id,
                      data: { status: campaign.status === "ativa" ? "pausada" : "ativa" },
                    },
                    { onSuccess: () => refresh(campaign.id) },
                  )
                }
              >
                {campaign.status === "ativa" ? (
                  <>
                    <Pause className="mr-1 h-4 w-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-4 w-4" /> Ativar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                disabled={dispatchCampaign.isPending}
                onClick={() =>
                  dispatchCampaign.mutate(
                    { id: campaign.id },
                    {
                      onSuccess: (result) => {
                        setFeedback(
                          result.sent > 0
                            ? `Mensagem enviada. Restam ${result.remaining} contatos.`
                            : (result.reason ?? "Nada a enviar agora."),
                        );
                        refresh(campaign.id);
                      },
                    },
                  )
                }
              >
                <Send className="mr-1 h-4 w-4" /> Enviar agora
              </Button>
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">{campaign.messageTemplate}</p>

          <div className="mt-4 space-y-2">
            <textarea
              value={csvByCampaign[campaign.id] ?? ""}
              onChange={(event) =>
                setCsvByCampaign((current) => ({ ...current, [campaign.id]: event.target.value }))
              }
              rows={3}
              placeholder={"nome,telefone,cidade,negocio\nMaria Silva,81999998888,Recife,Padaria"}
              aria-label={`Contatos da campanha ${campaign.name}`}
              className="w-full resize-none rounded-lg border border-input p-3 font-mono text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!csvByCampaign[campaign.id]?.trim() || importContacts.isPending}
              onClick={() =>
                importContacts.mutate(
                  { id: campaign.id, data: { csv: csvByCampaign[campaign.id] ?? "" } },
                  {
                    onSuccess: (result) => {
                      setFeedback(
                        `${result.imported} importados · ${result.duplicates} duplicados · ${result.invalid} inválidos · ${result.optedOut} em opt-out.`,
                      );
                      setCsvByCampaign((current) => ({ ...current, [campaign.id]: "" }));
                      refresh(campaign.id);
                    },
                  },
                )
              }
            >
              <Upload className="mr-1 h-4 w-4" /> Importar contatos
            </Button>
          </div>

          <ContactList campaignId={campaign.id} />
        </div>
      ))}
    </section>
  );
}
