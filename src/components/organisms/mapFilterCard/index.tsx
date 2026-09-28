import { CheckMapFilter } from "@/components/atoms/checkMapFilter";
import { checkMapFilter } from "@/pages/homeLegacy/data";
import { TypeMarker } from "@/types/map/marker";

/**
 * Filtro Cursinhos/Universidades sobre o mapa. Saiu da home (MapSection) para
 * ser usado também no Localiza Cursinho (tickets/022, card 05). `className`
 * troca a posição; sem ele, a da home.
 */
export function MapFilterCard({
  filterMarkers,
  onToggle,
  className = "top-3 left-14 md:top-6 md:left-20",
}: {
  filterMarkers: TypeMarker[];
  onToggle: (t: TypeMarker) => void;
  className?: string;
}) {
  return (
    <div
      className={`
        absolute z-30 ${className} max-w-[260px]
        bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/40
        rounded-2xl shadow-lg p-3 md:p-4 text-marine
        [&_label]:!text-[#0b2747]
      `}
    >
      <p className="text-[10px] uppercase tracking-wider opacity-70 mb-2">
        Filtros
      </p>
      <div className="flex flex-col gap-2">
        {checkMapFilter.map((f) => (
          <CheckMapFilter
            key={f.id}
            label={f.name}
            type={f.type}
            checked={filterMarkers.includes(f.type)}
            onClick={() => onToggle(f.type)}
          />
        ))}
      </div>
    </div>
  );
}
