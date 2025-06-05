import { Materias } from "../../enums/content/materias";

export interface CreateFrenteDtoInput {
    name: string;
    materia: Materias
}

export interface CreateFrenteDtoOutput extends CreateFrenteDtoInput {
    id: string;
}

export interface UpdateFrenteDto {
    id: string;
    name: string;
}