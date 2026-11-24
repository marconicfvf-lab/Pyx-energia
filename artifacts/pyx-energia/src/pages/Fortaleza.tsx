import { CityLanding } from "@/pages/CityLanding";
import { pages } from "@/lib/seo";

export default function Fortaleza() {
  return (
    <CityLanding
      page={pages.fortaleza}
      city="Fortaleza"
      uf="CE"
      stateName="Ceará"
      distributor="Enel Ceará"
      trackingOrigin="fortaleza"
      otherCities={[{ href: "/recife", label: "Recife" }]}
      intro="Em Fortaleza, a PYX oferece energia solar por assinatura para contas de baixa tensão na área da Enel Ceará. Sem placas no imóvel, sem obra e sem investimento inicial. A energia é gerada em usinas solares parceiras e injetada na rede da distribuidora. O desconto de 25% a 40% incide sobre a energia compensada, e a proposta final depende da análise da fatura."
    />
  );
}
