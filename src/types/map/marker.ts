import type { Geolocation } from "../geolocation/geolocation";

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

export interface Marker extends MarkerPoint {
  infos: Geolocation;
}
