// client-vcnafacul/src/pages/homeV2/sections/AboutSection/index.tsx
import { motion } from "motion/react";
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { AboutSectionData } from "../../adapters/aboutAdapter";
import { AboutDescription } from "./AboutDescription";
import { AboutVideoCard } from "./AboutVideoCard";

export const AboutSection: SectionComponent<AboutSectionData> = ({ data }) => {
  return (
    <div className="relative min-h-[80vh]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-8 md:gap-0 items-stretch min-h-[80vh]">
        <div className="container mx-auto md:mx-0 md:ml-auto px-4 md:pl-8 md:pr-12 py-16 md:py-24 max-w-2xl flex flex-col justify-center">
          <p className="home-section__eyebrow mb-3">{data.eyebrow}</p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-extrabold leading-tight [text-wrap:balance] mb-6"
          >
            {data.title}
          </motion.h2>
          <AboutDescription description={data.description} />
        </div>
        <div className="relative h-[420px] md:h-auto md:min-h-[80vh]">
          <AboutVideoCard thumbnail={data.thumbnail} videoId={data.videoId} />
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
