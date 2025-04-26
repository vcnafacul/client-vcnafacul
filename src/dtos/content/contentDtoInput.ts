import { DateTime } from "luxon";
import { Materias } from "../../enums/content/materias";
import { StatusContent } from "../../enums/content/statusContent";
import { StatusEnum } from "../../enums/generic/statusEnum";

export interface ContentDtoInput {
    id: string;
    file?: {
        id: string;
        originalName: string;
    };
    status: StatusContent | StatusEnum;
    title: string;
    description: string;
    subject: SubjectDto;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface SubjectDto {
    id: string;
    name: string;
    lenght: number;
    description: string;
    frente: FrenteDto
    createdAt: Date;
    contents: {
            id: string;
            status: StatusContent | StatusEnum;
            title: string;
        }[]
    
}

export interface FrenteDto {
    id: string;
    name: string;
    materia: Materias,
    lenght: number
    createdAt: Date;
    subjects: {
        id: string;
        name: string;
    }[]
}

export interface ContentDtoInputOrder extends ContentDtoInput {
    next: string;
}