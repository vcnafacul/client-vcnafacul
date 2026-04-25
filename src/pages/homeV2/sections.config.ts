// client-vcnafacul/src/pages/homeV2/sections.config.ts
import { SectionTheme, SectionComponent } from "../../components/templates/homeSection/Section.types";

export interface SectionConfig<TData = unknown> {
  id: string;
  component: SectionComponent<TData>;
  data: TData;
  theme: SectionTheme;
  fullBleed?: boolean;
  condition?: boolean;
}

export const SECTIONS: SectionConfig[] = [];
