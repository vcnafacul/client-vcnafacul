// client-vcnafacul/src/lib/motion/useSectionScroll.ts
import { RefObject, useEffect } from "react";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "./gsapSetup";
import { usePrefersReducedMotion } from "./motionPreference";

export interface SectionScrollLayer {
  ref: RefObject<HTMLElement>;
  speed: number;
}

export interface UseSectionScrollOptions {
  sectionRef: RefObject<HTMLElement>;
  layers: SectionScrollLayer[];
  start?: string;
  end?: string;
}

export function useSectionScroll({
  sectionRef,
  layers,
  start = "top bottom",
  end = "bottom top",
}: UseSectionScrollOptions): void {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    if (!sectionRef.current) return;
    ensureGsapRegistered();
    const triggers: ScrollTrigger[] = [];
    layers.forEach(({ ref, speed }) => {
      if (!ref.current) return;
      const tween = gsap.fromTo(
        ref.current,
        { yPercent: -speed * 5 },
        {
          yPercent: speed * 5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!,
            start,
            end,
            scrub: true,
          },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
    return () => triggers.forEach((t) => t.kill());
  }, [sectionRef, layers, start, end, reduced]);
}
