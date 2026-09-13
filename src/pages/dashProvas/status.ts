import type { StatusV2 } from "@/components/dashV2";
import type { Prova } from "../../dtos/prova/prova";

/**
 * O status de uma prova, honesto.
 *
 * ## O que estava errado
 *
 * O card do V1 deriva o status assim:
 *
 * ```ts
 * total === validadas   ? StatusEnum.Approved
 * : total === cadastradas ? StatusEnum.Pending
 * : StatusEnum.Rejected;   // ← triângulo vermelho de "recusada"
 * ```
 *
 * Uma prova que está simplesmente **em cadastro** — o estado mais comum de
 * todos, o de uma prova que acabou de entrar — recebe o vermelho de recusada.
 * Ninguém recusou nada; ela só não terminou. E quando metade da lista está
 * vermelha, o vermelho para de querer dizer alguma coisa no produto inteiro.
 *
 * ⚠️ **Nenhum estado desta tela é destrutivo, então nenhum é vermelho.** Não
 * existe `missing` aqui de propósito — é a única regra deste arquivo que não dá
 * para "otimizar" sem desfazer o ticket.
 *
 * ## A derivação
 *
 * | Condição                                | Rótulo         | `tone`    |
 * |-----------------------------------------|----------------|-----------|
 * | `totalQuestao === 0`                    | Sem questões   | `neutral` |
 * | `validadas >= total`                    | Completa       | `done`    |
 * | `cadastradas >= total`                  | Em validação   | `info`    |
 * | resto (`cadastradas < total`)           | Em cadastro    | `running` |
 *
 * ⚠️ A ordem importa: `totalQuestao === 0` vem **primeiro**. Sem isso, uma prova
 * criada antes do upload (0 de 0) satisfaz `validadas >= total` e aparece como
 * "Completa" — a interface mentindo com o rótulo mais tranquilizador que existe.
 *
 * ⚠️ `>=` e não `===`: o banco tem provas com contagem dessincronizada
 * (`cadastradas > total`, resquício de re-upload). Com `===` elas escorregam
 * para o `else` e viram "Em cadastro" — que é justamente o oposto do que são.
 */
export interface StatusDaProva {
  tone: StatusV2;
  label: string;
  /**
   * Chave de ordenação da coluna Status: do mais incompleto para o mais
   * completo, para que o `asc` (o primeiro clique) traga ao topo o que ainda
   * precisa de trabalho — que é o motivo de alguém ordenar por status.
   */
  ordem: number;
}

export const STATUS_SEM_QUESTOES: StatusDaProva = {
  tone: "neutral",
  label: "Sem questões",
  ordem: 0,
};

export const STATUS_EM_CADASTRO: StatusDaProva = {
  tone: "running",
  label: "Em cadastro",
  ordem: 1,
};

export const STATUS_EM_VALIDACAO: StatusDaProva = {
  /**
   * ⚠️ `info` (azul), e não `running`. Os dois estados intermediários saíam com
   * o mesmo chip laranja e eram indistinguíveis de relance — a cor não
   * separava nada e sobrava só o rótulo. Agora a progressão lê como
   * progressão: cinza (sem questões) → laranja (em cadastro) → azul (em
   * validação) → verde (completa).
   */
  tone: "info",
  label: "Em validação",
  ordem: 2,
};

export const STATUS_COMPLETA: StatusDaProva = {
  tone: "done",
  label: "Completa",
  ordem: 3,
};

type ContagensDaProva = Pick<
  Prova,
  "totalQuestao" | "totalQuestaoCadastradas" | "totalQuestaoValidadas"
>;

export function statusDaProva(prova: ContagensDaProva): StatusDaProva {
  const total = prova.totalQuestao ?? 0;
  if (total <= 0) return STATUS_SEM_QUESTOES;
  if ((prova.totalQuestaoValidadas ?? 0) >= total) return STATUS_COMPLETA;
  if ((prova.totalQuestaoCadastradas ?? 0) >= total) return STATUS_EM_VALIDACAO;
  return STATUS_EM_CADASTRO;
}
