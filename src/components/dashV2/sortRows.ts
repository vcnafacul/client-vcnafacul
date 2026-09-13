import type { DashColumn, SortState, SortValue } from "./types";

/**
 * Normaliza para `Date` o que a API manda como string ISO.
 *
 * ⚠️ `Prova.createdAt` é tipado como `DateTime` (luxon) mas chega como string —
 * o `dashProvas` do V1 já faz `prova.createdAt.toString()` para formatar. Sem
 * esta normalização o `sortValue` devolve string e a coluna "Criada em" ordena
 * em ordem alfabética: `"2024-..."` antes de `"2025-..."` funciona por acaso no
 * ISO, mas qualquer outro formato (e o `toString()` de um `Date`) quebra.
 *
 * Devolve `null` para vazio e para data inválida — e `null` vai para o fim.
 */
export function dataOrdenavel(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * O próximo estado de ordenação ao clicar num cabeçalho.
 *
 * Ciclo: inativa → `asc` → `desc` → `asc` → … ⚠️ **Sem terceiro estado "sem
 * ordenação"**: voltar à ordem natural do servidor no meio do ciclo confunde
 * mais do que ajuda — o usuário clica esperando inverter e a lista pula para
 * uma terceira ordem que ele não pediu.
 *
 * Mora aqui, e não no `DashTable`, porque é regra de estado de ordenação — e
 * porque a tela que controla o `sort` por URL precisa da mesma regra.
 */
export function proximoSort(columnId: string, atual?: SortState): SortState {
  const ativa = atual?.columnId === columnId;
  return {
    columnId,
    direction: ativa && atual?.direction === "asc" ? "desc" : "asc",
  };
}

type ValorPresente = string | number | Date;

function comparar(a: ValorPresente, b: ValorPresente): number {
  // ⚠️ Data antes de tudo. Sem esta linha, dois `Date` caem no `localeCompare`
  // do `String(date)` e passam a ser ordenados por nome do dia da semana.
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  // ⚠️ `localeCompare` em pt-BR, e não `<` cru: por code point "Ática" (U+00C1)
  // vem depois de "Zebra".
  return String(a).localeCompare(String(b), "pt-BR", { sensitivity: "base" });
}

function vazio(v: SortValue): boolean {
  return v === null || v === undefined;
}

/**
 * Ordena **em memória** por uma coluna. Puro: devolve um array novo e não toca
 * no que recebeu.
 *
 * ⚠️ Mora fora do `DashTable` de propósito. A tabela é controlada — ela só
 * chama `onSortChange`; quem decide entre ordenar aqui ou pedir ordenado ao
 * servidor é a tela. Trocar um pelo outro não deve exigir tocar no componente.
 *
 * Regras que o resto do sistema depende:
 * - `null`/`undefined` **sempre no fim**, nas duas direções. Um registro sem
 *   valor não é "o menor", é "não tem" — e no `desc` ele reaparecer no topo faz
 *   a lista parecer ordenada por outra coisa.
 * - **Estável**: empate mantém a ordem original, também no `desc`.
 */
export function sortRows<T>(
  rows: readonly T[],
  columns: readonly DashColumn<T>[],
  sort?: SortState | null,
): T[] {
  const coluna = sort ? columns.find((c) => c.id === sort.columnId) : undefined;
  const valorDe = coluna?.sortValue;
  if (!sort || !valorDe) return [...rows];

  const sinal = sort.direction === "desc" ? -1 : 1;

  return rows
    .map((row, indice) => ({ row, indice, valor: valorDe(row) }))
    .sort((a, b) => {
      // ⚠️ O `sinal` **não** entra aqui: nulo no fim é nas duas direções.
      if (vazio(a.valor) && vazio(b.valor)) return a.indice - b.indice;
      if (vazio(a.valor)) return 1;
      if (vazio(b.valor)) return -1;

      const d = comparar(a.valor as ValorPresente, b.valor as ValorPresente);
      /**
       * ⚠️ E o `sinal` também **não** entra no desempate: estabilidade é a
       * ordem original preservada, não invertida junto com a direção. Escrever
       * `sinal * (d !== 0 ? d : a.indice - b.indice)` — que é o erro fácil —
       * embaralha os empatados só no `desc`, e há teste para isso.
       *
       * ⚠️ O `a.indice - b.indice` em si é cinto e suspensório: `Array#sort` já
       * é estável por spec, então removê-lo não muda o resultado hoje e nenhum
       * teste ficaria vermelho. Fica porque é a intenção escrita — e porque no
       * dia em que este comparador virar um `sort` de outro lugar, a garantia
       * não some junto.
       */
      return d !== 0 ? sinal * d : a.indice - b.indice;
    })
    .map((x) => x.row);
}
