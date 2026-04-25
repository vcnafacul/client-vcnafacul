// client-vcnafacul/src/pages/homeV2/sections/ActionAreasSection/ConstellationCanvas.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { AreaGroup } from "../../adapters/actionAreasAdapter";
import { SubjectPill } from "./SubjectPill";
import { Bbox, poissonPoints } from "../../utils/poissonLayout";

const CANVAS_HEIGHT = 600;

export function ConstellationCanvas({ groups }: { groups: AreaGroup[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 1200;
      setWidth(w);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const groupOffsets = [-8, 0, 6];

  const groupPoints = useMemo(() => {
    return groups.map((g, gi) => {
      const groupWidth = width / 3;
      const bbox: Bbox = {
        x: gi * groupWidth + 40,
        y: 40,
        width: groupWidth - 80,
        height: CANVAS_HEIGHT - 80,
      };
      const minDist = Math.min(bbox.width, bbox.height) / Math.max(2, Math.sqrt(g.subjects.length));
      return poissonPoints(bbox, g.subjects.length, minDist * 0.8, g.id * 9973 + 1);
    });
  }, [groups, width]);

  // IMPORTANT: useTransform must be called at top level (not in a loop) to comply with Rules of Hooks.
  // The data is guaranteed to have exactly 3 area groups.
  const yPct1 = useTransform(scrollYProgress, [0, 1], [`${groupOffsets[0]}%`, `${-groupOffsets[0]}%`]);
  const yPct2 = useTransform(scrollYProgress, [0, 1], [`${groupOffsets[1]}%`, `${-groupOffsets[1]}%`]);
  const yPct3 = useTransform(scrollYProgress, [0, 1], [`${groupOffsets[2]}%`, `${-groupOffsets[2]}%`]);
  const yTransforms = [yPct1, yPct2, yPct3];

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ height: CANVAS_HEIGHT }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />
      {groups.map((g, gi) => (
        <motion.div
          key={g.id}
          style={{ y: yTransforms[gi] }}
          className="absolute inset-0"
        >
          {g.subjects.map((s, si) => {
            const pt = groupPoints[gi][si];
            const floatDelay = (gi * 7 + si * 3) % 13;
            return (
              <motion.div
                key={s.id}
                animate={{ y: ["0px", "-2px", "0px", "2px", "0px"] }}
                transition={{
                  duration: 3 + (floatDelay % 3),
                  delay: floatDelay * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  left: pt.x,
                  top: pt.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <SubjectPill subject={s} group={g} size={si === 0 ? "lg" : "md"} />
              </motion.div>
            );
          })}
        </motion.div>
      ))}
    </div>
  );
}
