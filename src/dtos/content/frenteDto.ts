export interface CreateFrenteDtoInput {
    name: string;
    materia: string;
}

export interface CreateFrenteDtoOutput {
    _id: string;
    id: string;
    nome: string;
    materia: string;
}

export interface UpdateFrenteDto {
    id: string;
    name: string;
}
