const RATIO = 392 / 544;

type BrandLogoProps = {
  /** Altura de exibição, em pixels. A largura segue a proporção do arquivo. */
  height: number;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
};

/** Logo servida em WebP sem perda. O PNG no mesmo caminho fica como reserva. */
export function BrandLogo({ height, className, priority = false, decorative = false }: BrandLogoProps) {
  const width = Math.round(height * RATIO);
  return (
    <picture>
      <source srcSet="/brand/pyx-logo.webp" type="image/webp" />
      <img
        src="/brand/pyx-logo.png"
        alt={decorative ? "" : "PYX Energia"}
        aria-hidden={decorative ? true : undefined}
        width={width}
        height={height}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        className={className}
      />
    </picture>
  );
}
