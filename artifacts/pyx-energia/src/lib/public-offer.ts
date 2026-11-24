import { BrazilState } from "@workspace/api-client-react";

/** Estados em que o site diz que a PYX atende. A ordem segue o mapa da home. */
export const COVERED_STATES = [
  BrazilState.AL,
  BrazilState.BA,
  BrazilState.CE,
  BrazilState.GO,
  BrazilState.PA,
  BrazilState.PE,
  BrazilState.PI,
  BrazilState.RN,
  BrazilState.SE,
] as const;

export type CoveredState = (typeof COVERED_STATES)[number];

export function isCoveredState(value: string): value is CoveredState {
  return (COVERED_STATES as readonly string[]).includes(value);
}

export const COVERAGE_SUMMARY =
  "Alagoas, Bahia, Ceará, Goiás, Pará, Pernambuco, Piauí, Rio Grande do Norte e Sergipe";

export const COVERAGE = [
  { uf: "AL", state: "Alagoas", distributor: "Equatorial Alagoas" },
  { uf: "BA", state: "Bahia", distributor: "Neoenergia Coelba" },
  { uf: "CE", state: "Ceará", distributor: "Enel Ceará" },
  { uf: "GO", state: "Goiás", distributor: "Equatorial Goiás" },
  { uf: "PA", state: "Pará", distributor: "Equatorial Pará" },
  { uf: "PE", state: "Pernambuco", distributor: "Neoenergia Pernambuco" },
  { uf: "PI", state: "Piauí", distributor: "Equatorial Piauí" },
  { uf: "RN", state: "Rio Grande do Norte", distributor: "Neoenergia Cosern" },
  { uf: "SE", state: "Sergipe", distributor: "Energisa Sergipe" },
] as const;

export const STEPS = [
  {
    step: "01",
    title: "Assinatura digital",
    desc: "Analisamos sua conta atual (precisa ser acima de R$ 500) e criamos uma proposta personalizada com o percentual de desconto da sua faixa. A assinatura é feita online, com as nossas usinas parceiras.",
  },
  {
    step: "02",
    title: "Injeção de créditos",
    desc: "Usinas solares parceiras geram energia limpa e injetam na rede da concessionária. A PYX intermedeia a sua adesão a essas usinas, e os créditos são alocados diretamente no CPF ou CNPJ da unidade consumidora.",
  },
  {
    step: "03",
    title: "Economia no caixa",
    desc: "Você passa a receber duas faturas unificadas na mesma plataforma, e o desconto vai de 20% a 40%, conforme o valor da sua conta, e incide sobre a energia compensada.",
  },
];

export const TIERS: {
  label: string;
  percent: string;
  range: string;
  note: string;
  highlight?: boolean;
}[] = [
  { label: "Faixa 1", percent: "20%", range: "Contas de R$ 500 a R$ 3.000", note: "Casas, apartamentos e pequenos comércios." },
  { label: "Faixa 2", percent: "30%", range: "Acima de R$ 3.000 até R$ 5.000", note: "Escritórios, lojas e clínicas." },
  { label: "Faixa 3", percent: "35%", range: "Acima de R$ 5.000 até R$ 10.000", note: "Restaurantes, condomínios e supermercados." },
  { label: "Faixa 4", percent: "40%", range: "Acima de R$ 10.000", note: "Pode somar filiais, negócios ou imóveis do mesmo cliente.", highlight: true },
];

/** Texto já publicado na home e no simulador, reunido para as páginas locais. */
export const DISCOUNT_RULES =
  "O desconto vai de 20% a 40%, conforme a faixa da conta, e incide sobre a energia compensada. O percentual final depende da análise da fatura. Para chegar aos R$ 10 mil, vale somar as contas de filiais, negócios ou imóveis do mesmo cliente. Ficam de fora da base a taxa mínima de disponibilidade, a iluminação pública e os impostos. A bandeira tarifária entra na base. Contas acima de R$ 10 mil têm 40% de desconto em Pernambuco e no Ceará.";

