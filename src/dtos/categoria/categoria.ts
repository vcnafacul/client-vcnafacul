export interface IExameRef {
  _id: string;
  nome: string;
}

export interface ICategoria {
  _id: string;
  nome: string;
  duracao: number;
  quantidadeTotalQuestao: number | null;
  exame: IExameRef;
  custom: boolean;
  selecionavel: boolean;
  descricao: string;
  simuladosCount: number;
  provasCount: number;
}
