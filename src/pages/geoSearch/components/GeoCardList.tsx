import { Skeleton } from "@/components/ui/skeleton";
import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import type { ReactNode } from "react";
import type { EstadoDaCarga } from "../useGeoPublico";
import { GeoSearchCard } from "./GeoSearchCard";

type Props = {
  /** `area`: cursinhos da área visível. `busca`: resultados do termo (06). */
  modo?: "area" | "busca";
  termo?: string;
  estado: EstadoDaCarga;
  itens: PublicGeolocation[];
  total: number;
  ativoId: string | null;
  onFoco: (id: string | null) => void;
  onEscolher: (id: string) => void;
  tentarDeNovo: () => void;
  refDoCard: (id: string, el: HTMLElement | null) => void;
  acaoDoCard?: (geo: PublicGeolocation) => ReactNode;
};

/** Cursinhos da área visível do mapa (tickets/022, card 05). */
export function GeoCardList({
  modo = "area",
  termo = "",
  estado,
  itens,
  total,
  ativoId,
  onFoco,
  onEscolher,
  tentarDeNovo,
  refDoCard,
  acaoDoCard,
}: Props) {
  if (estado === "carregando") {
    return (
      <div
        aria-busy="true"
        aria-label="Carregando cursinhos"
        className="grid gap-3 sm:grid-cols-2"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (estado === "erro") {
    return (
      <div role="alert" className="space-y-2 text-sm text-slate-600">
        <p>Não conseguimos carregar os cursinhos.</p>
        <button
          type="button"
          onClick={tentarDeNovo}
          className="font-semibold text-marine underline"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  const buscando = modo === "busca";

  if (itens.length === 0) {
    return (
      <p role="status" className="text-sm text-slate-500">
        {buscando
          ? `Não encontramos nenhum cursinho com "${termo}".`
          : "Nenhum cursinho nesta área do mapa."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {buscando && (
        <h2 className="font-bold text-marine">
          Resultados para "{termo}" ({total})
        </h2>
      )}
      <ul
        aria-label={
          buscando ? "Resultados da busca" : "Cursinhos nesta área do mapa"
        }
        className="grid gap-3 sm:grid-cols-2"
      >
        {itens.map((geo) => (
          <li key={geo.id}>
            <GeoSearchCard
              ref={(el) => refDoCard(geo.id, el)}
              geo={geo}
              ativo={geo.id === ativoId}
              onFoco={onFoco}
              onEscolher={onEscolher}
              acao={acaoDoCard?.(geo)}
            />
          </li>
        ))}
      </ul>
      {total > itens.length && (
        <p role="status" className="text-sm text-slate-500">
          {buscando
            ? `Mostrando ${itens.length} de ${total} resultados — refine a busca para ver os outros.`
            : `Mostrando ${itens.length} de ${total} cursinhos nesta área — aproxime o mapa para ver os outros.`}
        </p>
      )}
    </div>
  );
}
