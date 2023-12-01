import { StatusEnum } from "./statusEnum";

export interface ValidationGeolocation {
    geoId: number;
    status: StatusEnum;
    refuseReason?: string;
}