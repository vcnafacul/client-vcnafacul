import { DateTime } from "luxon";

interface Obj {
    _id: string;
    nome: string;
}

export interface IRegra {
    materia: Obj
    quantidade: number
    frente: Obj
    ano: number 
    caderno: string
  }
  
  export interface ITipoSimulado {
    nome: string
    duracao: number
    quantidadeTotalQuestao: number
    regras: IRegra[]
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
    tipo: ITipoSimulado
    questoes: IQuestao[]
    inicio: Date,
    duracao: number,
    createdAt: DateTime,
    updatedAt: DateTime,
    bloqueado: boolean,
  }
