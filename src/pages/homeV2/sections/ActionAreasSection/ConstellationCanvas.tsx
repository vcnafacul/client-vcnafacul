import { useEffect, useMemo, useRef, useState } from "react";
import { AreaGroup } from "../../adapters/actionAreasAdapter";
import { SubjectPill } from "./SubjectPill";
import { Bbox, poissonPoints } from "../../utils/poissonLayout";

const CANVAS_HEIGHT_VH = 70;

export function ConstellationCanvas({ groups }: { groups: AreaGroup[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
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
    const canvasH =
      typeof window !== "undefined"
        ? Math.round((window.innerHeight * CANVAS_HEIGHT_VH) / 100)
        : 600;
    return groups.map((g, gi) => {
      const groupWidth = width / 3;
      const bbox: Bbox = {
        x: gi * groupWidth + 40,
        y: 40,
        width: groupWidth - 80,
        height: canvasH - 80,
      };
      const minDist =
        Math.min(bbox.width, bbox.height) /
        Math.max(2, Math.sqrt(g.subjects.length));
      return poissonPoints(bbox, g.subjects.length, minDist * 0.8, g.id * 9973 + 1);
    });
  }, [groups, width]);

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
  );
}
