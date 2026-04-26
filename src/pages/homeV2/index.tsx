import { useEffect, useState } from "react";
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
import { FeaturesSection } from "./sections/FeaturesSection";
import { fetchFeaturesSectionData, featuresFallback } from "./adapters/featuresAdapter";
import { SponsorsSection } from "./sections/SponsorsSection";
import { fetchSponsors, sponsorsFallback } from "./adapters/sponsorsAdapter";
import { MapSection } from "./sections/MapSection";
import { NewsSection } from "./sections/NewsSection";
import { fetchNews, newsFallback } from "./adapters/newsAdapter";

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
  const volunteers = useSectionData(fetchVolunteers, volunteersFallback, []);
  const prepCourses = useSectionData(fetchPrepCourses, prepCoursesFallback, []);
  const features = useSectionData(fetchFeaturesSectionData, featuresFallback, []);
  const sponsors = useSectionData(fetchSponsors, sponsorsFallback, []);
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
      id: "volunteers",
      component: VolunteersSection as SectionComponent<unknown>,
      data: volunteers.data,
      theme: "pink",
    },
    {
      id: "prep-courses",
      component: PrepCoursesSection as SectionComponent<unknown>,
      data: prepCourses.data,
      theme: "neutral",
    },
    {
      id: "features",
      component: FeaturesSection as SectionComponent<unknown>,
      data: features.data,
      theme: "neutral",
    },
    {
      id: "sponsors",
      component: SponsorsSection as SectionComponent<unknown>,
      data: sponsors.data,
      theme: "yellow",
    },
    {
      id: "map",
      component: MapSection as SectionComponent<unknown>,
      data: null,
      theme: "marine",
      fullBleed: true,
    },
    {
      id: "news",
      component: NewsSection as SectionComponent<unknown>,
      data: news.data,
      theme: "neutral",
    },
  ];

  return (
    <div className="overflow-x-clip scroll-smooth">
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
