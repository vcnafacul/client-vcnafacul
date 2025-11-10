import { StatusEnum } from "@/enums/generic/statusEnum";
import { Edicao } from "@/enums/prova/edicao";

export interface QuestionCardBase {
  _id: string;
  prova: string;
  enemArea: string;
  materia: string;
  numero: number;
  updatedAt: Date;
  status: StatusEnum;
}

export interface QuestionBaseV2 {
  _id: string;
  prova: {
    _id: string;
    edicao: Edicao;
    aplicacao: number;
    ano: number;
    nome: string;
    filename: string;
  };
  enemArea: string;
  numero: number;
  frente1: {
    _id: string;
    nome: string;
  };
  frente2: {
    _id: string;
    nome: string;
  };
  frente3: {
    _id: string;
    nome: string;
  };
  materia: {
    _id: string;
    nome: string;
  };
  textoQuestao: string;
  pergunta: string;
  textoAlternativaA: string;
  textoAlternativaB: string;
  textoAlternativaC: string;
  textoAlternativaD: string;
  textoAlternativaE: string;
  alternativa: string;
  imageId: string;
  acertos: number;
  quantidadeSimulado: number;
  quantidadeResposta: number;
  status: StatusEnum;
  updatedAt?: Date;
  provaClassification: boolean;
  subjectClassification: boolean;
  textClassification: boolean;
  imageClassfication: boolean;
  alternativeClassfication: boolean;
  reported: boolean;
}
