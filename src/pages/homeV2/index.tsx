import { LegacyRef, useEffect, useRef, useState } from "react";
import BaseTemplate from "../../components/templates/baseTemplate";
import { Section } from "../../components/templates/homeSection/Section";
import { SectionComponent, SectionTheme } from "../../components/templates/homeSection/Section.types";
import { useSectionData } from "../../hooks/useSectionData";
import { HeroSection } from "./sections/HeroSection";
import { heroData } from "./data/heroData";
import { AboutSection } from "./sections/AboutSection";
import { aboutFallback, fetchAboutSectionData } from "./adapters/aboutAdapter";
import { VolunteersSection } from "./sections/VolunteersSection";
import { fetchVolunteers, volunteersFallback } from "./adapters/volunteersAdapter";
import { PrepCoursesSection } from "./sections/PrepCoursesSection";
import { fetchPrepCourses, prepCoursesFallback } from "./adapters/prepCoursesAdapter";

interface RenderableSection {
  id: string;
  component: SectionComponent<unknown>;
  data: unknown;
  theme: SectionTheme;
  fullBleed?: boolean;
}

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

  const about = useSectionData(fetchAboutSectionData, aboutFallback, []);
  const volunteers = useSectionData(fetchVolunteers, volunteersFallback, []);
  const prepCourses = useSectionData(fetchPrepCourses, prepCoursesFallback, []);

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
      id: "volunteers",
      component: VolunteersSection as SectionComponent<unknown>,
      data: volunteers.data,
      theme: "pink",
    },
    {
      id: "prep-courses",
      component: PrepCoursesSection as SectionComponent<unknown>,
      data: prepCourses.data,
      theme: "green",
    },
  ];

  return (
    <div
      ref={scrollContainerRef as LegacyRef<HTMLDivElement>}
      className="flex flex-col overflow-y-auto scrollbar-hide h-screen overflow-x-hidden scroll-smooth"
    >
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
      </BaseTemplate>
    </div>
  );
}
