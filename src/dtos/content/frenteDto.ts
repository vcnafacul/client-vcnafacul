import { Materias } from "../../enums/content/materias";

export interface CreateFrenteDtoOutput {
    name: string;
    materia: Materias
}

export interface CreateFrenteDtoInput extends CreateFrenteDtoOutput {
    id: string;
}

export interface UpdateFrenteDtoOutut {
    id: string;
    name: string;
}