import { Obj } from "./simuladoDto"

export interface IRegra {
    materia: Obj;
    quantidade: number;
    frente: Obj;
    ano: number;
    caderno: string;
  }
  
  export interface ITipoSimulado {
    _id: string;
    nome: string;
    duracao: number;
    quantidadeTotalQuestao: number;
    regras: IRegra[];
  }