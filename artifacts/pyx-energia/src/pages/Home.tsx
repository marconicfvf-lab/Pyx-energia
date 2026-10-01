import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calculator } from "@/components/Calculator";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, ArrowLeftRight, Zap, ShieldCheck, Stethoscope, Store, Utensils, Wheat, TrendingDown, House, Landmark, Smartphone, Leaf, HardHat, BadgePercent, FileCheck, Handshake } from "lucide-react";
import type { ReactNode } from "react";

const WHATSAPP_URL = "https://wa.me/5581999725151";

function openWhatsApp(text: string) {
  window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(text)}`, "_blank");
}

function scrollToSimulator() {
  document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth" });
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.8)]" />
      {children}
    </p>
  );
}

const MARQUEE_ITEMS = [
  "Energia renovável",
  "Sem obras",
  "Sem investimento inicial",
  "Contas de baixa tensão",
  "Desconto de até 40%",
  "100% digital",
  "Regulamentado pela ANEEL",
  "Lei 14.300",
  "Casas e empresas",
  "Atendimento no Nordeste",
];

const STATS = [
  { value: "40", prefix: "até", suffix: "%", label: "de desconto na conta de luz" },
  { value: "0", prefix: "R$", suffix: "", label: "de investimento inicial" },
  { value: "0", prefix: "", suffix: "obras", label: "no seu imóvel ou empresa" },
  { value: "100", prefix: "", suffix: "%", label: "energia solar renovável" },
  { value: "60", prefix: "até", suffix: "dias", label: "para ativar o desconto" },
];

const STEPS = [
  {
    step: "01",
    title: "Assinatura digital",
    desc: "Analisamos sua conta atual (precisa ser acima de R$ 500) e criamos uma proposta personalizada com o percentual de desconto da sua faixa. Tudo assinado online.",
  },
  {
    step: "02",
    title: "Injeção de créditos",
    desc: "Nossas usinas geram energia limpa e injetam na rede da concessionária. Os créditos são alocados diretamente no CPF ou CNPJ da unidade consumidora.",
  },
  {
    step: "03",
    title: "Economia no caixa",
    desc: "Você passa a receber duas faturas unificadas na mesma plataforma, e o valor total pago será até 40% menor que sua conta original.",
  },
];

const TIERS = [
  { label: "Faixa 1", percent: "20%", range: "Contas de R$ 500 a R$ 3.000", note: "Casas, apartamentos e pequenos comércios." },
  { label: "Faixa 2", percent: "32%", range: "Acima de R$ 3.000 até R$ 10.000", note: "Clínicas, restaurantes e condomínios." },
  { label: "Faixa 3", percent: "40%", range: "Acima de R$ 10.000", note: "Redes, indústrias leves e agronegócio.", highlight: true },
];

const BENEFITS = [
  { icon: Leaf, title: "Energia 100% renovável", desc: "Gerada em usinas solares conectadas à rede da distribuidora." },
  { icon: Smartphone, title: "Tudo pelo celular", desc: "Sem visita técnica, sem papelada e sem deslocamento." },
  { icon: HardHat, title: "Sem obras ou instalação", desc: "Nada muda no seu imóvel: nenhuma placa, nenhum equipamento." },
  { icon: BadgePercent, title: "Desconto fixo mensal", desc: "Você sabe quanto vai economizar antes de assinar." },
];

const AUDIENCES = [
  { icon: House, label: "Casas & Apartamentos" },
  { icon: Landmark, label: "Condomínios" },
  { icon: Store, label: "Comércio Varejista" },
  { icon: Stethoscope, label: "Clínicas & Consultórios" },
  { icon: Utensils, label: "Bares & Restaurantes" },
  { icon: Wheat, label: "Agronegócio & Fazendas" },
];

const FAQS = [
  {
    q: "Vou precisar fazer alguma obra ou instalar placas solares?",
    a: "Não. Absolutamente nenhuma. A energia é gerada em nossas usinas solares remotas e injetada na rede da distribuidora (Neoenergia). Você não precisa de espaço, obras ou instalações.",
  },
  {
    q: "Qual o investimento inicial?",
    a: "Zero. Você não paga taxa de adesão, não compra equipamentos e não tem mensalidade de serviço. Você apenas assina e passa a pagar a energia com desconto.",
  },
  {
    q: "O que acontece com a minha conta da Neoenergia?",
    a: "Você continuará conectado à Neoenergia. A diferença é que a fatura da Neoenergia virá zerada do consumo de energia (cobrando apenas taxas obrigatórias como iluminação pública), e a PYX faturará a energia consumida com o desconto aplicado. No total, a soma será menor que sua conta original.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura possui condições flexíveis e pode ser cancelada mediante aviso prévio, sem as multas pesadas de financiamentos solares tradicionais.",
  },
  {
    q: "Qual desconto eu recebo?",
    a: "Depende do valor médio da sua conta de baixa tensão: 20% de R$ 500 a R$ 3.000, 32% acima de R$ 3.000 até R$ 10.000 e 40% acima de R$ 10.000. O percentual final é confirmado após a análise da fatura.",
  },
  {
    q: "Minha conta é menor que R$ 500. Posso participar?",
    a: "Nossa equipe analisa cada unidade consumidora para confirmar a elegibilidade e o benefício. Envie sua conta para receber uma avaliação sem compromisso.",
  },
];

const GROUP_SERVICES = [
  {
    icon: HardHat,
    title: "EPC de usinas solares",
    description: "Engenharia, fornecimento e construção de usinas fotovoltaicas, do telhado à usina de solo.",
  },
  {
    icon: Handshake,
    title: "M&A de usinas solares",
    description: "Compra e venda de usinas prontas, com análise técnica, documental e financeira de cada ativo.",
  },
  {
    icon: FileCheck,
    title: "Projetos e pareceres de acesso",
    description: "Projetos elétricos e solicitação de parecer de acesso junto à distribuidora, com toda a documentação técnica.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transição para o mercado livre",
    description: "Análise de viabilidade, adequação e acompanhamento completo na migração para o Mercado Livre de Energia.",
  },
];

const GROUP_STATS = [
  { prefix: "+", value: "10", suffix: "anos", label: "no mercado de energia" },
  { prefix: "+", value: "30", suffix: "MWp", label: "instalados como EPCista" },
  { prefix: "", value: "M&A", suffix: "", label: "compra e venda de usinas prontas" },
];

const GROUP_WORKS = [
  { src: "/obras/obra-1.webp", width: 960, height: 720, name: "Caxangá Golf & Country Club", details: "370 kWp · Telhado · Recife, PE" },
  { src: "/obras/obra-2.webp", width: 1200, height: 675, name: "UFV MIP 5", details: "5 MWp · Tracker" },
  { src: "/obras/obra-3.webp", width: 1200, height: 675, name: "UFV Trinity Energia Petrolândia", details: "3,2 MWp · Tracker · Petrolândia, PE" },
  { src: "/obras/obra-4.webp", width: 1200, height: 675, name: "UFV Conecta 1", details: "3,9 MWp · Tracker" },
  { src: "/obras/obra-5.webp", width: 1200, height: 675, name: "UFV Conecta 2", details: "1,3 MWp · Tracker" },
  { src: "/obras/obra-6.webp", width: 1179, height: 656, name: "UFV Angelim", details: "1,3 MWp · Estrutura fixa" },
];

export default function Home() {
  return (
    <div className="pyx-landing min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28"
        >
          <div className="pointer-events-none absolute inset-0 pyx-grid" />
          <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.20),transparent)]" />
          <div className="pointer-events-none absolute top-20 right-[-10%] h-[520px] w-[520px] bg-[radial-gradient(closest-side,hsl(var(--accent)/0.15),transparent)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-70"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Energia solar por assinatura
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-light leading-[1.05] mb-7 tracking-tight">
                  Reduza até <span className="font-semibold text-primary text-glow">40%</span>
                  <br className="hidden sm:block" /> na sua conta de luz.
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
                  Assine energia renovável sem burocracia. Sem investimento inicial, sem obras e sem instalar placas solares.
                  Economia todos os meses para contas de baixa tensão, na sua casa ou no seu negócio.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="h-14 rounded-full px-8 text-base gap-2 w-full sm:w-auto glow-button"
                    onClick={scrollToSimulator}
                  >
                    Simular Economia
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-full px-8 text-base gap-2 border-white/15 !bg-white/[0.03] !text-foreground hover:!bg-white/10 w-full sm:w-auto"
                    onClick={() => openWhatsApp("Olá! Gostaria de falar com um especialista sobre como reduzir minha conta de luz.")}
                  >
                    Falar com especialista
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span>Regulamentado pela Aneel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    <span>Ativação em até 60 dias</span>
                  </div>
                </div>
              </div>

              <div id="simulador" className="scroll-mt-28 lg:pl-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
                <Calculator />
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section aria-label="Diferenciais da PYX" className="relative border-y border-white/10 bg-white/[0.02] py-5 overflow-hidden">
          <div className="flex w-max animate-marquee">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-6 px-6 text-sm md:text-base font-display font-light uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
                {item}
                <Zap className="h-4 w-4 text-primary" />
              </span>
            ))}
          </div>
        </section>

        {/* NÚMEROS */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,hsl(var(--primary)/0.10),transparent)]" />
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Eyebrow>A conta fecha</Eyebrow>
              <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight">
                Economia que aparece <span className="text-gradient-pyx font-normal">na fatura</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {STATS.map((stat, i) => (
                <div key={i} className={`top-line glass rounded-3xl p-6 md:p-8 ${i === STATS.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}>
                  <p className="flex items-baseline gap-1.5 font-display text-primary">
                    {stat.prefix && <span className="text-base md:text-lg font-light">{stat.prefix}</span>}
                    <span className="text-5xl md:text-6xl font-medium text-glow">{stat.value}</span>
                    {stat.suffix && <span className="text-lg md:text-xl font-light">{stat.suffix}</span>}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="relative py-24 md:py-32 scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 mb-16 items-end">
              <div>
                <Eyebrow>Como funciona</Eyebrow>
                <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight">
                  Como a <span className="text-primary text-glow font-normal">mágica</span> acontece
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl">
                Nós geramos energia em nossas fazendas solares e injetamos na rede da concessionária local. Os créditos gerados são transferidos para a sua conta. Simples assim.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-[3.25rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              {STEPS.map((item) => (
                <div key={item.step} className="group relative glass rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <div className="relative mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-background font-display text-sm font-medium text-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-display font-normal mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAIXAS DE DESCONTO */}
        <section id="descontos" className="relative py-24 md:py-32 scroll-mt-20 overflow-hidden">
          <div className="pointer-events-none absolute right-[-15%] top-10 h-[500px] w-[500px] bg-[radial-gradient(closest-side,hsl(var(--accent)/0.10),transparent)]" />
          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Eyebrow>Faixas de desconto</Eyebrow>
              <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight mb-6">
                Desconto fixo, <span className="text-gradient-pyx font-normal">do tamanho da sua conta</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Quanto maior a fatura, maior o desconto. Válido para unidades consumidoras de baixa tensão.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className={`relative rounded-3xl p-8 md:p-10 text-center transition-all duration-300 hover:-translate-y-1 ${
                    tier.highlight ? "glow-ring bg-primary/[0.06] md:-my-4 md:py-14" : "glass hover:border-primary/30"
                  }`}
                >
                  {tier.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                      Maior desconto
                    </span>
                  )}
                  <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">{tier.label}</p>
                  <p className="text-6xl md:text-7xl font-display font-medium text-primary text-glow mb-4">{tier.percent}</p>
                  <p className="font-medium text-foreground mb-2">{tier.range}</p>
                  <p className="text-sm text-muted-foreground">{tier.note}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-12">
              Percentuais aplicados sobre a energia consumida, conforme análise da fatura.
            </p>
          </div>
        </section>

        {/* POR QUE A PYX */}
        <section id="vantagens" className="relative py-24 md:py-32 scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mb-16">
              <Eyebrow>Por que a PYX</Eyebrow>
              <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight mb-6">
                Energia mais barata <span className="text-primary text-glow font-normal">sem mudar nada</span> na sua rotina
              </h2>
              <p className="text-lg text-muted-foreground">
                A energia chega pelos mesmos fios, da mesma distribuidora. Muda só de onde ela vem e quanto você paga.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map((item, i) => (
                <div key={i} className="group glass rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_48px_-16px_hsl(var(--primary)/0.6)]">
                  <div className="w-12 h-12 rounded-2xl border border-primary/30 bg-primary/10 text-primary flex items-center justify-center mb-8 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-normal text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARA QUEM É */}
        <section id="para-quem" className="relative py-24 md:py-32 scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Eyebrow>Para quem é</Eyebrow>
                <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight mb-6">
                  Energia mais barata para <span className="text-gradient-pyx font-normal">diferentes perfis</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10">
                  Se a sua fatura de energia é <strong className="text-foreground font-medium">acima de R$ 500 mensais</strong>, a PYX analisa sua unidade e mostra quanto você pode economizar, em casa ou no seu negócio.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AUDIENCES.map((audience, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.05]">
                      <audience.icon className="w-5 h-5 text-primary shrink-0" />
                      <span className="font-medium text-sm md:text-base">{audience.label}</span>
                    </div>
                  ))}
                </div>

                <Button className="mt-10 h-12 rounded-full px-8 gap-2 glow-button" onClick={scrollToSimulator}>
                  Verificar elegibilidade
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <div className="relative aspect-square md:aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-card">
                  <div className="pointer-events-none absolute inset-0 pyx-grid" />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,hsl(var(--accent)/0.25),transparent)]" />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20" />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
                  <div className="relative flex h-full flex-col items-center justify-center p-8 pb-20 md:pb-8 text-center">
                    <img src="/brand/pyx-logo.png" alt="" aria-hidden="true" className="mb-6 h-40 md:h-48 w-auto drop-shadow-[0_0_40px_rgba(232,193,87,0.35)]" />
                    <h3 className="text-2xl md:text-3xl font-display font-light mb-2">Energia Inteligente</h3>
                    <p className="text-muted-foreground">Economia para sua casa ou empresa, com energia renovável.</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-4 md:-left-10 z-20 max-w-xs rounded-2xl glass glow-ring p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Impacto direto</p>
                      <p className="font-display font-normal text-xl">Mais lucro limpo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GRUPO PYX */}
        <section id="grupo" className="relative py-24 md:py-32 scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mb-14">
              <Eyebrow>Grupo PYX</Eyebrow>
              <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight mb-6">
                Do projeto à usina, <span className="text-primary font-normal">um grupo completo</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Com mais de 10 anos no mercado de energia e mais de 30 MWp instalados como EPCista, o grupo PYX projeta e constrói usinas fotovoltaicas, atua forte no M&A de compra e venda de usinas prontas e em pareceres de acesso, e acompanha sua empresa na migração para o mercado livre de energia.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GROUP_STATS.map((stat, i) => (
                <div key={i} className="top-line glass rounded-3xl p-6 md:p-8">
                  <p className="flex items-baseline gap-1.5 font-display text-primary">
                    {stat.prefix && <span className="text-base md:text-lg font-light">{stat.prefix}</span>}
                    <span className="text-5xl md:text-6xl font-medium text-glow">{stat.value}</span>
                    {stat.suffix && <span className="text-lg md:text-xl font-light">{stat.suffix}</span>}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {GROUP_SERVICES.map((service) => (
                <div key={service.title} className="glass rounded-3xl p-7 md:p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-display font-normal">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-20">
              <h3 className="mb-8 text-3xl md:text-4xl font-display font-light tracking-tight">
                Obras executadas pelo grupo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {GROUP_WORKS.map((work) => (
                  <figure key={work.src} className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-card">
                    <img
                      src={work.src}
                      alt={`${work.name} — ${work.details}`}
                      width={work.width}
                      height={work.height}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-5 pb-5 pt-12">
                      <p className="font-display text-base font-medium text-white">{work.name}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">{work.details}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative py-24 md:py-32 scroll-mt-20">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <Eyebrow>Dúvidas</Eyebrow>
              <h2 className="text-4xl md:text-5xl font-display font-light tracking-tight mb-4">
                Dúvidas Frequentes
              </h2>
              <p className="text-muted-foreground">Tudo o que você precisa saber sobre a assinatura de energia PYX.</p>
            </div>

            <Accordion type="single" collapsible className="w-full glass rounded-3xl px-5 py-2 md:px-8 md:py-4">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/10 last:border-b-0">
                  <AccordionTrigger className="text-left text-base md:text-lg font-normal">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="relative py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/30 bg-card px-6 py-20 md:px-16 text-center">
              <div className="pointer-events-none absolute inset-0 pyx-grid" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[780px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,hsl(var(--primary)/0.30),transparent)]" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-display font-light tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                  Pronto para transformar sua despesa em <span className="text-primary text-glow font-normal">investimento</span>?
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Fale com um de nossos consultores e descubra quanto sua casa ou empresa pode economizar nos próximos anos.
                </p>
                <Button
                  size="lg"
                  className="h-14 rounded-full px-8 text-base md:text-lg gap-2 w-full sm:w-auto glow-button"
                  onClick={() => openWhatsApp("Olá! Quero saber quanto posso economizar na minha conta de luz com a PYX.")}
                >
                  Quero falar com um especialista
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
