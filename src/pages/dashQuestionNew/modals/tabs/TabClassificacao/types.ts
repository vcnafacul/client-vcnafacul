import { DonoDaProva } from "@/dtos/prova/donoDaProva";
import { Question } from "@/dtos/question/questionDTO";

/**
 * Tipos e interfaces para a Tab de Classificação
 */

/**
 * Props do componente TabClassificacao
 */
export interface TabClassificacaoProps {
  question: Question;
  canEdit?: boolean;
  infos?: ClassificacaoInfos;
  onSaveSuccess?: () => void;
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

/** Com dono e `podeComporProva` do ms (tickets/023, card 07). */
export interface ProvaOption extends DonoDaProva {
  _id: string;
  nome: string;
  filename?: string;
  gabarito?: string;
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
