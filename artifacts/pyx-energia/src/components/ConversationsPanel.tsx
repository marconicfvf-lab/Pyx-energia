import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetConversationQueryKey,
  getListConversationsQueryKey,
  useGetConversation,
  useListConversations,
  useSendConversationMessage,
  useUpdateConversation,
} from "@workspace/api-client-react";
import { Bot, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const dateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );

function Thread({ conversationId }: { conversationId: number }) {
  const client = useQueryClient();
  const { data: conversation } = useGetConversation(conversationId);
  const sendMessage = useSendConversationMessage();
  const updateConversation = useUpdateConversation();
  const [draft, setDraft] = useState("");

  if (!conversation) {
    return <p className="p-6 text-sm text-muted-foreground">Carregando conversa...</p>;
  }

  const refresh = () => {
    client.invalidateQueries({ queryKey: getGetConversationQueryKey(conversationId) });
    client.invalidateQueries({ queryKey: getListConversationsQueryKey() });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/70 p-4">
        <div>
          <p className="font-semibold">{conversation.displayName ?? conversation.contactKey}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.channel === "whatsapp" ? "WhatsApp" : "Chat do site"} ·{" "}
            {conversation.contactKey}
          </p>
        </div>
        <Button
          size="sm"
          variant={conversation.botEnabled ? "outline" : "default"}
          onClick={() =>
            updateConversation.mutate(
              {
                id: conversationId,
                data: {
                  botEnabled: !conversation.botEnabled,
                  status: conversation.botEnabled ? "humano" : "bot",
                },
              },
              { onSuccess: refresh },
            )
          }
        >
          {conversation.botEnabled ? (
            <>
              <UserRound className="mr-1 h-4 w-4" /> Assumir conversa
            </>
          ) : (
            <>
              <Bot className="mr-1 h-4 w-4" /> Devolver ao robô
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f5faf7] p-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
              message.direction === "entrada"
                ? "bg-white shadow-sm"
                : "ml-auto bg-primary text-white"
            }`}
          >
            <p>{message.body}</p>
            <p
              className={`mt-1 text-[10px] ${
                message.direction === "entrada" ? "text-muted-foreground" : "text-white/70"
              }`}
            >
              {message.fromAgent ? "robô · " : ""}
              {dateTime(message.createdAt)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Responder como consultor"
          aria-label="Resposta"
          className="h-11 min-w-0 flex-1 rounded-lg border border-input px-3 text-sm"
        />
        <Button
          size="sm"
          disabled={!draft.trim() || sendMessage.isPending}
          onClick={() =>
            sendMessage.mutate(
              { id: conversationId, data: { body: draft.trim() } },
              {
                onSuccess: () => {
                  setDraft("");
                  refresh();
                },
              },
            )
          }
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ConversationsPanel() {
  const { data: conversations = [], isLoading } = useListConversations();
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-border/70 bg-white shadow-sm">
        <div className="border-b border-border/70 p-4">
          <h2 className="font-display text-lg font-bold">Conversas</h2>
          <p className="text-xs text-muted-foreground">{conversations.length} em andamento</p>
        </div>
        <div className="max-h-[560px] divide-y divide-border/60 overflow-y-auto">
          {isLoading && <p className="p-4 text-sm text-muted-foreground">Carregando...</p>}
          {!isLoading && conversations.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Nenhuma conversa ainda. Elas aparecem assim que alguém falar no site ou no WhatsApp.
            </p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelected(conversation.id)}
              className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                selected === conversation.id ? "bg-muted/50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {conversation.displayName ?? conversation.contactKey}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    conversation.status === "humano"
                      ? "bg-amber-100 text-amber-700"
                      : conversation.status === "encerrada"
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {conversation.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {conversation.channel === "whatsapp" ? "WhatsApp" : "Site"}
                {conversation.lastInboundAt ? ` · ${dateTime(conversation.lastInboundAt)}` : ""}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[560px] rounded-2xl border border-border/70 bg-white shadow-sm">
        {selected === null ? (
          <p className="p-6 text-sm text-muted-foreground">
            Selecione uma conversa para ler o histórico e responder.
          </p>
        ) : (
          <Thread conversationId={selected} />
        )}
      </div>
    </section>
  );
}
