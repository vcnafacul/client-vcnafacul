import { StatusEnum } from "../../enums/generic/statusEnum";

export interface ValidationGeolocation {
    geoId: number;
    status: StatusEnum;
    refuseReason?: string;
}