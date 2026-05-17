// client-vcnafacul/src/components/templates/homeSection/Section.types.ts
export type SectionTheme =
  | "marine"
  | "pink"
  | "green"
  | "yellow"
  | "neutral";

export interface SectionProps {
  id: string;
  theme: SectionTheme;
  fullBleed?: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export type SectionDataProps<TData> = {
  id: string;
  data: TData;
};
export type SectionComponent<TData> = React.FC<SectionDataProps<TData>>;
