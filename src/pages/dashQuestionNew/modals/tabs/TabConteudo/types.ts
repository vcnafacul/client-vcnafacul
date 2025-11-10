/**
 * Tipos e interfaces para a Tab de Conteúdo
 */

import { Question } from "@/dtos/question/questionDTO";

/**
 * Dados do formulário de conteúdo
 */
export interface ConteudoFormData {
  textoQuestao: string;
  pergunta?: string;
  textoAlternativaA: string;
  textoAlternativaB: string;
  textoAlternativaC: string;
  textoAlternativaD: string;
  textoAlternativaE: string;
  alternativa: string;
  textClassification: boolean;
  alternativeClassfication: boolean;
}

/**
 * Props do componente TabConteudo
 */
export interface TabConteudoProps {
  question: Question;
  canEdit?: boolean;
}

/**
 * Opções de alternativas
 */
export type AlternativaLetra = "A" | "B" | "C" | "D" | "E";

/**
 * Interface para uma alternativa
 */
export interface Alternativa {
  letra: AlternativaLetra;
  texto: string;
  isCorreta: boolean;
}
