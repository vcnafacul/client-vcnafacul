// client-vcnafacul/src/pages/homeV2/sections/FeaturesSection/FeatureRow.tsx
import { useRef, useEffect } from "react";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "../../../../lib/motion/gsapSetup";
import { usePrefersReducedMotion } from "../../../../lib/motion/motionPreference";
import { palette } from "@/lib/palette";
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
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      const img = root.querySelector("[data-feature-image]") as HTMLElement | null;
      const text = root.querySelectorAll("[data-feature-text]");
      if (img) {
        gsap.from(img, {
          opacity: 0,
          scale: 0.92,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      }
      gsap.from(text, {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 80%", once: true },
      });
    }, rootRef);

    // Force ScrollTrigger to refresh once after the next paint, and also
    // when the image element finishes loading (covers async-fetched src).
    const refresh = () => ScrollTrigger.refresh();
    const r = requestAnimationFrame(() => requestAnimationFrame(refresh));

    const imgEl = root.querySelector("[data-feature-image]") as HTMLImageElement | null;
    let imgListener: (() => void) | undefined;
    if (imgEl && imgEl.tagName === "IMG") {
      imgListener = () => ScrollTrigger.refresh();
      imgEl.addEventListener("load", imgListener);
      imgEl.addEventListener("error", imgListener);
    }

    return () => {
      cancelAnimationFrame(r);
      if (imgEl && imgListener) {
        imgEl.removeEventListener("load", imgListener);
        imgEl.removeEventListener("error", imgListener);
      }
      ctx.revert();
    };
  }, [reduced, item.imageUrl]);

  return (
    <div
      ref={rootRef}
      className={[
        "grid gap-8 md:gap-20 items-center",
        "grid-cols-1 md:grid-cols-2",
        reverse ? "md:[&>*:nth-child(1)]:order-2" : "",
      ].join(" ")}
    >
      <div className="relative aspect-video rounded-3xl overflow-hidden">
        {item.imageUrl ? (
          <img
            data-feature-image
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            data-feature-image
            className="w-full h-full"
            style={{ backgroundImage: `linear-gradient(to bottom right, ${palette.marine[900]}, ${palette.mint[400]})` }}
          />
        )}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          data-feature-text
          className="absolute -top-10 -left-2 md:-left-6 font-extrabold opacity-10 leading-none select-none pointer-events-none"
          style={{ color: palette.pink[600], fontSize: "clamp(6rem, 12vw, 8rem)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <p data-feature-text className="home-section__eyebrow mb-2">
          {item.category}
        </p>
        <h3 data-feature-text className="text-h1">
          {item.title}
        </h3>
        {item.description && (
          <p data-feature-text className="mt-3 text-prose text-muted-foreground max-w-md">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
