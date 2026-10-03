import { useState, type FormEvent } from "react";
import { ArrowRight, Building2, CheckCircle2, MessageCircle, Stethoscope, Store, Zap } from "lucide-react";
import { BrazilState, LeadSegment, useCreateLead } from "@workspace/api-client-react";
import { Footer } from "@/components/Footer";
import { discountPercentFor, estimateMonthlySavings } from "@/lib/pricing";

const WHATSAPP_MESSAGE =
  "Olá! Sou gestor de uma empresa e quero uma proposta para contas de energia acima de R$ 5 mil.";
const CONSENT_TEXT =
  "Autorizo a PYX Energia a tratar meus dados para contato comercial e simulação de economia, conforme a LGPD.";
const BRAZIL_STATES = Object.values(BrazilState);
const SEGMENTS: Array<{ value: LeadSegment; label: string }> = [
  { value: "farmacia", label: "Farmácia" },
  { value: "clinica", label: "Clínica" },
  { value: "mercado", label: "Supermercado/mercadinho" },
  { value: "outro", label: "Outro" },
];
const SEGMENT_CARDS = [
  {
    value: "farmacia" as const,
    title: "Farmácias e drogarias",
    description:
      "Ar-condicionado e refrigeração de medicamentos o dia todo: uma única proposta cobre todas as lojas da rede.",
    button: "Simular para Farmácias",
    icon: Building2,
  },
  {
    value: "clinica" as const,
    title: "Clínicas e laboratórios",
    description:
      "Climatização, equipamentos de imagem e esterilização pesam na conta. Reduza o custo fixo sem mexer na operação.",
    button: "Simular para Clínicas",
    icon: Stethoscope,
  },
  {
    value: "mercado" as const,
    title: "Supermercados e mercadinhos",
    description:
      "Freezers e câmaras frias ligados 24h: energia é um dos maiores custos depois da folha.",
    button: "Simular para Supermercados",
    icon: Store,
  },
];
const SAMPLE_BILLS = [5000, 10000, 20000, 50000];
const BUSINESS_REASONS = [
  "+10 anos no mercado de energia",
  "+30 MWp instalados pelo grupo como EPCista",
  "Várias unidades em uma única proposta",
  "Conta em média tensão? O grupo PYX também faz a migração para o mercado livre de energia.",
];

