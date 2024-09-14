export interface CreateSubjectDtoOutput {
    frente: string;
    name: string;
    description: string;
}

export interface CreateSubjectDtoInput extends CreateSubjectDtoOutput {
    id: string;
}

export interface UpdateSubjectDtoOutput {
    id: string;
    name: string;
    description: string;
}