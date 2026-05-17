// client-vcnafacul/src/pages/homeV2/sections.config.ts
import { SectionTheme, SectionComponent } from "../../components/templates/homeSection/Section.types";
import { HeroSection } from "./sections/HeroSection";
import { heroData } from "./data/heroData";

export interface SectionConfig<TData = unknown> {
  id: string;
  component: SectionComponent<TData>;
  data: TData;
  theme: SectionTheme;
  fullBleed?: boolean;
  condition?: boolean;
}

export const SECTIONS: SectionConfig[] = [
  {
    id: "hero",
    component: HeroSection as SectionComponent<unknown>,
    data: heroData,
    theme: "marine",
    fullBleed: true,
  },
];
