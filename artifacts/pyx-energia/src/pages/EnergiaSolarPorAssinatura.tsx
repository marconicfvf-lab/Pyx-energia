import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumb, Eyebrow, RelatedLinks, StepsSection, TiersSection, WhatsAppCta } from "@/components/OfferSections";
import { COVERAGE, DISCOUNT_RULES, breadcrumbJsonLd, faqByQuestion, faqPageJsonLd, type Faq } from "@/lib/public-offer";
import { pages, usePageMeta } from "@/lib/seo";

const PAGE_FAQS: Faq[] = [
  faqByQuestion("Vou precisar fazer alguma obra ou instalar placas solares?"),
  faqByQuestion("O que é o marketplace da PYX?"),
  faqByQuestion("Em quais estados a PYX atende?"),
  faqByQuestion("Qual o investimento inicial?"),
  {
    q: "Qual desconto eu recebo?",
    a: DISCOUNT_RULES,
  },
  faqByQuestion("O que acontece com a minha conta da distribuidora?"),
  faqByQuestion("Em quanto tempo o desconto começa?"),
  faqByQuestion("Posso cancelar quando quiser?"),
];

const WHATSAPP_MESSAGE =
  "Olá! Quero entender como funciona a energia solar por assinatura da PYX.";

export default function EnergiaSolarPorAssinatura() {
  usePageMeta(pages.assinatura);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pyx-landing flex min-h-screen flex-col bg-background font-sans text-foreground">
      <JsonLd data={faqPageJsonLd(PAGE_FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Energia solar por assinatura", path: "/energia-solar-por-assinatura" },
        ])}
      />
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
          <div className="pointer-events-none absolute inset-0 pyx-grid" />
          <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.18),transparent)]" />
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <Breadcrumb
              items={[
                { href: "/", label: "Início" },
                { label: "Energia solar por assinatura" },
              ]}
            />
            <Eyebrow>Baixa tensão</Eyebrow>
            <h1 className="mb-7 max-w-4xl text-5xl font-display font-light leading-[1.05] tracking-tight md:text-6xl">
              Energia solar por assinatura, sem obras e sem investimento
            </h1>
            <p className="mb-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              A PYX é um marketplace de energia solar por assinatura para contas de baixa tensão.
              Usinas solares parceiras geram a energia e injetam na rede da concessionária. A PYX analisa a sua conta,
              conecta a unidade consumidora a uma usina parceira e cuida da adesão.
            </p>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Não há placas no imóvel, não há obra e não há investimento inicial. O desconto vai de 20% a 40% e incide
              sobre a energia compensada. A proposta final depende da análise da fatura.
            </p>
          </div>
        </section>

        <StepsSection />
        <TiersSection />

        <section className="relative py-20 md:py-28" aria-labelledby="onde-atende">
          <div className="container mx-auto px-4 md:px-6">
            <Eyebrow>Cobertura</Eyebrow>
            <h2 id="onde-atende" className="mb-6 max-w-3xl text-4xl font-display font-light tracking-tight md:text-5xl">
              Onde a assinatura está disponível
            </h2>
            <p className="mb-10 max-w-2xl text-lg text-muted-foreground">
              O foco é o Nordeste: Alagoas, Bahia, Ceará, Pernambuco, Piauí, Rio Grande do Norte e Sergipe. A PYX também
              atende Goiás e Pará, nas áreas das distribuidoras abaixo.
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COVERAGE.map((item) => (
                <li key={item.uf} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <p className="font-medium text-foreground">
                    {item.state} <span className="text-primary">{item.uf}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{item.distributor}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" className="relative scroll-mt-24 py-20 md:py-28">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <div className="mb-12 text-center">
              <Eyebrow>Dúvidas</Eyebrow>
              <h2 className="mb-4 text-4xl font-display font-light tracking-tight md:text-5xl">Perguntas frequentes</h2>
              <p className="text-muted-foreground">
                Respostas sobre a assinatura, o desconto e o que fica de fora da base de cálculo.
              </p>
            </div>
            <FaqList items={PAGE_FAQS} />
          </div>
        </section>

        <WhatsAppCta
          origin="assinatura"
          message={WHATSAPP_MESSAGE}
          title="Quer ver o desconto na sua conta?"
          text="Envie a fatura pelo WhatsApp. A PYX confirma a faixa e a proposta depois de analisar a conta."
        />
        <RelatedLinks
          links={[
            { href: "/", label: "Página inicial" },
            { href: "/empresas", label: "Para empresas" },
            { href: "/recife", label: "Recife" },
            { href: "/fortaleza", label: "Fortaleza" },
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
