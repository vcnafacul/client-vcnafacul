import { DateTime } from "luxon";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { Prova } from "../prova/prova";

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

export interface QuestionBase {
  _id: string;
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

export interface QuestionDto extends QuestionBase {
  prova: Prova;
}

export interface Question extends QuestionBase {
  title: string;
  prova: string;
}
