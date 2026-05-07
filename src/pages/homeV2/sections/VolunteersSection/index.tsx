// client-vcnafacul/src/pages/homeV2/sections/VolunteersSection/index.tsx
import { SectionComponent } from "../../../../components/templates/homeSection/Section.types";
import { Volunteer } from "../../adapters/volunteersAdapter";
import { useIsMobile } from "../../../../lib/motion/motionPreference";
import { VolunteerTile } from "./VolunteerTile";

export const VolunteersSection: SectionComponent<Volunteer[]> = ({ data }) => {
  const mobile = useIsMobile();
  if (data.length === 0) {
    return (
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#da005a22] aspect-square animate-pulse"
          />
        ))}
      </div>
    );
  }
  return (
    <>
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="home-section__eyebrow mb-3">QUEM FAZ ACONTECER</p>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight [text-wrap:balance]">
          Voluntários que doam tempo pela educação
        </h2>
      </div>
      <div
        className="container mx-auto px-4 grid gap-2"
        style={
          mobile
            ? { gridTemplateColumns: "1fr 1fr" }
            : { gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "120px" }
        }
      >
        {data.map((v, i) => (
          <VolunteerTile
            key={v.id}
            volunteer={v}
            index={i}
            forceUniformOnMobile={mobile}
          />
        ))}
      </div>
    </>
  );
};

export default VolunteersSection;
