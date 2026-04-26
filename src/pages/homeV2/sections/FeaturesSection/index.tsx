// client-vcnafacul/src/pages/homeV2/sections/FeaturesSection/index.tsx
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { FeaturesSectionData } from "../../adapters/featuresAdapter";
import { FeatureRow } from "./FeatureRow";

export const FeaturesSection: SectionComponent<FeaturesSectionData> = ({ data }) => {
  if (data.items.length === 0) {
    return (
      <div className="container mx-auto px-4 grid gap-12">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="aspect-video rounded-3xl bg-black/5 animate-pulse"
          />
        ))}
      </div>
    );
  }
  return (
    <>
      <div className="container mx-auto px-4 mb-12 md:mb-16 text-center">
        <p className="home-section__eyebrow mb-3">O QUE A PLATAFORMA OFERECE</p>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight [text-wrap:balance]">
          {data.sectionTitle}
        </h2>
        {data.sectionDescription && (
          <p className="mt-3 opacity-80 max-w-2xl mx-auto">{data.sectionDescription}</p>
        )}
      </div>
      <div className="container mx-auto px-4 max-w-6xl flex flex-col gap-24 md:gap-32">
        {data.items.map((item, i) => (
          <FeatureRow key={item.id} item={item} index={i} />
        ))}
      </div>
    </>
  );
};

export default FeaturesSection;
