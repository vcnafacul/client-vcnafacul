// client-vcnafacul/src/pages/homeV2/adapters/featuresAdapter.ts
import { getHomeFeatureSection } from "../../../services/home/getHomeFeatureSection";
import { getHomeFeatures } from "../../../services/home/getHomeFeatures";
import { homeContentFile } from "../../../services/urls";

export interface FeatureItem {
  id: string | number;
  category: string;
  title: string;
  description?: string | null;
  imageUrl: string;
}

export interface FeaturesSectionData {
  sectionTitle: string;
  sectionDescription: string | null;
  items: FeatureItem[];
}

export const featuresFallback: FeaturesSectionData = {
  sectionTitle: "Ferramentas pra você passar",
  sectionDescription: null,
  items: [],
};

export async function fetchFeaturesSectionData(): Promise<FeaturesSectionData> {
  const [section, features] = await Promise.all([
    getHomeFeatureSection().catch(() => null),
    getHomeFeatures().catch(() => []),
  ]);
  return {
    sectionTitle: section?.title ?? featuresFallback.sectionTitle,
    sectionDescription: section?.description ?? null,
    items: (features ?? []).map((f) => ({
      id: f.id,
      category: "RECURSO",
      title: f.title,
      description: f.description,
      imageUrl: f.imageUrl ? homeContentFile(f.imageUrl) : "",
    })),
  };
}
