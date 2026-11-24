import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { DISCOUNT_RULES, STEPS, TIERS } from "@/lib/public-offer";
import { trackWhatsAppClick } from "@/lib/tracking";
import { whatsappUrl } from "@/lib/whatsapp";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.8)]" />
      {children}
    </p>
  );
}

export function Breadcrumb({ items }: { items: readonly { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Trilha" className="mb-8 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <a href={item.href} className="hover:text-primary">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function StepsSection() {
  return (
    <section className="relative py-20 md:py-28" aria-labelledby="passos-assinatura">
      <div className="container mx-auto px-4 md:px-6">
        <Eyebrow>Como funciona</Eyebrow>
        <h2 id="passos-assinatura" className="mb-12 max-w-3xl text-4xl font-display font-light tracking-tight md:text-5xl">
          Três passos, sem obra no imóvel
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((item) => (
            <article key={item.step} className="glass rounded-3xl p-8">
              <p className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 font-display text-sm font-medium text-primary">
                {item.step}
              </p>
              <h3 className="mb-3 text-2xl font-display font-normal">{item.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TiersSection() {
  return (
    <section className="relative py-20 md:py-28" aria-labelledby="faixas-desconto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Eyebrow>Faixas de desconto</Eyebrow>
          <h2 id="faixas-desconto" className="text-4xl font-display font-light tracking-tight md:text-5xl">
            De 20% a 40% sobre a energia compensada
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <article
              key={tier.label}
              className={`relative rounded-3xl p-8 text-center ${tier.highlight ? "glow-ring bg-primary/[0.06]" : "glass"}`}
            >
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">{tier.label}</p>
              <p className="mb-4 text-6xl font-display font-medium text-primary text-glow">{tier.percent}</p>
              <p className="mb-2 font-medium text-foreground">{tier.range}</p>
              <p className="text-sm text-muted-foreground">{tier.note}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
          {DISCOUNT_RULES}
        </p>
      </div>
    </section>
  );
}

export function WhatsAppCta({
  origin,
  message,
  title,
  text,
}: {
  origin: string;
  message: string;
  title: string;
  text: string;
}) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/30 bg-card px-6 py-16 text-center md:px-16">
          <div className="pointer-events-none absolute inset-0 pyx-grid" />
          <div className="relative z-10">
            <h2 className="mx-auto mb-6 max-w-3xl text-4xl font-display font-light tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">{text}</p>
            <a
              href={whatsappUrl(message)}
              onClick={() => trackWhatsAppClick(origin)}
              target="_blank"
              rel="noreferrer"
              className="glow-button inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground sm:w-auto"
            >
              Falar no WhatsApp
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RelatedLinks({ links }: { links: readonly { href: string; label: string }[] }) {
  return (
    <nav aria-label="Páginas relacionadas" className="border-t border-white/10 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">Continue no site</h2>
        <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
