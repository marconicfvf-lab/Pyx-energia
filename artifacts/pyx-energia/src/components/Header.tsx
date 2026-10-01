import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Descontos", href: "#descontos" },
  { label: "Para Quem", href: "#para-quem" },
  { label: "Grupo", href: "#grupo" },
  { label: "FAQ", href: "#faq" },
];

function scrollToSimulator() {
  document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth" });
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "pt-3" : "pt-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div
            className={`flex items-center justify-between rounded-full border px-3 py-2 pl-5 transition-all duration-300 ${
              isScrolled
                ? "border-white/10 bg-black/85 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
                : "border-transparent bg-transparent"
            }`}
          >
            <a href="#" className="flex items-center gap-3 z-50">
              <img src="/brand/pyx-logo.png" alt="PYX Energia" className="h-10 w-auto" />
              <span className="hidden sm:block text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Energia
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              {navLinks.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/[0.07] text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_2px_hsl(var(--primary)/0.8)]" />
                    )}
                    {link.label}
                  </a>
                );
              })}
            </nav>

            <Button
              onClick={scrollToSimulator}
              className="hidden md:inline-flex h-11 gap-2 rounded-full px-5 glow-button"
            >
              <Zap className="h-4 w-4" />
              Simular Economia
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden z-50 p-2 text-foreground"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div
        className={`fixed inset-0 bg-background z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden flex flex-col items-center justify-center gap-8`}
      >
        <div className="pointer-events-none absolute inset-0 pyx-grid opacity-60" />
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="relative text-3xl font-display font-light text-foreground hover:text-primary"
          >
            {link.label}
          </a>
        ))}
        <Button
          size="lg"
          className="relative mt-4 gap-2 rounded-full glow-button"
          onClick={() => {
            setIsMobileMenuOpen(false);
            scrollToSimulator();
          }}
        >
          <Zap className="h-5 w-5" />
          Simular Economia Agora
        </Button>
      </div>
    </>
  );
}
