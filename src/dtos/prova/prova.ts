import { DateTime } from "luxon";
import { Edicao } from "../../enums/prova/edicao";

export interface Prova {
  _id: string;
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  nome: string;
  totalQuestao: number;
  totalQuestaoCadastradas: number;
  totalQuestaoValidadas: number;
  createdAt: DateTime;
  filename: string;
  gabarito: string;
  enemAreas: string[];
}

export interface CreateProva {
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  categoria: string;
  filename: string;
}
