import type { PublicGeolocation } from "../geolocation/publicGeolocation";

export enum TypeMarker {
  geo,
  univPublic,
}

export interface MarkerPoint {
  id: string;
  lat: number;
  lon: number;
  type: TypeMarker;
}

/** Pin dos mapas públicos (home e busca): só os campos do `GET /geo/public`. */
export interface Marker extends MarkerPoint {
  infos: PublicGeolocation;
}
