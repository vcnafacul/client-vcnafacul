import { Materias } from "../../enums/content/materias";

export interface Subject {
    id: number;
    name: string;
    description: string;
}

export interface Frente {
    id: number;
    name: string;
    materia: Materias,
    subject: Subject[]
}