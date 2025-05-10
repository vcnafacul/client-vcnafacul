import { StatusEnum } from "@/enums/generic/statusEnum";

export interface Inscription {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    openingsCount: number;
    subscribersCount: number;
    actived: StatusEnum;
    createdAt: Date;
    updatedAt: Date;
    partnerPrepCourseId: string;
    partnerPrepCourseName: string;
    requestDocuments: boolean;
}