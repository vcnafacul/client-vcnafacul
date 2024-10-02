import { StatusEnum } from "@/enums/generic/statusEnum";

export interface Inscription {
    _id: string;
        name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    actived: StatusEnum;
    createdAt: Date;
    updatedAt: Date;
}