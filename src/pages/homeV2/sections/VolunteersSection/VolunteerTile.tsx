import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Volunteer } from "../../adapters/volunteersAdapter";
import { spanForVolunteer, MosaicSpan } from "../../utils/volunteerMosaic";
import { getPhotoCollaborator } from "../../../../services/prepCourse/collaborator/get-photo";

const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

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
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const hasImage = !!volunteer.imageKey;

  useEffect(() => {
    if (!volunteer.imageKey) return;
    const imageKey = volunteer.imageKey;
    let cancelled = false;
    let blobUrl: string | undefined;
    (async () => {
      try {
        const blob = await getPhotoCollaborator(imageKey);
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setPhotoUrl(blobUrl);
      } catch {
        if (cancelled) return;
        if (VITE_FTP_PROFILE) {
          setPhotoUrl(`${VITE_FTP_PROFILE}/${imageKey}`);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [volunteer.imageKey]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: 0.04 * index, ease: "easeOut" }}
      style={forceUniformOnMobile ? undefined : desktopStyle}
      className={[
        "relative overflow-hidden rounded-2xl group",
        hasImage ? "bg-white" : "bg-gray-300",
        forceUniformOnMobile ? "aspect-square" : "min-h-[120px]",
      ].join(" ")}
    >
      {hasImage && photoUrl && (
        <img
          src={photoUrl}
          alt={volunteer.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      )}
      {!hasImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 text-gray-700">
          <p className="text-sm font-semibold leading-tight">
            {volunteer.name}
          </p>
          <p className="text-xs opacity-80 mt-1">{volunteer.role}</p>
        </div>
      )}
      {hasImage && (
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
      )}
    </motion.div>
  );
}
