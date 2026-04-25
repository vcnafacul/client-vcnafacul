// client-vcnafacul/src/pages/homeV2/index.tsx
import { Section } from "../../components/templates/homeSection/Section";
import HeroTemplate from "../../components/templates/heroTemplate";
import { SECTIONS } from "./sections.config";

export default function HomeV2() {
  return (
    <HeroTemplate headerPosition="fixed">
      <>
        {SECTIONS.filter((s) => s.condition !== false).map((s) => {
          const Comp = s.component;
          return (
            <Section
              key={s.id}
              id={s.id}
              theme={s.theme}
              fullBleed={s.fullBleed}
            >
              <Comp id={s.id} data={s.data} />
            </Section>
          );
        })}
        {SECTIONS.length === 0 && (
          <div className="container mx-auto py-32 text-center text-marine">
            <h1 className="text-3xl font-bold">Home v2 — em construção</h1>
            <p className="opacity-70 mt-2">
              Sections array vazio. Implementação em andamento.
            </p>
          </div>
        )}
      </>
    </HeroTemplate>
  );
}
