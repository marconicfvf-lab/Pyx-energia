import { useState } from "react";
import { MapPin } from "lucide-react";
import { BRAZIL_MAP_VIEWBOX, BRAZIL_STATES } from "@/lib/brazilMap";

export type CoverageItem = { uf: string; state: string; distributor: string };

export function CoverageMap({ coverage }: { coverage: CoverageItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const byUf = new Map(coverage.map((item) => [item.uf, item]));
  const current = active ? byUf.get(active) : undefined;

  return (
    <div className="relative">
      <svg
        viewBox={BRAZIL_MAP_VIEWBOX}
        role="group"
        aria-label="Mapa do Brasil com os estados atendidos pela PYX"
        className="mx-auto w-full max-w-[560px] h-auto drop-shadow-[0_0_40px_rgba(232,193,87,0.12)]"
      >
        {BRAZIL_STATES.map((s) => {
          const item = byUf.get(s.uf);
          if (!item) {
            return (
              <path key={s.uf} d={s.d} className="fill-white/[0.04] stroke-white/15" strokeWidth={1} strokeLinejoin="round" />
            );
          }
          const isActive = active === s.uf;
          return (
            <path
              key={s.uf}
              d={s.d}
              role="button"
              tabIndex={0}
              aria-label={`${item.state}: ${item.distributor}`}
              aria-pressed={isActive}
              onMouseEnter={() => setActive(s.uf)}
              onFocus={() => setActive(s.uf)}
              onClick={() => setActive(s.uf)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActive(s.uf);
                }
              }}
              className={`cursor-pointer stroke-background outline-none transition-colors ${
                isActive ? "fill-primary" : "fill-primary/60 hover:fill-primary focus-visible:fill-primary"
              }`}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          );
        })}
      </svg>

      <div
        aria-live="polite"
        className="mx-auto mt-6 flex max-w-sm items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 min-h-[88px]"
      >
        <div className="w-12 h-12 shrink-0 rounded-full bg-primary/15 flex items-center justify-center text-primary font-display font-semibold">
          {current ? current.uf : <MapPin className="w-5 h-5" />}
        </div>
        {current ? (
          <div className="min-w-0">
            <p className="font-medium">{current.state}</p>
            <p className="text-sm text-muted-foreground">Distribuidora: {current.distributor}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Passe o mouse ou toque em um estado destacado para ver a distribuidora.
          </p>
        )}
      </div>
    </div>
  );
}
