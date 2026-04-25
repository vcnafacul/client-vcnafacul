import { useEffect, useMemo, useRef, useState } from "react";
import { ensureGsapRegistered, gsap } from "../../../../lib/motion/gsapSetup";
import { AreaGroup } from "../../adapters/actionAreasAdapter";
import { SubjectPill } from "./SubjectPill";
import { Bbox, poissonPoints } from "../../utils/poissonLayout";

const CANVAS_HEIGHT_VH = 100;

export function ConstellationCanvas({ groups }: { groups: AreaGroup[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 1200;
      setWidth(w);
    });
    ro.observe(sectionRef.current);
    return () => ro.disconnect();
  }, []);

  const groupPoints = useMemo(() => {
    const canvasH = typeof window !== "undefined" ? window.innerHeight : 800;
    return groups.map((g, gi) => {
      const groupWidth = width / 3;
      const bbox: Bbox = {
        x: gi * groupWidth + 40,
        y: 80,
        width: groupWidth - 80,
        height: canvasH - 160,
      };
      const minDist = Math.min(bbox.width, bbox.height) / Math.max(2, Math.sqrt(g.subjects.length));
      return poissonPoints(bbox, g.subjects.length, minDist * 0.8, g.id * 9973 + 1);
    });
  }, [groups, width]);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;
    ensureGsapRegistered();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        trackRef.current,
        { y: "30%" },
        {
          y: "-60%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 1,
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [groupPoints]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: `${CANVAS_HEIGHT_VH}vh` }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />
      <div ref={trackRef} className="absolute inset-0">
        {groups.map((g, gi) => (
          <div key={g.id} className="absolute inset-0">
            {g.subjects.map((s, si) => {
              const pt = groupPoints[gi][si];
              return (
                <div
                  key={s.id}
                  style={{
                    position: "absolute",
                    left: pt.x,
                    top: pt.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <SubjectPill subject={s} group={g} size={si === 0 ? "lg" : "md"} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
