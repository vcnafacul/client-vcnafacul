import { Materias } from "../../enums/content/materias";

export interface CreateFrenteDtoOutput {
    name: string;
    materia: Materias
}

export interface CreateFrenteDtoInput extends CreateFrenteDtoOutput {
    id: number;
}

export interface UpdateFrenteDtoOutut {
    id: number;
    name: string;
}