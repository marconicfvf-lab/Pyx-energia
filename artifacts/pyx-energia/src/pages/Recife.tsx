import { CityLanding } from "@/pages/CityLanding";
import { pages } from "@/lib/seo";

export default function Recife() {
  return (
    <CityLanding
      page={pages.recife}
      city="Recife"
      uf="PE"
      stateName="Pernambuco"
      distributor="Neoenergia Pernambuco"
      trackingOrigin="recife"
      otherCities={[{ href: "/fortaleza", label: "Fortaleza" }]}
      intro="Em Recife, a conta de luz de baixa tensão pode entrar na energia solar por assinatura da PYX, na área da Neoenergia Pernambuco. Você não instala placas, não faz obra e não paga investimento inicial. Usinas solares parceiras geram a energia, a PYX intermedeia a adesão, e o desconto de 20% a 40% incide sobre a energia compensada. A proposta final depende da análise da fatura."
    />
  );
}
