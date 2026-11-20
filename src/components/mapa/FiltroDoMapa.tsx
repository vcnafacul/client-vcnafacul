import { Checkbox } from "@/components/ui/checkbox";
import { MarkerPin } from "@/components/molecules/mapBox";
import { TypeMarker } from "@/types/map/marker";

interface FiltroDoMapaProps {
  label: string;
  type: TypeMarker;
  checked: boolean;
  onChange: () => void;
  /** Cor e peso do texto, que mudam conforme o fundo do painel. */
  className?: string;
}

/** Uma opção do filtro do mapa (Cursinhos, Universidades): caixa, nome e o pino do tipo. */
export function FiltroDoMapa({
  label,
  type,
  checked,
  onChange,
  className,
}: FiltroDoMapaProps) {
  return (
    <div className={className}>
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        label={
          <span className="flex flex-1 items-center justify-between gap-3">
            {label}
            <MarkerPin type={type} size={28} />
          </span>
        }
      />
    </div>
  );
}
