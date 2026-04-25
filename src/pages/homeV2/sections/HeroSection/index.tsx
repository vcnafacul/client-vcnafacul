// client-vcnafacul/src/pages/homeV2/sections/HeroSection/index.tsx
import { useRef } from "react";
import { motion } from "motion/react";
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { HeroData } from "../../data/heroData";
import { HeroBlobs } from "./HeroBlobs";
import { HeroTriptych } from "./HeroTriptych";

export const HeroSection: SectionComponent<HeroData> = ({ data }) => {
  const sectionRef = useRef<HTMLElement>(null);
  return (
    <div
      ref={sectionRef as never}
      className="relative min-h-[92vh] flex flex-col justify-center"
    >
      <HeroBlobs sectionRef={sectionRef} />
      <div className="container mx-auto px-4 relative z-10 py-24">
        <p className="home-section__eyebrow mb-4">{data.eyebrow}</p>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="text-5xl md:text-7xl xl:text-8xl font-extrabold leading-[1.05] [text-wrap:balance] max-w-5xl"
        >
          {data.title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-block text-[#37d6b5]"
          >
            {data.titleAccent}
          </motion.span>
        </motion.h1>
        <p className="mt-6 text-base md:text-lg max-w-2xl opacity-85">
          {data.subtitle}
        </p>
        <div className="mt-10 md:mt-14">
          <HeroTriptych personas={data.personas} />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
