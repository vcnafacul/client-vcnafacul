import { StatusEnum } from "../../types/generic/statusEnum";
import { DateTime } from "luxon"

export interface ObjDefault {
    _id: string;
    nome: string;
}

export interface QuestionDto {
    _id: string
    exame: ObjDefault
    ano: number
    caderno: string
    enemArea: string
    frente1: ObjDefault
    frente2: ObjDefault
    frente3: ObjDefault
    materia: ObjDefault
    numero: number
    textoQuestao: string
    textoAlternativaA: string
    textoAlternativaB: string
    textoAlternativaC: string
    textoAlternativaD: string
    textoAlternativaE: string
    alternativa: string
    imageId: string
    acertos: number
    edicao: string
    quantidadeSimulado: number
    quantidadeResposta: number
    status: StatusEnum
    updateAt?: DateTime
}

export interface Question extends QuestionDto {
    title: string;
}