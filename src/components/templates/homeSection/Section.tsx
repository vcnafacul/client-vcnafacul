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
      style={fullBleed ? { marginLeft: "calc(50% - 50vw)" } : undefined}
      className={[
        "bg-background text-foreground",
        fullBleed ? "w-screen" : "py-20 md:py-24",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {(eyebrow || title || subtitle) && (
        <header className="container mx-auto px-4 mb-10 md:mb-14 text-center">
          {eyebrow && <p className="text-overline text-highlight mb-3">{eyebrow}</p>}
          {title && (
            <h2 className="text-h1 text-balance">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 md:mt-4 text-prose text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
