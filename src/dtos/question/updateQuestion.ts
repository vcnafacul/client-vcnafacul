import { Question } from "./QuestionDTO"

export interface UpdateQuestion {
    _id: string
    exame: string
    ano: number
    caderno: string
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
    edicao: string
}


export const ConverteQuestiontoUpdateQuestion = (question: Question) : UpdateQuestion => {
    const update : UpdateQuestion = {
        _id: question._id,
        exame: question.exame,
        ano: question.ano,
        caderno: question.caderno,
        enemArea: question.enemArea,
        frente1: question.frente1,
        materia: question.materia,
        numero: question.numero,
        textoQuestao: question.textoQuestao,
        textoAlternativaA: question.textoAlternativaA,
        textoAlternativaB: question.textoAlternativaB,
        textoAlternativaC: question.textoAlternativaC,
        textoAlternativaD: question.textoAlternativaD,
        textoAlternativaE: question.textoAlternativaE,
        alternativa: question.alternativa,
        imageId: question.imageId,
        edicao: question.edicao,
    }
    if(question.frente2){
        update['frente2'] = question.frente2
    }

    if(question.frente3){
        update['frente2'] = question.frente2
    }

    return update
}