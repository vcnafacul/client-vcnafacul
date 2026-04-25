// client-vcnafacul/src/pages/homeV2/sections/MapSection/MapFilterCard.tsx
import { CheckMapFilter } from "@/components/atoms/checkMapFilter";
import { TypeMarker } from "../../../../types/map/marker";
import { checkMapFilter } from "../../../home/data";

export function MapFilterCard({
  filterMarkers,
  onToggle,
}: {
  filterMarkers: TypeMarker[];
  onToggle: (t: TypeMarker) => void;
}) {
  return (
    <div
      className="
        absolute z-[400] hidden md:block md:top-6 md:right-6 max-w-[280px]
        bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/40
        rounded-2xl shadow-lg p-4 text-marine
      "
    >
      <p className="text-xs uppercase tracking-wider opacity-70 mb-2">
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
