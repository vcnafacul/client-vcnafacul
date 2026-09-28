import { PublicGeolocation } from "../../types/geolocation/publicGeolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { geolocations } from "../urls";

/**
 * Cursinhos e universidades aprovados, só com campos públicos. ⚠️ Não usar o
 * `GET /geo`: ele devolve dados pessoais de quem cadastrou e validou, e vai
 * exigir login (tickets/022, cards 01 e 01b).
 *
 * Lança em falha — o Localiza Cursinho mostra erro com "tentar de novo".
 */
const pedirGeoPublico = () =>
  fetchWrapper(`${geolocations}/public`, {
    headers: { "Content-Type": "application/json" },
  });

export async function buscarGeoPublico(): Promise<PublicGeolocation[]> {
  const res = await pedirGeoPublico();
  if (res.status !== 200) {
    throw new Error("Não foi possível carregar os cursinhos");
  }
  return await res.json();
}

/**
 * Para o mapa da home, com o comportamento de sempre: status ≠ 200 → lista
 * vazia (o mapa segue sem pins); erro de rede propaga (a home mostra toast).
 */
export async function getGeolocation(): Promise<PublicGeolocation[]> {
  const res = await pedirGeoPublico();
  if (res.status !== 200) return [];
  return await res.json();
}

export default getGeolocation;
