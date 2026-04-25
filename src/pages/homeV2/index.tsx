import { LegacyRef, useEffect, useRef, useState } from "react";
import BaseTemplate from "../../components/templates/baseTemplate";
import { Section } from "../../components/templates/homeSection/Section";
import { SECTIONS } from "./sections.config";

export default function HomeV2() {
  const [solid, setSolid] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handler = () => setSolid(el.scrollTop > 150);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      ref={scrollContainerRef as LegacyRef<HTMLDivElement>}
      className="flex flex-col overflow-y-auto scrollbar-hide h-screen overflow-x-hidden scroll-smooth"
    >
      <BaseTemplate solid={solid} position="fixed" headerShadow={false}>
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
            <p className="opacity-70 mt-2">Sections array vazio. Implementação em andamento.</p>
          </div>
        )}
      </BaseTemplate>
    </div>
  );
}
