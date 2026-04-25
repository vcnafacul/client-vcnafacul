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
  onClose: () => void;
}

export function MapInfoCard({ activeMarker, boxRef, onReport, onClose }: Props) {
  if (!activeMarker) return null;
  return (
    <motion.div
      ref={boxRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        absolute z-[500]
        inset-x-3 bottom-3 max-h-[60vh]
        md:left-auto md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:max-h-[70vh]
        bg-white/90 backdrop-blur-xl backdrop-saturate-150 border border-white/40
        rounded-2xl shadow-xl text-marine overflow-y-auto
      "
    >
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          type="button"
          aria-label="Reportar problema"
          className="w-9 h-9 cursor-pointer bg-transparent border-0 p-1.5 hover:bg-black/5 rounded-lg"
          onClick={onReport}
        >
          <Report className="w-full h-full" />
        </button>
        <button
          type="button"
          aria-label="Fechar"
          className="w-9 h-9 cursor-pointer bg-transparent border-0 text-xl leading-none hover:bg-black/5 rounded-lg"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="p-5 pt-12">
        <MapBoxInfoGeo geo={activeMarker.infos} ctaLink={FORM_GEOLOCATION} />
      </div>
    </motion.div>
  );
}