export const FAQS = [
  {
    q: "Vou precisar fazer alguma obra ou instalar placas solares?",
    a: "Não. Absolutamente nenhuma. A energia é gerada em usinas solares parceiras e injetada na rede da sua distribuidora. A PYX intermedeia a sua adesão a essas usinas. Você não precisa de espaço, obras ou instalações.",
  },
  {
    q: "O que é o marketplace da PYX?",
    a: "É a plataforma da PYX que reúne usinas solares parceiras em um só lugar. A PYX analisa a sua conta, conecta a sua unidade consumidora a uma usina parceira e cuida da adesão. A energia é gerada pelas usinas parceiras, não pela PYX.",
  },
  {
    q: "Em quais estados a PYX atende?",
    a: "Nosso foco é o Nordeste: Alagoas, Bahia, Ceará, Pernambuco, Piauí, Rio Grande do Norte e Sergipe. Também atendemos Goiás e Pará, nas áreas das distribuidoras Equatorial, Neoenergia, Enel e Energisa desses estados.",
  },
  {
    q: "Preciso avisar a distribuidora?",
    a: "Não. A PYX e a usina parceira cuidam da adesão junto à distribuidora. A energia continua chegando pelos mesmos fios e postes, e a distribuidora segue responsável pelo fornecimento.",
  },
  {
    q: "Como funciona o Indique e Ganhe?",
    a: "Você indica uma casa, empresa ou novo representante pelo WhatsApp da PYX. A PYX cuida da análise e do atendimento e, quando o contrato é fechado, você recebe uma comissão.",
  },
  {
    q: "Como me tornar um representante PYX?",
    a: "Chame a PYX no WhatsApp pelo botão \"Quero ser representante\". Você trabalha por conta própria, com seus horários e sua carteira de clientes, e ganha comissão sobre cada contrato fechado.",
  },
  {
    q: "Qual o investimento inicial?",
    a: "Zero. Você não paga taxa de adesão, não compra equipamentos e não tem mensalidade de serviço. Você apenas assina e passa a pagar a energia com desconto.",
  },
  {
    q: "O que acontece com a minha conta da distribuidora?",
    a: "Você continuará conectado à sua distribuidora. A diferença é que a fatura da distribuidora virá zerada do consumo de energia (cobrando apenas taxas obrigatórias como iluminação pública), e a PYX faturará a energia consumida com o desconto aplicado. No total, a soma será menor que sua conta original.",
  },
  {
    q: "Em quanto tempo o desconto começa?",
    a: "O início depende dos prazos da distribuidora para cadastrar os créditos na sua unidade consumidora. A PYX acompanha todo o processo e avisa você assim que o desconto entrar na fatura.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. A assinatura possui condições flexíveis e pode ser cancelada mediante aviso prévio, sem as multas pesadas de financiamentos solares tradicionais.",
  },
  {
    q: "Qual desconto eu recebo?",
    a: "Depende do valor médio da sua conta de baixa tensão: 20% de R$ 500 a R$ 3.000, 30% acima de R$ 3.000 até R$ 5.000, 35% acima de R$ 5.000 até R$ 10.000 e 40% acima de R$ 10.000. Para chegar aos R$ 10 mil, vale somar as contas de filiais, negócios ou imóveis do mesmo cliente. O desconto incide sobre a energia compensada (a taxa mínima de disponibilidade e a iluminação pública não entram). O percentual final é confirmado após a análise da fatura.",
  },
  {
    q: "Minha conta é menor que R$ 500. Posso participar?",
    a: "Nossa equipe analisa cada unidade consumidora para confirmar a elegibilidade e o benefício. Envie sua conta para comercial@pyxenergia.com ou pelo WhatsApp para receber uma avaliação sem compromisso.",
  },
];

export type Faq = { q: string; a: string };

export function faqByQuestion(question: string): Faq {
  const found = FAQS.find((item) => item.q === question);
  if (!found) throw new Error(`FAQ ausente: ${question}`);
  return found;
}

export function faqPageJsonLd(items: readonly Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? "https://pyxenergia.com/" : `https://pyxenergia.com${item.path}`,
    })),
  };
}
