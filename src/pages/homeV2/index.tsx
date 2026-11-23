import { useEffect, useState } from "react";
import BaseTemplate from "../../components/templates/baseTemplate";
import { Section } from "../../components/templates/homeSection/Section";
import { SectionComponent, SectionTheme } from "../../components/templates/homeSection/Section.types";
import { useSectionData } from "../../hooks/useSectionData";
import { HeroSection } from "./sections/HeroSection";
import { heroData } from "./data/heroData";
import { AboutSection } from "./sections/AboutSection";
import { aboutFallback, fetchAboutSectionData } from "./adapters/aboutAdapter";
import { PrepCoursesSection } from "./sections/PrepCoursesSection";
import { fetchPrepCourses, prepCoursesFallback } from "./adapters/prepCoursesAdapter";
import { FeaturesSection } from "./sections/FeaturesSection";
import { fetchFeaturesSectionData, featuresFallback } from "./adapters/featuresAdapter";
import { MapSection } from "./sections/MapSection";
import { ImpactoSection } from "../quemSomos/ImpactoSection";
import { NewsSection } from "./sections/NewsSection";
import { fetchNews, newsFallback } from "./adapters/newsAdapter";

const ImpactoWrapper: SectionComponent<unknown> = () => <ImpactoSection />;

interface RenderableSection {
  id: string;
  component: SectionComponent<unknown>;
  data: unknown;
  theme: SectionTheme;
  fullBleed?: boolean;
}

export default function HomeV2() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 150);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const about = useSectionData(fetchAboutSectionData, aboutFallback, []);
  const prepCourses = useSectionData(fetchPrepCourses, prepCoursesFallback, []);
  const features = useSectionData(fetchFeaturesSectionData, featuresFallback, []);
  const news = useSectionData(fetchNews, newsFallback, []);

  const sections: RenderableSection[] = [
    {
      id: "hero",
      component: HeroSection as SectionComponent<unknown>,
      data: heroData,
      theme: "marine",
      fullBleed: true,
    },
    {
      id: "about-us",
      component: AboutSection as SectionComponent<unknown>,
      data: about.data,
      theme: "marine",
      fullBleed: true,
    },
    {
      id: "impact",
      component: ImpactoWrapper,
      data: null,
      theme: "neutral",
      fullBleed: true,
    },
    {
      id: "prep-courses",
      component: PrepCoursesSection as SectionComponent<unknown>,
      data: prepCourses.data,
      theme: "neutral",
    },
    {
      id: "news",
      component: NewsSection as SectionComponent<unknown>,
      data: news.data,
      theme: "neutral",
    },
    {
      id: "features",
      component: FeaturesSection as SectionComponent<unknown>,
      data: features.data,
      theme: "neutral",
    },
    {
      id: "map",
      component: MapSection as SectionComponent<unknown>,
      data: null,
      // O mapa cobre a seção inteira e carrega cartões claros (filtros, informações): tema neutro,
      // senão os tokens do marine vazam para eles (tickets/059/01).
      theme: "neutral",
      fullBleed: true,
    },
  ];

  return (
    <div className="relative overflow-x-clip scroll-smooth">
      {/* Faixa da marca sob o header (e acima do rodapé): o arco-íris fino da variante A (tickets/059/01 §7.2). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-header z-raised h-1 bg-brand-stripe"
      />
      <BaseTemplate solid={solid} position="fixed" headerShadow={false}>
        {sections.map((s) => {
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
        <div aria-hidden className="h-1 bg-brand-stripe" />
      </BaseTemplate>
    </div>
  );
}
