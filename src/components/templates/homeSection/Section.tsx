// client-vcnafacul/src/components/templates/homeSection/Section.tsx
import { SectionProps } from "./Section.types";

export function Section({
  id,
  theme,
  fullBleed,
  eyebrow,
  title,
  subtitle,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      data-theme={theme}
      className={[
        "home-section",
        fullBleed ? "home-section--full-bleed" : "",
        "py-20 md:py-24",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(eyebrow || title || subtitle) && (
        <header className="container mx-auto px-4 mb-10 md:mb-14 text-center">
          {eyebrow && <p className="home-section__eyebrow mb-3">{eyebrow}</p>}
          {title && (
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-balance">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 md:mt-4 text-base md:text-lg opacity-80 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
