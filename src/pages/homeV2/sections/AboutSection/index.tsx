// client-vcnafacul/src/pages/homeV2/sections/AboutSection/index.tsx
import { motion } from "motion/react";
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { AboutSectionData } from "../../adapters/aboutAdapter";
import { AboutDescription } from "./AboutDescription";
import { AboutVideoCard } from "./AboutVideoCard";

export const AboutSection: SectionComponent<AboutSectionData> = ({ data }) => {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-32 h-[460px] w-[460px] rounded-full blur-3xl opacity-40"
        style={{ background: "#37d6b5" }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="px-4 py-12 md:py-16 max-w-2xl md:ml-auto flex flex-col justify-center">
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
        <div className="flex items-center justify-center py-8 md:py-12 px-4 md:mr-auto w-full">
          <div className="w-full max-w-lg aspect-video max-h-[380px]">
            <AboutVideoCard thumbnail={data.thumbnail} videoId={data.videoId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
