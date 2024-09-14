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
  infos: object;
}
