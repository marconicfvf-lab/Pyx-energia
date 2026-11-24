import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumb, Eyebrow, RelatedLinks, StepsSection, TiersSection, WhatsAppCta } from "@/components/OfferSections";
import { breadcrumbJsonLd, faqByQuestion, faqPageJsonLd, type Faq } from "@/lib/public-offer";
import { type SeoPage, usePageMeta } from "@/lib/seo";

type CityLandingProps = {
  page: SeoPage;
  city: string;
  uf: string;
  stateName: string;
  distributor: string;
  intro: string;
  trackingOrigin: string;
  otherCities: readonly { href: string; label: string }[];
};

export function CityLanding({
  page,
  city,
  uf,
  stateName,
  distributor,
  intro,
  trackingOrigin,
  otherCities,
}: CityLandingProps) {
  usePageMeta(page);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs: Faq[] = [
    {
      q: `A PYX atende ${city}?`,
      a: `Sim. ${city} fica em ${stateName} (${uf}), na área da ${distributor}. A PYX atende contas de baixa tensão nesse estado. A energia continua chegando pelos mesmos fios e postes, e a distribuidora segue responsável pelo fornecimento.`,
    },
    {
      q: `Qual é a distribuidora em ${city}?`,
      a: `Em ${city}, a distribuidora é a ${distributor}. A PYX não troca a distribuidora: a usina parceira injeta energia na rede dela e a PYX intermedeia a adesão da sua unidade consumidora.`,
    },
    faqByQuestion("Vou precisar fazer alguma obra ou instalar placas solares?"),
    faqByQuestion("Qual o investimento inicial?"),
    {
      q: `Qual desconto na conta de luz em ${city}?`,
      a: `Depende do valor médio da conta de baixa tensão: 20% de R$ 500 a R$ 3.000, 30% acima de R$ 3.000 até R$ 5.000, 35% acima de R$ 5.000 até R$ 10.000 e 40% acima de R$ 10.000. ${stateName} está entre os estados em que contas acima de R$ 10 mil têm 40% de desconto. O desconto incide sobre a energia compensada. Ficam de fora da base a taxa mínima de disponibilidade, a iluminação pública e os impostos. A proposta final depende da análise da fatura.`,
    },
    faqByQuestion("O que acontece com a minha conta da distribuidora?"),
    faqByQuestion("Em quanto tempo o desconto começa?"),
  ];

  const message = `Olá! Estou em ${city} e quero uma proposta de energia solar por assinatura.`;

  return (
    <div className="pyx-landing flex min-h-screen flex-col bg-background font-sans text-foreground">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: city, path: page.path },
        ])}
      />
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
          <div className="pointer-events-none absolute inset-0 pyx-grid" />
          <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.18),transparent)]" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Breadcrumb items={[{ href: "/", label: "Início" }, { label: city }]} />
            <Eyebrow>
              {city} · {uf}
            </Eyebrow>
            <h1 className="mb-7 max-w-4xl text-5xl font-display font-light leading-[1.05] tracking-tight md:text-6xl">
              Energia solar por assinatura em {city}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{intro}</p>
            <p className="mt-8 max-w-2xl rounded-2xl border border-primary/25 bg-primary/[0.06] px-5 py-4 text-sm leading-relaxed text-foreground md:text-base">
              Distribuidora em {city}: <strong className="font-medium">{distributor}</strong>. A PYX não pede troca de
              distribuidora.
            </p>
          </div>
        </section>

        <StepsSection />
        <TiersSection />

        <section id="faq" className="relative scroll-mt-24 py-20 md:py-28">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <Eyebrow>Dúvidas em {city}</Eyebrow>
              <h2 className="mb-4 text-4xl font-display font-light tracking-tight md:text-5xl">
                Perguntas frequentes
              </h2>
            </div>
            <FaqList items={faqs} />
          </div>
        </section>

        <WhatsAppCta
          origin={trackingOrigin}
          message={message}
          title={`Fale com a PYX em ${city}`}
          text="Mande a conta de luz pelo WhatsApp. A faixa de desconto e a proposta saem da análise da fatura."
        />
        <RelatedLinks
          links={[
            { href: "/", label: "Página inicial" },
            { href: "/empresas", label: "Para empresas" },
            { href: "/energia-solar-por-assinatura", label: "Como funciona" },
            ...otherCities,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
