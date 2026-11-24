import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { BrandLogo } from "@/components/BrandLogo";
import { pages, usePageMeta } from "@/lib/seo";

const COMPANY_NAME =
  (import.meta.env.VITE_COMPANY_NAME as string | undefined)?.trim() || "MV Investimentos e Participações Ltda";
const COMPANY_CNPJ =
  (import.meta.env.VITE_COMPANY_CNPJ as string | undefined)?.trim() || "57.705.818/0001-27";

export default function Privacidade() {
  usePageMeta(pages.privacidade);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pyx-landing flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b border-white/10 bg-black/40">
        <div className="container mx-auto flex items-center px-4 py-4 md:px-6">
          <a href="/" aria-label="PYX Energia — página inicial">
            <BrandLogo height={48} className="h-12 w-auto" />
          </a>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-16 md:px-6">
        <h1 className="mb-6 text-4xl font-display font-light tracking-tight">Política de Privacidade</h1>
        <div className="space-y-6 leading-relaxed text-muted-foreground">
          <p>
            Esta política explica como a PYX Energia trata os dados pessoais de quem visita o site pyxenergia.com,
            usa o simulador de economia ou pede uma proposta, em conformidade com a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018, LGPD).
          </p>

          <section>
            <h2 className="mb-2 text-xl font-medium text-foreground">Quem é o controlador dos dados</h2>
            <p>
              PYX Energia
              {COMPANY_NAME ? `, operada por ${COMPANY_NAME}` : ""}
              {COMPANY_CNPJ ? `, CNPJ ${COMPANY_CNPJ}` : ""}. Contato para assuntos de privacidade:{" "}
              <a className="text-primary underline" href="mailto:comercial@pyxenergia.com">comercial@pyxenergia.com</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-medium text-foreground">Quais dados coletamos</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Dados que você informa nos formulários: nome, telefone/WhatsApp, CPF ou CNPJ, empresa e cargo, cidade e estado, valor médio da conta de luz e segmento.</li>
              <li>Documentos que você nos enviar para a adesão (por exemplo, conta de energia e documento de identificação do responsável).</li>
              <li>Dados de navegação e de origem do anúncio (como UTMs e identificadores de clique do Google e do Meta), quando você aceita os cookies.</li>
              <li>Mensagens trocadas com a gente por WhatsApp, e-mail ou pelo chat do site.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-medium text-foreground">Para que usamos</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Fazer a simulação de economia e entrar em contato com você sobre a proposta.</li>
              <li>Analisar a conta de energia, intermediar a adesão às usinas solares parceiras e acompanhar o atendimento.</li>
              <li>Medir a audiência do site e a eficácia dos nossos anúncios, quando você aceita os cookies.</li>
              <li>Cumprir obrigações legais e proteger direitos em caso de disputa.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-medium text-foreground">Com quem compartilhamos</h2>
            <p>
              Para concretizar a sua adesão, compartilhamos os dados necessários com a usina parceira responsável pelo
              contrato, e usamos fornecedores de tecnologia (hospedagem, banco de dados, WhatsApp, e-mail). Se você aceitar os
              cookies, o Google e o Meta recebem dados de navegação e de conversão para medir anúncios. Não vendemos seus dados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-medium text-foreground">Cookies</h2>
            <p>
              Só carregamos as ferramentas de medição de anúncios depois que você aceita no aviso de cookies. Se recusar, o
              site continua funcionando normalmente. Você pode limpar os dados do navegador para mudar a escolha.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-medium text-foreground">Seus direitos</h2>
            <p>
              Você pode pedir confirmação de tratamento, acesso, correção, anonimização ou exclusão dos seus dados,
              portabilidade e a revogação do consentimento, conforme o art. 18 da LGPD. Escreva para{" "}
              <a className="text-primary underline" href="mailto:comercial@pyxenergia.com">comercial@pyxenergia.com</a>.
            </p>
          </section>

          <p className="text-sm">Última atualização: novembro de 2026.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
