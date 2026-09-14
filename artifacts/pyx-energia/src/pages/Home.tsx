import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calculator } from "@/components/Calculator";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Zap, Sun, ShieldCheck, Building2, Stethoscope, Store, Utensils, Wheat, TrendingDown, House, Landmark } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      heroRef.current.style.setProperty("--mouse-x", `${x}`);
      heroRef.current.style.setProperty("--mouse-y", `${y}`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section 
          ref={heroRef}
          className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white text-foreground"
          style={{
            backgroundImage: `radial-gradient(circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), rgba(27, 107, 58, 0.12) 0%, transparent 48%)`
          }}
        >
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Energia limpa por assinatura
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6 tracking-tight">
                  Reduza até <span className="text-primary">32%</span> na sua conta de luz.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                  Assine energia renovável sem burocracia. Sem investimento inicial, sem obras e sem instalar placas solares. 
                  Economia para sua casa ou seu negócio, todos os meses.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                    onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Simular Economia
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="h-14 px-8 text-base gap-2 border-primary/40 !bg-transparent !text-primary hover:!bg-primary/5 w-full sm:w-auto"
                    onClick={() => {
                      const text = "Olá! Gostaria de falar com um especialista sobre como reduzir minha conta de luz.";
                      window.open(`https://wa.me/5581999725151?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    Falar com especialista
                  </Button>
                </div>
                
                <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span>Regulamentado pela Aneel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span>Ativação em até 60 dias</span>
                  </div>
                </div>
              </div>

              <div id="simulador" className="lg:pl-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
                <Calculator />
              </div>
            </div>
          </div>
        </section>

        {/* LOGOS / SOCIAL PROOF (Representational) */}
        <section className="py-10 border-b bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
              Atendendo às normas e regulamentações
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
              <span className="font-display font-bold text-xl flex items-center gap-2"><Zap className="w-6 h-6"/> ANEEL</span>
              <span className="font-display font-bold text-xl flex items-center gap-2"><Sun className="w-6 h-6"/> ABSOLAR</span>
              <span className="font-display font-bold text-xl flex items-center gap-2"><Building2 className="w-6 h-6"/> CCEE</span>
              <span className="font-display font-bold text-xl">Lei 14.300</span>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
                Como a mágica acontece
              </h2>
              <p className="text-lg text-muted-foreground">
                Nós geramos energia em nossas fazendas solares e injetamos na rede da concessionária local. Os créditos gerados são transferidos para a sua conta. Simples assim.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-primary/20 z-0"></div>

              {[
                {
                  step: "1",
                  title: "Assinatura digital",
                  desc: "Analisamos sua conta atual (precisa ser acima de R$ 500) e criamos uma proposta personalizada com o percentual de desconto. Tudo assinado online."
                },
                {
                  step: "2",
                  title: "Injeção de créditos",
                  desc: "Nossas usinas geram energia limpa e injetam na rede da concessionária. Os créditos são alocados diretamente no CPF ou CNPJ da unidade consumidora."
                },
                {
                  step: "3",
                  title: "Economia no caixa",
                  desc: "Você passa a receber duas faturas unificadas na mesma plataforma, e o valor total pago será até 32% menor que sua conta original."
                }
              ].map((item, i) => (
                <div key={i} className="relative z-10 bg-white p-8 rounded-2xl shadow-sm border border-primary/5 hover:border-primary/20 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-display font-bold mb-6 shadow-lg shadow-primary/20">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARA QUEM É */}
        <section id="para-quem" className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
                  Energia mais barata para diferentes perfis
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Se a sua fatura de energia é <strong>acima de R$ 500 mensais</strong>, a PYX analisa sua unidade e mostra quanto você pode economizar, em casa ou no seu negócio.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: House, label: "Casas & Apartamentos" },
                    { icon: Landmark, label: "Condomínios" },
                    { icon: Store, label: "Comércio Varejista" },
                    { icon: Stethoscope, label: "Clínicas & Consultórios" },
                    { icon: Utensils, label: "Bares & Restaurantes" },
                    { icon: Wheat, label: "Agronegócio & Fazendas" }
                  ].map((Audience, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-transparent hover:border-primary/20 transition-colors">
                      <Audience.icon className="w-6 h-6 text-primary shrink-0" />
                      <span className="font-medium text-sm md:text-base">{Audience.label}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="mt-10 h-12 px-8"
                  onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Verificar elegibilidade
                </Button>
              </div>

              <div className="relative">
                <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-foreground relative">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10"></div>
                  {/* Decorative abstract placeholder for a high-quality image */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-foreground to-primary text-white">
                     <div className="w-24 h-24 rounded-full border-4 border-white/70 flex items-center justify-center mb-6">
                       <Zap className="w-10 h-10 text-white" />
                     </div>
                     <h3 className="text-3xl font-display font-bold mb-2">Energia Inteligente</h3>
                     <p className="text-white/70">Economia para sua casa ou empresa, com energia renovável.</p>
                  </div>
                </div>
                
                {/* Floating stat card */}
                <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs z-20">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Impacto direto</p>
                      <p className="font-display font-bold text-xl">Mais lucro limpo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Dúvidas Frequentes
              </h2>
              <p className="text-muted-foreground">Tudo o que você precisa saber sobre a assinatura de energia PYX.</p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100">
              {[
                {
                  q: "Vou precisar fazer alguma obra ou instalar placas solares?",
                  a: "Não. Absolutamente nenhuma. A energia é gerada em nossas usinas solares remotas e injetada na rede da distribuidora (Neoenergia). Você não precisa de espaço, obras ou instalações."
                },
                {
                  q: "Qual o investimento inicial?",
                  a: "Zero. Você não paga taxa de adesão, não compra equipamentos e não tem mensalidade de serviço. Você apenas assina e passa a pagar a energia com desconto."
                },
                {
                  q: "O que acontece com a minha conta da Neoenergia?",
                  a: "Você continuará conectado à Neoenergia. A diferença é que a fatura da Neoenergia virá zerada do consumo de energia (cobrando apenas taxas obrigatórias como iluminação pública), e a PYX faturará a energia consumida com o desconto aplicado. No total, a soma será menor que sua conta original."
                },
                {
                  q: "Posso cancelar quando quiser?",
                  a: "Sim. A assinatura possui condições flexíveis e pode ser cancelada mediante aviso prévio, sem as multas pesadas de financiamentos solares tradicionais."
                },
                {
                  q: "Minha conta é menor que R$ 500. Posso participar?",
                  a: "Nossa equipe analisa cada unidade consumidora para confirmar a elegibilidade e o benefício. Envie sua conta para receber uma avaliação sem compromisso."
                }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base md:text-lg">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
              Pronto para transformar sua despesa em investimento?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Fale com um de nossos consultores e descubra quanto sua casa ou empresa pode economizar nos próximos anos.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg gap-2 bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
                onClick={() => {
                  const text = "Olá! Quero saber quanto posso economizar na minha conta de luz com a PYX.";
                  window.open(`https://wa.me/5581999725151?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                Quero falar com um especialista
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
