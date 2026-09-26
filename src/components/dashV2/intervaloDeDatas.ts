/**
 * A regra dos filtros de intervalo de datas da Dash V2 (card 03 da série
 * `tickets/021-dash-v2-processo-seletivo`), separada do componente para ser
 * testada sozinha.
 */

/** Os valores dos dois `<input type="date">`: `yyyy-mm-dd`, os dois opcionais. */
export interface IntervaloDeDatas {
  de?: string;
  ate?: string;
}

/** Algum dos dois lados preenchido — é o que conta no "Limpar filtros (n)". */
export function intervaloAtivo(v: IntervaloDeDatas): boolean {
  return !!(v.de || v.ate);
}

/** "Até" antes de "de". Em `yyyy-mm-dd`, a ordem do texto é a ordem da data. */
export function intervaloInvalido(v: IntervaloDeDatas): boolean {
  return !!(v.de && v.ate && v.ate < v.de);
}

/**
 * ⚠️ **Nunca `new Date("2026-03-01")`**: a especificação lê data sem hora como
 * **UTC** — no Brasil vira 29/fev às 21h, e o filtro erra de dia. O dia é
 * montado pelas partes, no fuso de quem está usando.
 */
function diaLocal(yyyyMmDd: string, fimDoDia: boolean): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!partes) return null;
  const [, ano, mes, dia] = partes.map(Number);
  return fimDoDia
    ? new Date(ano, mes - 1, dia, 23, 59, 59, 999)
    : new Date(ano, mes - 1, dia, 0, 0, 0, 0);
}

/**
 * A data cai no intervalo, **pelo dia do calendário local**: `de` às 00:00 e
 * `até` às 23:59:59.999.
 *
 * - Sem `de` e sem `até`: tudo passa.
 * - Intervalo invertido: tudo passa — o componente avisa, e esconder a lista
 *   inteira por um erro de digitação seria pior.
 * - Data ausente ou inválida no registro: não passa, quando há filtro.
 *
 * Aceita `Date` ou string ISO — a api manda ISO em UTC, e um registro das
 * 23h no Brasil já é o dia seguinte em UTC. Por isso a comparação é entre
 * instantes, e não entre os textos.
 */
export function dentroDoIntervalo(
  data: Date | string | null | undefined,
  v: IntervaloDeDatas,
): boolean {
  if (!intervaloAtivo(v) || intervaloInvalido(v)) return true;
  if (data === null || data === undefined || data === "") return false;
  const instante = data instanceof Date ? data : new Date(data);
  if (Number.isNaN(instante.getTime())) return false;

  const inicio = v.de ? diaLocal(v.de, false) : null;
  const fim = v.ate ? diaLocal(v.ate, true) : null;
  if (inicio && instante < inicio) return false;
  if (fim && instante > fim) return false;
  return true;
}
