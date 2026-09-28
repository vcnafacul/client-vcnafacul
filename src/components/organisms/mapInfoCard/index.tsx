import { ReactComponent as Report } from "@/assets/icons/warning.svg";
import MapBoxInfoGeo from "@/components/organisms/mapBoxInfo/mapBoxInfoGeo";
import { Marker, TypeMarker } from "@/types/map/marker";
import { motion } from "motion/react";
import { ReactNode, RefObject } from "react";

/** Posição da home: bottom sheet no celular, canto inferior direito no desktop. */
const POSICAO_DA_HOME = `
  left-3 right-3 bottom-3 max-h-[60vh]
  md:left-auto md:top-auto md:right-6 md:bottom-6 md:w-[420px] md:max-h-[70vh]
`;

interface Props {
  activeMarker: Marker | null;
  boxRef?: RefObject<HTMLDivElement>;
  onReport: () => void;
  onClose: () => void;
  /** Link do "Cadastrar um Cursinho". Sem ele, o botão não aparece. */
  ctaLink?: string;
  /** Posição/altura do cartão; sem ela, a da home. */
  className?: string;
  /** Botões extras ao lado do ⚠️ (ex.: "informação correta", card 09). */
  acoes?: ReactNode;
}

/**
 * Cartão do cursinho/universidade sobre o mapa, com reportar. Saiu da home
 * (MapSection) para servir também ao Localiza Cursinho (tickets/022, card 07).
 */
export function MapInfoCard({
  activeMarker,
  boxRef,
  onReport,
  onClose,
  ctaLink,
  className = POSICAO_DA_HOME,
  acoes,
}: Props) {
  if (!activeMarker) return null;

  const label =
    activeMarker.type === TypeMarker.geo ? "Cursinho" : "Universidade";

  return (
    <motion.div
      ref={boxRef}
      role="dialog"
      aria-label={`${label}: ${activeMarker.infos.name}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        absolute z-30
        ${className}
        bg-white/90 backdrop-blur-xl backdrop-saturate-150 border border-white/40
        rounded-2xl shadow-xl text-marine overflow-y-auto
      `}
    >
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {acoes}
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
        <MapBoxInfoGeo
          geo={activeMarker.infos}
          ctaLink={ctaLink}
          label={label}
          markerType={activeMarker.type}
        />
      </div>
    </motion.div>
  );
}
