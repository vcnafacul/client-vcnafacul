import { StatusEnum } from "../generic/statusEnum";

export interface ValidationGeolocation {
    geoId: number;
    status: StatusEnum;
    refuseReason?: string;
}