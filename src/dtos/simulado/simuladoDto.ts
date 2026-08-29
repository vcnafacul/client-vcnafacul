import { DateTime } from "luxon";
import { ICategoria } from "../categoria/categoria";

export interface Obj {
    _id: string;
    nome: string;
}

export interface IQuestao {
  _id: string
  exame: string,
  ano: number
  caderno: string
  enemArea: string
  frente1: Obj
  frente2?: Obj
  frente3?: Obj
  materia: Obj
  imageId: string
}

// Shape do vínculo prova↔questão (número no relacionamento). Usado no contexto
// admin/banco de questões (ex.: SimuladoResumo). NÃO é o shape do fluxo do aluno.
export interface IQuestaoNaContainer {
  questao: IQuestao;
  numero: number | null;
}

export interface ISimuladoDTO {
  _id: string
  nome: string
  descricao: string
  categoria: ICategoria
  // Fluxo do aluno (endpoint /toAnswer): o ms ACHATA cada vínculo em IQuestao
  // (com numero inline no payload, que o client re-indexa por posição). Por isso
  // é IQuestao[] aqui, e não IQuestaoNaContainer[] — este último é do banco/admin.
  questoes: IQuestao[]
  inicio: Date,
  duracao: number,
  createdAt: DateTime,
  updatedAt: DateTime,
  bloqueado: boolean,
}
