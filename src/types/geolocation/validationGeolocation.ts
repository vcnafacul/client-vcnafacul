import { StatusEnum } from "../../enums/generic/statusEnum";

export interface ValidationGeolocation {
    geoId: string;
    status: StatusEnum;
    /** Obrigatório ao rejeitar (`MotivoRejeicaoGeo`). */
    motivo?: string;
    /** Complemento do motivo; obrigatório no "Outro". */
    refuseReason?: string;
}