
export interface CreateQuestion {
    prova: string
    enemArea: string
    frente1: string
    frente2?: string
    frente3?: string
    materia: string
    numero: number
    textoQuestao: string
    textoAlternativaA?: string
    textoAlternativaB?: string
    textoAlternativaC?: string
    textoAlternativaD?: string
    textoAlternativaE?: string
    alternativa: string
    imageId?: string
    classificationExam?: boolean;
    classificationDisciplineFront?: boolean;
    textOrAlternatives?: boolean;
    image?: boolean;
    rightAnswer?: boolean;
}
export interface UpdateQuestion extends CreateQuestion {
    _id: string
}
