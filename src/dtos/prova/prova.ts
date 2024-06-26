import { DateTime } from "luxon";
import { Edicao } from "../../enums/prova/edicao";

export interface Prova {
  _id: string;
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  exame: string;
  nome: string;
  totalQuestao: number;
  totalQuestaoCadastradas: number;
  totalQuestaoValidadas: number;
  createdAt: DateTime;
  filename: string;
  enemAreas: string[];
}

export interface CreateProva {
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  exame: string;
  filename: string;
  tipo: string;
}
