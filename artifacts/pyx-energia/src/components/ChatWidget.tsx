import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useSendChatMessage } from "@workspace/api-client-react";

interface ChatLine {
  from: "lead" | "sofia";
  text: string;
}

const STORAGE_KEY = "pyx-chat-session";
const GREETING =
  "Oi! Sou a Sofia, consultora virtual da PYX Energia. Posso calcular quanto você economiza na conta de luz — sem obra e sem investimento. Como posso te chamar?";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([{ from: "sofia", text: GREETING }]);
  const [sessionId, setSessionId] = useState<string | undefined>(
    () => window.localStorage.getItem(STORAGE_KEY) ?? undefined,
  );
  const sendMessage = useSendChatMessage();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, open]);

  const submit = () => {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;
    setLines((current) => [...current, { from: "lead", text }]);
    setInput("");
    sendMessage.mutate(
      { data: { message: text, ...(sessionId ? { sessionId } : {}) } },
      {
        onSuccess: (response) => {
          if (!sessionId) {
            window.localStorage.setItem(STORAGE_KEY, response.sessionId);
            setSessionId(response.sessionId);
          }
          setLines((current) => [...current, { from: "sofia", text: response.reply }]);
        },
        onError: () =>
          setLines((current) => [
            ...current,
            {
              from: "sofia",
              text: "Tive um problema para responder agora. Chame a gente no WhatsApp (81) 99972-5151 que continuamos por lá.",
            },
          ]),
      },
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-xl transition hover:brightness-110"
        aria-label="Abrir chat com a PYX Energia"
      >
        <MessageCircle className="h-5 w-5" />
        Simular economia
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">Sofia · PYX Energia</p>
          <p className="text-xs text-white/80">Resposta na hora, todos os dias</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Fechar chat" className="rounded-lg p-1.5 hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f5faf7] p-4">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
              line.from === "lead"
                ? "ml-auto bg-primary text-white"
                : "bg-white text-foreground shadow-sm"
            }`}
          >
            {line.text}
          </div>
        ))}
        {sendMessage.isPending && (
          <div className="max-w-[85%] rounded-2xl bg-white px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm">
            Sofia está digitando...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="Digite sua mensagem"
          aria-label="Mensagem"
          className="h-11 min-w-0 flex-1 rounded-lg border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={submit}
          disabled={sendMessage.isPending}
          aria-label="Enviar mensagem"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
