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
  /** `system`, o id do cursinho ou `Cursinho` (compartilhada — tickets/038). */
  dono?: string;
}

/**
 * tickets/038: "Enem Dia 1/2" seedadas pela plataforma e compartilhadas com
 * todos os cursinhos. O cursinho cria prova nelas (nome digitado, PDF
 * opcional), mas não as exclui nem troca a categoria de uma prova delas.
 */
export const DONO_CURSINHO = "Cursinho";

export const isCompartilhada = (c?: Pick<ICategoria, "dono"> | null) =>
  c?.dono === DONO_CURSINHO;
