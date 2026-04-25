// client-vcnafacul/src/pages/homeV2/sections/HeroSection/HeroTriptych.tsx
import { motion } from "motion/react";
import { HeroPersona } from "../../data/heroData";

const VARIANT_CLASSES: Record<HeroPersona["variant"], string> = {
  primary: "bg-[#da005a] text-white col-span-2 md:col-span-1 md:row-span-1",
  secondary:
    "bg-[#001b3a] text-white border border-[#37d6b5]",
  tertiary: "bg-[#37d6b5] text-[#0b2747]",
};

export function HeroTriptych({ personas }: { personas: HeroPersona[] }) {
  return (
    <div
      className="
        grid gap-3 md:gap-4
        grid-cols-2 md:grid-cols-[2fr_1fr_1fr]
      "
    >
      {personas.map((p, i) => (
        <motion.a
          key={p.eyebrow}
          href={p.ctaHref}
          target={p.ctaTarget ?? "_self"}
          rel={p.ctaTarget === "_blank" ? "noopener noreferrer" : undefined}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.15 * i, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          className={[
            "rounded-2xl p-5 md:p-7 flex flex-col justify-between min-h-[160px] md:min-h-[200px]",
            "shadow-lg focus-visible:outline outline-2 outline-offset-2 outline-[#37d6b5]",
            VARIANT_CLASSES[p.variant],
            p.variant === "primary"
              ? "col-span-2 md:col-span-1 md:[grid-column:1/2]"
              : "",
          ].join(" ")}
        >
          <div>
            <p className="text-[11px] tracking-[0.18em] opacity-80">{p.eyebrow}</p>
            <h3 className="mt-2 text-xl md:text-2xl font-extrabold leading-tight">
              {p.title}
            </h3>
            {p.microcopy && (
              <p className="mt-2 text-xs md:text-sm opacity-85 max-w-[28ch]">
                {p.microcopy}
              </p>
            )}
          </div>
          <span className="mt-4 text-sm font-semibold">{p.ctaLabel}</span>
        </motion.a>
      ))}
    </div>
  );
}
