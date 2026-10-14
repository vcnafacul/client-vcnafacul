import { TypeMarker } from "../../../types/map/marker";

/**
 * O aglomerado leva a cor do tipo que é maioria nele. Empate fica com o
 * cursinho, que é o assunto do mapa.
 */
export function clusterType(types: TypeMarker[]): TypeMarker {
  const univ = types.filter((t) => t === TypeMarker.univPublic).length;
  return univ > types.length - univ ? TypeMarker.univPublic : TypeMarker.geo;
}
