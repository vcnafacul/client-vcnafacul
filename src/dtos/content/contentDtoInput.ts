import { DateTime } from "luxon";
import { StatusContent } from "../../enums/content/statusContent";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Materias } from "../../enums/content/materias";

export interface ContentDtoInput {
    id: number;
    filename?: string;
    status: StatusContent | StatusEnum;
    title: string;
    description: string;
    subject: SubjectDto;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface SubjectDto {
    id: number;
    name: string;
    description: string;
    frente: FrenteDto
}

export interface FrenteDto {
    id: number;
    name: string;
    materia: Materias
}