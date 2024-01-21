
export interface CreateQuestion {
    _id: string
    exame: string
    enemArea: string
    frente1: string
    frente2?: string
    frente3?: string
    materia: string
    numero: number
    textoQuestao: string
    textoAlternativaA: string
    textoAlternativaB: string
    textoAlternativaC: string
    textoAlternativaD: string
    textoAlternativaE: string
    alternativa: string
    imageId: string
}
export interface UpdateQuestion extends CreateQuestion {
    _id: string
}
