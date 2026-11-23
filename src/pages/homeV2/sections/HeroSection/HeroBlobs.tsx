// client-vcnafacul/src/pages/homeV2/sections/HeroSection/HeroBlobs.tsx
import React, { useRef } from "react";
import { palette } from "@/lib/palette";
import { useSectionScroll } from "../../../../lib/motion/useSectionScroll";

export function HeroBlobs({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const pinkRef = useRef<HTMLDivElement>(null);
  const greenRef = useRef<HTMLDivElement>(null);
  useSectionScroll({
    sectionRef: sectionRef as React.RefObject<HTMLElement>,
    layers: [
      { ref: pinkRef as React.RefObject<HTMLElement>, speed: -0.6 },
      { ref: greenRef as React.RefObject<HTMLElement>, speed: 0.4 },
    ],
  });
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        ref={pinkRef}
        className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full blur-3xl opacity-40"
        style={{ background: palette.pink[600] }}
      />
      <div
        ref={greenRef}
        className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full bg-highlight blur-3xl opacity-40"
      />
    </div>
  );
}
