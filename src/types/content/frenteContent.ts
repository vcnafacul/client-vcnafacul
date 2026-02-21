export interface Subject {
    id: string;
    name: string;
    description: string;
}

export interface Frente {
    _id?: string;
    id: string;
    nome: string;
    materia: string,
    subjects: Subject[]
}
