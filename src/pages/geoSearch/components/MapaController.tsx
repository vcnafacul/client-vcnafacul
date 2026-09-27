import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import type { Limites } from "../regras";

export const ESPERA_MS = 200;

function limitesDo(mapa: LeafletMap): Limites {
  const b = mapa.getBounds();
  return {
    norte: b.getNorth(),
    sul: b.getSouth(),
    leste: b.getEast(),
    oeste: b.getWest(),
  };
}

/**
 * Vive DENTRO do `MapContainer` (entra pelo `mapEvent` do `MapBox`, que não
 * precisou mudar para isso): avisa a área visível — no início e depois de cada
 * arrasto/zoom, com espera de 200 ms — e entrega o mapa para o `flyTo`.
 */
export function MapaController({
  onLimites,
  onMapa,
}: {
  onLimites: (l: Limites) => void;
  onMapa: (m: LeafletMap) => void;
}) {
  const mapa = useMap();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const aoMudar = useRef(onLimites);
  aoMudar.current = onLimites;

  const avisar = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => aoMudar.current(limitesDo(mapa)),
      ESPERA_MS,
    );
  };

  useMapEvents({ moveend: avisar, zoomend: avisar });

  useEffect(() => {
    onMapa(mapa);
    aoMudar.current(limitesDo(mapa));
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapa]);

  return null;
}
