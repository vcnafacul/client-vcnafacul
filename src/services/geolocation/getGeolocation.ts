import { PublicGeolocation } from "../../types/geolocation/publicGeolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { geolocations } from "../urls";

/**
 * Cursinhos e universidades aprovados, só com campos públicos — o mapa da home
 * e a busca. ⚠️ Não usar o `GET /geo`: ele devolve dados pessoais de quem
 * cadastrou e validou, e vai exigir login (tickets/022, cards 01 e 01b).
 *
 * Falha → lista vazia, como antes: o mapa segue sem pins em vez de quebrar.
 */
export async function getGeolocation(): Promise<PublicGeolocation[]> {
  const res = await fetchWrapper(`${geolocations}/public`, {
    headers: { "Content-Type": "application/json" },
  });
  if (res.status !== 200) return [];
  return await res.json();
}

export default getGeolocation;
