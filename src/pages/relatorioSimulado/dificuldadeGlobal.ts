import type { QuestaoDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { percentual } from "./percentuais";

/**
 * Quantas respostas a base precisa ter para a dificuldade global valer alguma
 * coisa.
 *
 * ⚠️ **30, e não os 10 do `MINIMO_PARA_DISCRIMINAR`.** A discriminação mede uma
 * correlação dentro de uma turma; esta coluna existe para a turma se COMPARAR
 * com a base. Comparar 22% de 30 alunos com 24% de 12 respostas não responde
 * nada — com `n = 30` e `p = 0,5` o erro-padrão de uma proporção ainda é ~9
 * p.p., o que já diz que 30 é um piso e não um conforto.
 *
 * ⚠️ É por isso que **a base aparece sempre ao lado do número**: é ela que
 * permite calibrar, e nenhum limiar substitui ver "de 1.847" contra "de 34".
 */
export const MINIMO_PARA_DIFICULDADE_GLOBAL = 30;

/**
 * O percentual de acerto da BASE INTEIRA, ou `null` quando não há base para
 * afirmar.
 *
 * ⚠️ **`null` em três casos, e nenhum deles é "0%".** Api anterior ao card 16
 * (campos ausentes), base abaixo do mínimo, e base zero. Zero por cento diria
 * "ninguém no país acertou", que é uma afirmação — e provavelmente falsa.
 *
 * ⚠️ **A contagem é DA QUESTÃO, e não da linhagem — decisão do card 29.**
 *
 * A pergunta era se "24% de acerto" descreve esta entidade ou a família toda. O
 * card 27 respondeu sem querer: **"correção" edita in-place e NÃO cria versão**
 * — só "nova versão" cria, e ela significa por definição que *o conteúdo mudou
 * de verdade*. Logo toda versão nasce de uma mudança substantiva, e somar a
 * linhagem somaria sempre textos diferentes.
 *
 * ⚠️ **E o custo dessa decisão é a coluna ENCOLHER com o uso:** uma questão com
 * 1.847 respostas vira duas de ~900 na primeira versão, e a cada versão a base
 * se aproxima do piso abaixo do qual nada é exibido. **Isto não é defeito** — é
 * a consequência aceita de não somar textos diferentes. O `textoDaDificuldadeGlobal`
 * marca a versão justamente para a pessoa saber por quê.
 *
 * ⚠️ **Estes números só são confiáveis depois do card 21 (escrita no ms) E da
 * execução do sync do card 22.** Antes disso `baseGeral` contava APRESENTAÇÕES
 * em vez de respostas e o reprocessamento contava duas vezes — medido: 0 de 181
 * questões batiam com o histórico. Um número global visivelmente errado destrói
 * a confiança nas outras colunas da mesma tabela, que estão certas.
 */
export function acertoGlobal(q: QuestaoDoRelatorio): number | null {
  if (typeof q.acertosGeral !== "number") return null;
  if (typeof q.baseGeral !== "number") return null;
  if (q.baseGeral < MINIMO_PARA_DIFICULDADE_GLOBAL) return null;
  return percentual(q.acertosGeral, q.baseGeral);
}

/**
 * "24% de 1.847", ou travessão.
 *
 * ⚠️ **A base entra no texto, e não num tooltip.** O card é explícito: a coluna
 * do recorte e a global ficam lado a lado com números diferentes, e precisam se
 * explicar sozinhas. Uma pessoa que vê "22%" e "24%" sem saber que o segundo é
 * de 1.847 respostas não tem como saber qual dos dois pesa mais.
 *
 * ⚠️ Separador de milhar em pt-BR, porque "1847" se lê mal ao lado de um
 * percentual de dois dígitos.
 *
 * ⚠️ **Questão que é versão leva um "· nova" atrás** (card 29). Sem isso, a
 * base pequena de uma versão recém-criada se lê como "questão raramente usada",
 * que é uma conclusão errada sobre o mesmo número — e a contagem NÃO soma a
 * linhagem, por decisão.
 */
export function textoDaDificuldadeGlobal(q: QuestaoDoRelatorio): string | null {
  const pct = acertoGlobal(q);
  if (pct === null) return null;
  const base = `${pct}% de ${(q.baseGeral as number).toLocaleString("pt-BR")}`;
  return q.ehVersao ? `${base} · nova` : base;
}

/**
 * Por que a dificuldade global não aparece nesta questão.
 *
 * ⚠️ **Existe porque "sem dado" e "dado novo" pedem reações opostas.** Uma
 * questão nunca usada fora deste recorte e uma versão criada semana passada
 * mostram o mesmo travessão — e a segunda vai ter base amanhã.
 *
 * `null` quando o número está lá: não há o que explicar.
 */
export function motivoDaAusencia(q: QuestaoDoRelatorio): string | null {
  if (acertoGlobal(q) !== null) return null;
  if (q.ehVersao) {
    return `Versão nova desta questão: ainda não há ${MINIMO_PARA_DIFICULDADE_GLOBAL} respostas fora deste recorte. O histórico anterior ficou com a versão anterior.`;
  }
  return null;
}

/**
 * Se ALGUMA questão da lista tem base suficiente — o gate da coluna inteira.
 *
 * ⚠️ **A coluna some quando nenhuma tem**, em vez de virar uma coluna de
 * travessões. Numa tabela cuja folga de largura é medida a cada card, uma
 * coluna que não diz nada custa 9rem e ainda sugere que o dado deveria estar
 * ali. É o mesmo raciocínio do `materiasVisiveis` (card 07).
 */
export function temDificuldadeGlobal(questoes: QuestaoDoRelatorio[]): boolean {
  return questoes.some((q) => acertoGlobal(q) !== null);
}
