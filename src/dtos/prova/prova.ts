import { DateTime } from "luxon";
import { ICategoria } from "../categoria/categoria";
import { Edicao } from "../../enums/prova/edicao";
import { IQuestaoNaContainer } from "../simulado/simuladoDto";

export interface SimuladoResumo {
  _id: string;
  nome: string;
  categoria: ICategoria;
  questoes: IQuestaoNaContainer[];
  bloqueado: boolean;
  aproveitamento?: number;
  vezesRespondido?: number;
  disponivelDe?: string | null; // ISO 8601 (UTC)
  disponivelAte?: string | null;
}

/**
 * A prova como a **listagem** devolve.
 *
 * ⚠️ **`categoria` e `exame` são STRINGS aqui, não objetos.** O ms-simulado
 * achata os dois no DTO da lista (`toProvaDTO`: `categoria: prova.categoria.nome`,
 * `exame: prova.categoria.exame.nome`) e a api repassa sem tocar. Este arquivo
 * declarava `categoria: ICategoria`, então `prova.categoria?.nome` compilava,
 * devolvia `undefined` em runtime e a coluna Categoria mostrava "—" para todas
 * as provas — sem erro nenhum no console.
 *
 * ⚠️ Quem precisa do objeto (com `exame`, `quantidadeTotalQuestao`, etc.) usa
 * `ProvaDetalhada`, que é o que `getProvaById` devolve. **Os dois endpoints têm
 * formatos diferentes**, e foi o tipo único cobrindo os dois que escondeu o
 * defeito.
 */
export interface Prova {
  _id: string;
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  /** Nome da categoria, já achatado pelo backend. */
  categoria: string;
  /** Nome do exame da categoria, idem. */
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

/**
 * A prova como `GET /prova/:id` devolve: o documento populado do Mongo, com
 * `categoria` como objeto.
 *
 * ⚠️ Não é `Prova` com um campo a mais — é `Prova` com `categoria` de **outro
 * tipo**. Daí o `Omit`.
 */
export type ProvaDetalhada = Omit<Prova, "categoria" | "exame"> & {
  categoria: ICategoria;
};

export interface CreateProva {
  edicao: Edicao;
  aplicacao: number;
  ano: number;
  categoria: string;
  filename: string;
}
