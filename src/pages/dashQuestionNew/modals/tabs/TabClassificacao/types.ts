import { Question } from "@/dtos/question/questionDTO";

/**
 * Tipos e interfaces para a Tab de Classificação
 */

/**
 * Dados do formulário de classificação
 */
export interface ClassificacaoFormData {
  prova: string;
  numero: number;
  enemArea: string;
  materia: string;
  frente1: string;
  frente2?: string;
  frente3?: string;
  provaClassification: boolean;
  subjectClassification: boolean;
  reported: boolean;
}

/**
 * Props do componente TabClassificacao
 */
export interface TabClassificacaoProps {
  question: Question;
  canEdit?: boolean;
  infos?: ClassificacaoInfos;
}

/**
 * Informações necessárias para os dropdowns
 */
export interface ClassificacaoInfos {
  provas: ProvaOption[];
  enemAreas: string[];
  materias: MateriaOption[];
  frentes: FrenteOption[];
}

export interface ProvaOption {
  _id: string;
  nome: string;
  filename?: string;
  enemAreas?: string[];
}

export interface MateriaOption {
  _id: string;
  nome: string;
  enemArea: string;
  frentes: FrenteOption[];
}

export interface FrenteOption {
  _id: string;
  nome: string;
  materia?: string;
}
