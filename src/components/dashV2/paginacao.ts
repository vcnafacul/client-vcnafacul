/**
 * Aritmética de paginação da Dash V2.
 *
 * ⚠️ Mora fora do `DashListFooter` pelo mesmo motivo que o `sortRows` mora fora
 * do `DashTable`: quem calcula o intervalo é o rodapé, mas quem precisa saber
 * quantas páginas existem — para não deixar o usuário numa página que sumiu — é
 * o template. Duas cópias da mesma conta é como as duas peças começariam a
 * discordar sobre onde termina a última página.
 */

/**
 * O intervalo exibido no rodapé, em base 1 e **limitado pelo total**.
 *
 * ⚠️ Os dois `Math.min` são o requisito, não paranoia. `pagina * pageSize` na
 * última página anuncia registros que não existem — "Mostrando 126–150 de 128"
 * — e é o erro que se escreve sozinho, porque funciona em todas as páginas
 * menos na última. Há teste para a última página.
 */
export function intervaloDaPagina(
  pagina: number,
  pageSize: number,
  total: number,
): { inicio: number; fim: number } {
  const fim = Math.min(pagina * pageSize, total);
  // O `min` no início cobre a página vazia além do fim: sem ele o rodapé de uma
  // página que deixou de existir mostraria "151–128".
  const inicio = Math.min((pagina - 1) * pageSize + 1, total);
  return { inicio, fim };
}

/**
 * ⚠️ **Nunca zero.** Sem registro nenhum ainda existe a página 1 — devolver 0
 * faria o template fixar a página corrente em 0 e o intervalo virar "0–0".
 */
export function totalDePaginas(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** "12 registros", ou "3 de 12 registros" quando há filtro e total conhecido. */
export function subtituloDaContagem(visiveis: number, total?: number): string {
  const conta = total !== undefined ? total : visiveis;
  const palavra = conta === 1 ? "registro" : "registros";
  return total !== undefined && total !== visiveis
    ? `${visiveis} de ${total} ${palavra}`
    : `${visiveis} ${palavra}`;
}
