import { DateTime } from "luxon";
import { ICategoria } from "../categoria/categoria";
import { Edicao } from "../../enums/prova/edicao";

export interface SimuladoResumo {
  _id: string;
  nome: string;
  categoria: ICategoria;
  questoes: { _id: string }[];
  bloqueado: boolean;
  aproveitamento?: number;
  vezesRespondido?: number;
}

export interface Prova {
  _id: string;
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  categoria: string;
  exame: string;
  nome: string;
  totalQuestao: number;
  totalQuestaoCadastradas: number;
  totalQuestaoValidadas: number;
  createdAt: DateTime;
  filename: string;
  gabarito: string;
  enemAreas: string[];
  simulados?: SimuladoResumo[];
}

export interface CreateProva {
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  categoria: string;
  filename: string;
}
