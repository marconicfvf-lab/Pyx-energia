import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { BrazilState, useCreateLead } from "@workspace/api-client-react";

const BRAZIL_STATES = Object.values(BrazilState);

export function Calculator() {
  const [bill, setBill] = useState(2500);
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [customerType, setCustomerType] = useState<"CPF" | "CNPJ">("CPF");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [state, setState] = useState<BrazilState>("PE");
  const [city, setCity] = useState("");
  const [distributor, setDistributor] = useState("Neoenergia");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [formError, setFormError] = useState("");
  const createLead = useCreateLead();

  const discountRate = 0.32; // up to 32%
  const estimatedSavings = bill * discountRate;
  const yearlySavings = estimatedSavings * 12;

  // Animate the savings number when bill changes
  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const stepTime = duration / steps;
    const difference = estimatedSavings - animatedSavings;
    const increment = difference / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedSavings(prev => {
        const next = prev + increment;
        return currentStep === steps ? estimatedSavings : next;
      });
      if (currentStep === steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [bill, estimatedSavings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleWhatsApp = () => {
    setFormError("");
    if (!name.trim() || !phone.trim() || !cpfCnpj.trim() || !city.trim()) {
      setFormError("Preencha seus dados para receber a simulação pelo WhatsApp.");
      return;
    }
    if (!consentAccepted) {
      setFormError("É necessário aceitar o uso dos dados para continuar.");
      return;
    }
    const text = `Olá! Minha conta de luz é de aproximadamente ${formatCurrency(bill)} por mês. Gostaria de saber como a PYX pode me ajudar a economizar até ${formatCurrency(estimatedSavings)} mensais.`;
    createLead.mutate(
      {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          customerType,
          cpfCnpj: cpfCnpj.trim(),
          state,
          city: city.trim(),
          distributor,
          averageBill: bill,
          estimatedMonthlySavings: estimatedSavings,
          estimatedAnnualSavings: yearlySavings,
          source: "calculator",
          consentAccepted: true,
          consentText:
            "Autorizo a PYX Energia a tratar meus dados para contato comercial e simulação de economia, conforme a LGPD.",
        },
      },
      {
        onSuccess: () => {
          window.open(`https://wa.me/5581999725151?text=${encodeURIComponent(text)}`, "_blank");
        },
        onError: () => setFormError("Não foi possível registrar seus dados. Tente novamente."),
      },
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 max-w-2xl mx-auto relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="relative z-10">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
          Simule sua economia
        </h3>
        <p className="text-muted-foreground mb-8">
          Descubra quanto você pode economizar todos os meses.
        </p>

        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <label className="text-sm font-medium text-foreground">
              Qual o valor médio da sua conta de luz?
            </label>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(bill)}
            </span>
          </div>
          <Slider
            defaultValue={[2500]}
            max={20000}
            min={500}
            step={100}
            value={[bill]}
            onValueChange={(val) => setBill(val[0])}
            className="my-6"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>R$ 500</span>
            <span>R$ 20.000+</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 border border-primary/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                Economia mensal estimada
                <Info className="w-3.5 h-3.5" />
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {formatCurrency(animatedSavings)}
                </span>
              </div>
            </div>
            
            <div className="md:border-l md:border-primary/10 md:pl-6">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                Economia em 1 ano
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-secondary">
                  {formatCurrency(yearlySavings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span>Sem investimento inicial ou custo de adesão</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span>Sem instalação de placas ou obras no imóvel</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span>Energia 100% limpa injetada direto na rede da Neoenergia</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-sm font-semibold text-foreground">Como podemos enviar sua simulação?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome completo"
              aria-label="Nome completo"
              className="h-11 rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="WhatsApp (DDD + número)"
              aria-label="WhatsApp"
              inputMode="tel"
              className="h-11 rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <select
                value={customerType}
                onChange={(event) => setCustomerType(event.target.value as "CPF" | "CNPJ")}
                aria-label="Tipo de cliente"
                className="h-11 rounded-lg border border-input bg-white px-2 text-sm text-foreground"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
              <input
                value={cpfCnpj}
                onChange={(event) => setCpfCnpj(event.target.value)}
                placeholder={customerType}
                aria-label={customerType}
                className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={state}
                onChange={(event) => setState(event.target.value as BrazilState)}
                aria-label="Estado"
                className="h-11 rounded-lg border border-input bg-white px-2 text-sm text-foreground"
              >
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Cidade"
                aria-label="Cidade"
                className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <input
            value={distributor}
            onChange={(event) => setDistributor(event.target.value)}
            placeholder="Distribuidora"
            aria-label="Distribuidora"
            className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              Autorizo a PYX Energia a tratar meus dados para contato comercial e
              simulação de economia, conforme a LGPD.
            </span>
          </label>
          {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
        </div>

        <Button onClick={handleWhatsApp} disabled={createLead.isPending} size="lg" className="w-full gap-2 text-lg h-14">
          {createLead.isPending ? "Registrando..." : "Quero economizar agora"}
          <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          *Os valores apresentados são estimativas baseadas no desconto máximo de 32%. A proposta final dependerá da análise da sua fatura.
        </p>
      </div>
    </div>
  );
}
