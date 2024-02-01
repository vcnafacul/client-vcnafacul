export interface CreateSubjectDtoOutput {
    frente: number;
    name: string;
    description: string;
}

export interface CreateSubjectDtoInput extends CreateSubjectDtoOutput {
    id: number;
}

export interface UpdateSubjectDtoOutput {
    id: number;
    name: string;
    description: string;
}