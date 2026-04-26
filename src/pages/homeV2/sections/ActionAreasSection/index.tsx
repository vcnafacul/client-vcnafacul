// client-vcnafacul/src/pages/homeV2/sections/ActionAreasSection/index.tsx
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { useIsMobile, usePrefersReducedMotion } from "../../../../lib/motion/motionPreference";
import { AreaGroup } from "../../adapters/actionAreasAdapter";
import { ConstellationCanvas } from "./ConstellationCanvas";
import { ConstellationFallback } from "./ConstellationFallback";

export const ActionAreasSection: SectionComponent<AreaGroup[]> = ({ data }) => {
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const useFallback = reduced || mobile;

  return (
    <div className="relative">
      <div className="container mx-auto px-4 mb-10 md:mb-16 text-center">
        <p className="home-section__eyebrow mb-3" style={{ color: "#37d6b5" }}>
          ÁREAS DE AÇÃO
        </p>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight [text-wrap:balance]">
          Disciplinas do ENEM
        </h2>
        <p className="mt-3 opacity-80 max-w-2xl mx-auto">
          Divididas pra facilitar tua jornada.
        </p>
      </div>
      {useFallback ? (
        <ConstellationFallback groups={data} />
      ) : (
        <>
          {/* Hidden semantic list for screen readers */}
          <ul role="list" className="sr-only">
            {data.map((g) => (
              <li key={g.id}>
                {g.title}
                <ul role="list">
                  {g.subjects.map((s) => (
                    <li key={s.id}>{s.title}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <ConstellationCanvas groups={data} />
        </>
      )}
    </div>
  );
};

export default ActionAreasSection;
