import { ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/40 text-foreground py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <img src="/brand/pyx-logo.png" alt="PYX Energia" className="h-16 w-auto mb-6" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Energia renovável por assinatura para casas e empresas. Reduza sua conta sem investir nada, sem obras e sem burocracia.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-normal text-sm uppercase tracking-[0.25em] mb-6">Navegação</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="/#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a></li>
              <li><a href="/#vantagens" className="hover:text-primary transition-colors">Vantagens</a></li>
              <li><a href="/#para-quem" className="hover:text-primary transition-colors">Para Quem é</a></li>
              <li><a href="/#grupo" className="hover:text-primary transition-colors">Grupo PYX</a></li>
              <li><a href="/#depoimentos" className="hover:text-primary transition-colors">Depoimentos</a></li>
              <li><a href="/#faq" className="hover:text-primary transition-colors">Dúvidas Frequentes</a></li>
              <li><a href="/empresas" className="hover:text-primary transition-colors">Para empresas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-normal text-sm uppercase tracking-[0.25em] mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a href="https://wa.me/5581999725151" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-primary rounded-full text-primary-foreground text-[10px] shrink-0">W</span>
                   (81) 99972-5151
                </a>
              </li>
              <li>Nordeste</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-normal text-sm uppercase tracking-[0.25em] mb-6">Comece agora</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Descubra o quanto você pode economizar.
            </p>
            <a 
              href="https://wa.me/5581999725151?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20como%20reduzir%20minha%20conta%20de%20luz%20com%20a%20PYX."
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 w-full"
            >
              <Zap className="h-4 w-4" />
              Falar com Especialista
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PYX Energia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Regulamentado pela ANEEL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
