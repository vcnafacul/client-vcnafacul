// client-vcnafacul/src/pages/homeV2/sections/ActionAreasSection/ConstellationFallback.tsx
import { AreaGroup } from "../../adapters/actionAreasAdapter";
import { SubjectPill } from "./SubjectPill";

export function ConstellationFallback({ groups }: { groups: AreaGroup[] }) {
  return (
    <ul role="list" className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      {groups.map((g) => (
        <li key={g.id}>
          <p
            className="home-section__eyebrow mb-3"
            style={{ color: g.themeColor }}
          >
            {g.title}
          </p>
          <ul role="list" className="flex flex-wrap gap-2">
            {g.subjects.map((s, i) => (
              <li key={s.id}>
                <SubjectPill subject={s} group={g} size={i === 0 ? "lg" : "md"} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
