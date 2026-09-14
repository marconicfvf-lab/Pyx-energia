import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Vantagens", href: "#vantagens" },
    { label: "Para Quem", href: "#para-quem" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 z-50">
            <img src="/brand/pyx-logo.png" alt="PYX Energia" className="h-10 w-auto" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isScrolled ? "text-foreground hover:text-primary" : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Button
              onClick={() => {
                document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' });
              }}
              variant="default"
              className={`gap-2 ${
                isScrolled ? "" : "bg-white text-primary hover:bg-white/90"
              }`}
            >
              <Zap className="h-4 w-4" />
              Simular Economia
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden z-50 p-2 ${
              isMobileMenuOpen || isScrolled ? "text-foreground" : "text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={`fixed inset-0 bg-background z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden flex flex-col items-center justify-center gap-8`}
      >
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-display font-medium text-foreground"
          >
            {link.label}
          </a>
        ))}
        <Button
          size="lg"
          className="mt-4 gap-2"
          onClick={() => {
            setIsMobileMenuOpen(false);
            document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Zap className="h-5 w-5" />
          Simular Economia Agora
        </Button>
      </div>
    </header>
  );
}
