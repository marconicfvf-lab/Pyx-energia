import { useEffect } from "react";

export const SITE_ORIGIN = "https://pyxenergia.com";

export type SeoPage = {
  path: string;
  file: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  /** Trechos que o HTML pré-renderizado precisa conter (h1 e texto principal). */
  markers: readonly string[];
  robots?: string;
};

export function canonicalUrl(path: string): string {
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

export const pages = {
  home: {
    path: "/",
    file: "index.html",
    title: "PYX Energia | Reduza de 25% a 40% na sua conta de luz",
    description:
      "Economize de 25% a 40% na conta de luz da sua casa ou empresa com a PYX Energia, o marketplace de energia solar por assinatura, com foco no Nordeste. Sem obras, sem investimento inicial e sem taxa de adesão.",
    ogTitle: "PYX Energia | Reduza de 25% a 40% na conta de luz",
    ogDescription:
      "Marketplace de energia solar por assinatura para casas e empresas. Sem placas solares, sem obras e sem burocracia.",
    markers: ["Reduza de", "25% a 40%", "na sua conta de luz"],
  },
  empresas: {
    path: "/empresas",
    file: "empresas/index.html",
    title: "PYX Empresas | Economia na conta de luz para empresas",
    description:
      "Para redes de farmácias, clínicas, supermercados e mercadinhos com contas em baixa tensão. Sem obra, sem investimento e sem trocar de distribuidora.",
    ogTitle: "PYX Empresas | Economia na conta de luz para empresas",
    ogDescription:
      "Para redes de farmácias, clínicas, supermercados e mercadinhos com contas em baixa tensão. Sem obra, sem investimento e sem trocar de distribuidora.",
    markers: ["Conta de luz acima de", "Sua empresa pode economizar"],
  },
  privacidade: {
    path: "/privacidade",
    file: "privacidade/index.html",
    title: "Política de Privacidade | PYX Energia",
    description:
      "Como a PYX Energia trata os dados pessoais de quem visita o site, usa o simulador de economia ou pede uma proposta, em conformidade com a LGPD.",
    ogTitle: "Política de Privacidade | PYX Energia",
    ogDescription:
      "Como a PYX Energia trata os dados pessoais de quem visita o site, usa o simulador de economia ou pede uma proposta, em conformidade com a LGPD.",
    markers: ["Política de Privacidade", "Lei Geral de Proteção de Dados"],
  },
  notFound: {
    path: "/404",
    file: "404.html",
    title: "Página não encontrada | PYX Energia",
    description: "A página que você procura não existe ou foi movida.",
    ogTitle: "Página não encontrada | PYX Energia",
    ogDescription: "A página que você procura não existe ou foi movida.",
    markers: ["Página não encontrada"],
    robots: "noindex, nofollow",
  },
} as const satisfies Record<string, SeoPage>;

export type PageKey = keyof typeof pages;

function setMeta(attr: "name" | "property", key: string, content: string): void {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Mantém título, descrição e canonical alinhados à rota quando o JS assume a página. */
export function usePageMeta(page: SeoPage): void {
  useEffect(() => {
    document.title = page.title;
    setMeta("name", "description", page.description);
    setMeta("property", "og:title", page.ogTitle);
    setMeta("property", "og:description", page.ogDescription);
    setMeta("property", "twitter:title", page.ogTitle);
    setMeta("property", "twitter:description", page.ogDescription);
    const url = canonicalUrl(page.path === "/404" ? "/" : page.path);
    if (!page.robots) {
      setMeta("property", "og:url", url);
      setMeta("property", "twitter:url", url);
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    }
    if (page.robots) setMeta("name", "robots", page.robots);
  }, [page]);
}
