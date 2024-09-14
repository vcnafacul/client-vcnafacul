import { Materias } from "../../enums/content/materias";

export interface Subject {
    id: string;
    name: string;
    description: string;
}

export interface Frente {
    id: string;
    name: string;
    materia: Materias,
    subject: Subject[]
}