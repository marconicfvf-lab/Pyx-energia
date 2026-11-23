import { MessageCircle } from "lucide-react";

/** Atalho fixo: rola até o simulador. O texto visível é "Simular economia". */

function scrollToSimulator() {
  document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth" });
}

export function ChatWidget() {
  return (
    <button
      type="button"
      onClick={scrollToSimulator}
      className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_-6px_hsl(var(--primary)/0.7)] transition hover:brightness-110"
      aria-label="Ir para o simulador de economia"
    >
      <MessageCircle className="h-5 w-5" />
      Simular economia
    </button>
  );
}
