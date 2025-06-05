import { DateTime } from "luxon";
import { StatusEnum } from "../../enums/generic/statusEnum";

export interface ObjDefault {
  _id: string;
  nome: string;
}

export interface FrenteObjDefault extends ObjDefault {
  materia: string;
}

export interface MateriaObjDefault extends ObjDefault {
  enemArea: string;
}

export interface QuestionDto {
  _id: string;
  prova: string;
  enemArea: string;
  frente1: string;
  frente2: string;
  frente3: string;
  materia: string;
  numero: number;
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
  updatedAt?: DateTime;
  provaClassification: boolean;
  subjectClassification: boolean;
  textClassification: boolean;
  imageClassfication: boolean;
  alternativeClassfication: boolean;
  reported: boolean;
}

export interface Question extends QuestionDto {
  title: string;
}
