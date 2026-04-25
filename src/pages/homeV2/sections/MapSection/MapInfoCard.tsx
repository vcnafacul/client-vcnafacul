// client-vcnafacul/src/pages/homeV2/sections/MapSection/MapInfoCard.tsx
import { RefObject } from "react";
import { TypeMarker } from "../../../../types/map/marker";
import MapBoxInfoGeo from "../../../../components/organisms/mapBoxInfo/mapBoxInfoGeo";
import { ReactComponent as Report } from "../../../../assets/icons/warning.svg";
import { FORM_GEOLOCATION } from "../../../../routes/path";
import { motion } from "motion/react";

interface ActiveMarker {
  id: string;
  type: TypeMarker;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  infos: any;
}

interface Props {
  activeMarker: ActiveMarker | null;
  boxRef: RefObject<HTMLDivElement>;
  onReport: () => void;
}

export function MapInfoCard({ activeMarker, boxRef, onReport }: Props) {
  if (!activeMarker) return null;
  return (
    <motion.div
      ref={boxRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        absolute z-[400] inset-x-3 bottom-3 md:right-6 md:bottom-6 md:left-auto md:inset-auto
        md:max-w-[420px]
        bg-white/85 backdrop-blur-xl backdrop-saturate-150 border border-white/40
        rounded-2xl shadow-lg p-5 text-marine
      "
    >
      <button
        type="button"
        aria-label="Reportar problema"
        className="absolute top-3 right-3 w-9 h-9 cursor-pointer bg-transparent border-0 p-1"
        onClick={onReport}
      >
        <Report className="w-full h-full" />
      </button>
      <MapBoxInfoGeo geo={activeMarker.infos} ctaLink={FORM_GEOLOCATION} />
    </motion.div>
  );
}
