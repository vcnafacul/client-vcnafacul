export interface CreateSubjectDtoInput {
    frente: string;
    name: string;
    description: string;
}

export interface CreateSubjectDtoOutput extends CreateSubjectDtoInput {
    id: string;
}

export interface UpdateSubjectDto {
    id: string;
    name: string;
    description: string;
}