function getInitialSegment(): LeadSegment | "" {
  const requested = new URLSearchParams(window.location.search).get("seg");
  return SEGMENTS.some((segment) => segment.value === requested)
    ? (requested as LeadSegment)
    : "";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Empresas() {
  const createLead = useCreateLead();
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState<LeadSegment | "">(getInitialSegment);
  const [state, setState] = useState<BrazilState>("PE");
  const [city, setCity] = useState("");
  const [bill, setBill] = useState("");
  const [unitCount, setUnitCount] = useState("1");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectSegmentAndScroll = (value: LeadSegment) => {
    setSegment(value);
    document.getElementById("proposta")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (
      !name.trim() ||
      !jobTitle.trim() ||
      !company.trim() ||
      !phone.trim() ||
      !segment ||
      !city.trim()
    ) {
      setFormError("Preencha nome, cargo, empresa, WhatsApp, segmento e cidade.");
      return;
    }

    const averageBill = Number(bill);
    const parsedUnitCount = unitCount.trim() ? Number(unitCount) : undefined;
    if (!Number.isFinite(averageBill) || averageBill < 500) {
      setFormError("Informe o valor total das contas, a partir de R$ 500 por mês.");
      return;
    }
    if (
      parsedUnitCount !== undefined &&
      (!Number.isInteger(parsedUnitCount) || parsedUnitCount < 1)
    ) {
      setFormError("Informe um número inteiro de unidades, a partir de 1.");
      return;
    }
    if (!consentAccepted) {
      setFormError("É necessário aceitar o uso dos dados para continuar.");
      return;
    }

    const monthlySavings = estimateMonthlySavings(averageBill);
    const searchParams = new URLSearchParams(window.location.search);
    const campaign = searchParams.get("utm_campaign");
    const source = searchParams.get("utm_source");
    const leadSource = campaign || source ? `empresas:${campaign || source}` : "empresas";

    createLead.mutate(
      {
        data: {
          name: name.trim(),
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          phone: phone.trim(),
          customerType: "CNPJ",
          segment,
          ...(parsedUnitCount !== undefined ? { unitCount: parsedUnitCount } : {}),
          state,
          city: city.trim(),
          averageBill,
          estimatedMonthlySavings: monthlySavings,
          estimatedAnnualSavings: monthlySavings * 12,
          source: leadSource,
          consentAccepted: true,
          consentText: CONSENT_TEXT,
        },
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => setFormError("Não foi possível registrar seus dados. Tente novamente."),
      },
    );
  };

  return (
    <div className="pyx-landing flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b border-white/10 bg-black/40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <a href="/" aria-label="PYX Energia — página inicial">
            <img src="/brand/pyx-logo.png" alt="PYX Energia" className="h-12 w-auto" />
          </a>
          <a
            href={`https://wa.me/5581999725151?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/30 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="max-w-4xl">
              <p className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                PYX Empresas
              </p>
              <h1 className="mb-6 font-display text-4xl font-light tracking-tight md:text-6xl">
                Conta de luz acima de {"R$\u00a05\u00a0mil"}? Sua empresa pode economizar até{" "}
                <span className="text-primary text-glow">40%*.</span>
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Para redes de farmácias, clínicas, supermercados e mercadinhos com contas em baixa
                tensão. Sem obra, sem investimento e sem trocar de distribuidora — atendimento
                direto com um especialista.
              </p>
              <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                *Desconto de 40% para contas de baixa tensão (B3) acima de R$ 10 mil, em conta única ou
                somando as contas das unidades.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#proposta"
                  className="glow-button inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-medium text-primary-foreground"
                >
                  Quero uma proposta <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/5581999725151?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-7 font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="segmentos" className="relative py-20 scroll-mt-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                Atendimento empresarial
              </p>
              <h2 className="font-display text-3xl font-light tracking-tight md:text-5xl">
                Energia para operações que não podem parar
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {SEGMENT_CARDS.map((card) => (
                <article key={card.value} className="top-line glass rounded-3xl p-7 md:p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 font-display text-xl">{card.title}</h3>
                  <p className="min-h-20 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => selectSegmentAndScroll(card.value)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    {card.button} <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="top-line glass overflow-hidden rounded-3xl p-5 md:p-9">
              <div className="mb-7 max-w-3xl">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                  Economia estimada
                </p>
                <h2 className="font-display text-3xl font-light tracking-tight md:text-5xl">
                  Quanto sua empresa pode economizar
                </h2>
              </div>
              <div className="space-y-3 md:hidden">
                {SAMPLE_BILLS.map((sampleBill) => {
                  const monthlySavings = estimateMonthlySavings(sampleBill);
                  return (
                    <article
                      key={sampleBill}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <h3 className="font-medium text-foreground">
                        {formatCurrency(sampleBill)}
                      </h3>
                      <dl className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Desconto</dt>
                          <dd className="text-primary">{discountPercentFor(sampleBill)}%</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Economia/mês</dt>
                          <dd>{formatCurrency(monthlySavings)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Economia/ano</dt>
                          <dd>{formatCurrency(monthlySavings * 12)}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
              <div className="hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="px-3 py-4 font-medium">Conta mensal</th>
                      <th className="px-3 py-4 font-medium">Desconto</th>
                      <th className="px-3 py-4 font-medium">Economia/mês</th>
                      <th className="px-3 py-4 font-medium">Economia/ano</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_BILLS.map((sampleBill) => {
                      const monthlySavings = estimateMonthlySavings(sampleBill);
                      return (
                        <tr key={sampleBill} className="border-b border-white/5 last:border-0">
                          <td className="px-3 py-4 font-medium text-foreground">
                            {formatCurrency(sampleBill)}
                          </td>
                          <td className="px-3 py-4 text-primary">
                            {discountPercentFor(sampleBill)}%
                          </td>
                          <td className="px-3 py-4">{formatCurrency(monthlySavings)}</td>
                          <td className="px-3 py-4">{formatCurrency(monthlySavings * 12)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Estimativas para contas de baixa tensão (B3). Acima de R$ 10 mil, o desconto de 40%
                vale para conta única ou para a soma das contas das unidades. A proposta final
                depende da análise das faturas.
              </p>
            </div>
          </div>
        </section>

        <section className="relative py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                Por que a PYX
              </p>
              <h2 className="font-display text-3xl font-light tracking-tight md:text-5xl">
                Um parceiro para a sua operação
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BUSINESS_REASONS.map((reason) => (
                <div key={reason} className="glass flex items-start gap-4 rounded-2xl p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground md:text-base">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="proposta" className="relative py-20 scroll-mt-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 text-center">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
                  Proposta empresarial
                </p>
                <h2 className="font-display text-3xl font-light tracking-tight md:text-5xl">
                  Conte sobre a sua empresa
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Um especialista vai analisar os dados e conversar com você.
                </p>
              </div>
              <div className="top-line glass rounded-3xl p-6 md:p-9">
                {submitted ? (
                  <div className="py-7 text-center">
                    <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-primary" />
                    <p className="text-lg font-medium leading-relaxed text-foreground">
                      Recebemos seus dados! Um especialista da PYX vai falar com você pelo WhatsApp.
                    </p>
                    <a
                      href={`https://wa.me/5581999725151?text=${encodeURIComponent("Olá! Enviei meus dados no site e gostaria de conversar sobre uma proposta empresarial.")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="glow-button mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 font-medium text-primary-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Falar no WhatsApp
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Nome
                        <input
                          required
                          minLength={2}
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          autoComplete="name"
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Cargo
                        <select
                          required
                          value={jobTitle}
                          onChange={(event) => setJobTitle(event.target.value)}
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="" disabled>Selecione</option>
                          {["Proprietário/Sócio", "CEO/Diretor", "Gerente", "Financeiro/Compras", "Outro"].map((title) => (
                            <option key={title} value={title}>{title}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Empresa
                        <input
                          required
                          minLength={2}
                          value={company}
                          onChange={(event) => setCompany(event.target.value)}
                          autoComplete="organization"
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        WhatsApp (DDD + número)
                        <input
                          required
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          minLength={8}
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Segmento
                        <select
                          required
                          value={segment}
                          onChange={(event) =>
                            setSegment(event.target.value as LeadSegment | "")
                          }
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="" disabled>Selecione</option>
                          {SEGMENTS.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        UF
                        <select
                          required
                          value={state}
                          onChange={(event) => setState(event.target.value as BrazilState)}
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        >
                          {BRAZIL_STATES.map((uf) => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Cidade
                        <input
                          required
                          minLength={2}
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          autoComplete="address-level2"
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Valor total das contas de energia por mês (R$)
                        <input
                          required
                          type="number"
                          min={500}
                          step="any"
                          value={bill}
                          onChange={(event) => setBill(event.target.value)}
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                      <label className="space-y-2 text-sm font-medium text-foreground">
                        Número de unidades
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={unitCount}
                          onChange={(event) => setUnitCount(event.target.value)}
                          className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                    </div>
                    <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                      <input
                        required
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(event) => setConsentAccepted(event.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span>{CONSENT_TEXT}</span>
                    </label>
                    {formError && (
                      <p role="alert" className="text-sm font-medium text-destructive">{formError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={createLead.isPending}
                      className="glow-button inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {createLead.isPending ? "Enviando..." : "Quero uma proposta"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <a
        href={`https://wa.me/5581999725151?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a PYX pelo WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <Zap className="h-5 w-5" />
      </a>
    </div>
  );
}
