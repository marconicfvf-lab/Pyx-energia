import type { Faq } from "@/lib/public-offer";

/**
 * `<details>` deixa pergunta e resposta no HTML mesmo fechado.
 * O accordion do Radix não renderiza o conteúdo fechado no pré-render.
 */
export function FaqList({ items }: { items: readonly Faq[] }) {
  return (
    <div className="w-full glass rounded-3xl px-5 py-2 md:px-8 md:py-4">
      {items.map((faq) => (
        <details
          key={faq.q}
          className="group border-b border-white/10 last:border-b-0 [&[open]_.faq-chevron]:rotate-180"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-normal marker:content-none hover:text-primary md:text-lg [&::-webkit-details-marker]:hidden">
            {faq.q}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="faq-chevron h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="pb-5 text-base leading-relaxed text-muted-foreground">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
