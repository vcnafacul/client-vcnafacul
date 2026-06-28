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
  numero: number
  imageId: string
}

export interface ISimuladoDTO {
  _id: string
  nome: string
  descricao: string
  categoria: ICategoria
  questoes: IQuestao[]
  inicio: Date,
  duracao: number,
  createdAt: DateTime,
  updatedAt: DateTime,
  bloqueado: boolean,
}
