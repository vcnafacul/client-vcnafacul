import { StatusEnum } from "../../enums/generic/statusEnum";

export interface ValidationGeolocation {
    geoId: string;
    status: StatusEnum;
    refuseReason?: string;
}