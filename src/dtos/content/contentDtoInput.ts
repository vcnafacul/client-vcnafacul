import { DateTime } from "luxon";
import { StatusContent } from "../../enums/content/statusContent";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Materias } from "../../enums/content/materias";

export interface ContentDtoInput {
    id: string;
    filename?: string;
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
}

export interface FrenteDto {
    id: string;
    name: string;
    materia: Materias
}

export interface ContentDtoInputOrder extends ContentDtoInput {
    next: string;
}