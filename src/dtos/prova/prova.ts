import { DateTime } from "luxon";
import { ICategoria } from "../categoria/categoria";
import { Edicao } from "../../enums/prova/edicao";
import { IQuestaoNaContainer } from "../simulado/simuladoDto";

export interface SimuladoResumo {
  _id: string;
  nome: string;
  categoria: ICategoria;
  questoes: { _id: string }[];
  questoesNovo?: IQuestaoNaContainer[];
  bloqueado: boolean;
  aproveitamento?: number;
  vezesRespondido?: number;
  disponivelDe?: string | null; // ISO 8601 (UTC)
  disponivelAte?: string | null;
}

export interface Prova {
  _id: string;
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  categoria: ICategoria;
  nome: string;
  totalQuestao: number;
  totalQuestaoCadastradas: number;
  totalQuestaoValidadas: number;
  createdAt: DateTime;
  filename: string;
  gabarito: string;
  enemAreas: string[];
  simulados?: SimuladoResumo[];
  questoesNovo?: IQuestaoNaContainer[];
}

export interface CreateProva {
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  categoria: string;
  filename: string;
}
