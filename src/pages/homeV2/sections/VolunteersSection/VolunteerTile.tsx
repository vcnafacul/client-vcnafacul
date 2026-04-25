// client-vcnafacul/src/pages/homeV2/sections/VolunteersSection/VolunteerTile.tsx
import { motion } from "motion/react";
import { Volunteer } from "../../adapters/volunteersAdapter";
import { spanForVolunteer, MosaicSpan } from "../../utils/volunteerMosaic";

export function VolunteerTile({
  volunteer,
  index,
  forceUniformOnMobile,
}: {
  volunteer: Volunteer;
  index: number;
  forceUniformOnMobile: boolean;
}) {
  const span: MosaicSpan = spanForVolunteer(volunteer.id, index);
  const desktopStyle = {
    gridColumn: `span ${span.colSpan}`,
    gridRow: `span ${span.rowSpan}`,
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: 0.04 * index, ease: "easeOut" }}
      style={forceUniformOnMobile ? undefined : desktopStyle}
      className={[
        "relative overflow-hidden rounded-2xl group bg-white",
        forceUniformOnMobile ? "aspect-square" : "min-h-[120px]",
      ].join(" ")}
    >
      {volunteer.photoUrl ? (
        <img
          src={volunteer.photoUrl}
          alt={volunteer.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#da005a] to-[#37d6b5]" />
      )}
      <div
        className={[
          "absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white",
          forceUniformOnMobile
            ? ""
            : "translate-y-full group-hover:translate-y-0 transition-transform duration-300",
        ].join(" ")}
      >
        <p className="text-sm font-semibold">{volunteer.name}</p>
        <p className="text-xs opacity-85">{volunteer.role}</p>
      </div>
    </motion.div>
  );
}
