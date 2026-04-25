// client-vcnafacul/src/pages/homeV2/sections/FeaturesSection/FeatureRow.tsx
import { useRef, useEffect } from "react";
import { ensureGsapRegistered, gsap } from "../../../../lib/motion/gsapSetup";
import { usePrefersReducedMotion } from "../../../../lib/motion/motionPreference";
import { FeatureItem } from "../../adapters/featuresAdapter";

export function FeatureRow({
  item,
  index,
}: {
  item: FeatureItem;
  index: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const reverse = index % 2 === 1;

  useEffect(() => {
    if (reduced) return;
    if (!rootRef.current) return;
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      const img = rootRef.current!.querySelector("[data-feature-image]");
      const text = rootRef.current!.querySelectorAll("[data-feature-text]");
      gsap.from(img, {
        opacity: 0,
        scale: 0.92,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%", once: true },
      });
      gsap.from(text, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%", once: true },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className={[
        "grid gap-8 md:gap-20 items-center",
        "grid-cols-1 md:grid-cols-2",
        reverse ? "md:[&>*:nth-child(1)]:order-2" : "",
      ].join(" ")}
    >
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-marine">
        {item.imageUrl ? (
          <img
            data-feature-image
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div data-feature-image className="w-full h-full bg-gradient-to-br from-[#0b2747] to-[#37d6b5]" />
        )}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          data-feature-text
          className="absolute -top-10 -left-2 md:-left-6 text-[6rem] md:text-[8rem] font-extrabold text-[#da005a] opacity-10 leading-none select-none pointer-events-none"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <p data-feature-text className="home-section__eyebrow mb-2">
          {item.category}
        </p>
        <h3 data-feature-text className="text-2xl md:text-3xl font-extrabold leading-tight">
          {item.title}
        </h3>
        {item.description && (
          <p data-feature-text className="mt-3 text-base opacity-80 max-w-md">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
