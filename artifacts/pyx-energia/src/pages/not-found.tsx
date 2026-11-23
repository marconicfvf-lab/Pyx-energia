import { Footer } from "@/components/Footer";
import { pages, usePageMeta } from "@/lib/seo";

export default function NotFound() {
  usePageMeta(pages.notFound);
  return (
    <div className="pyx-landing flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b border-white/10 bg-black/40">
        <div className="container mx-auto flex items-center px-4 py-4 md:px-6">
          <a href="/" aria-label="PYX Energia — página inicial">
            <img src="/brand/pyx-logo.png" alt="PYX Energia" className="h-12 w-auto" />
          </a>
        </div>
      </header>
      <main className="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-24 md:px-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mb-6 text-4xl font-display font-light tracking-tight">Página não encontrada</h1>
        <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <a
          href="/"
          className="inline-flex h-12 w-fit items-center rounded-full bg-primary px-7 font-medium text-primary-foreground"
        >
          Voltar para a página inicial
        </a>
      </main>
      <Footer />
    </div>
  );
}
