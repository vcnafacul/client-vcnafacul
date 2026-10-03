import type { PeriodoDoIndicador } from "@/services/indicadores";

/** O período em andamento; sem nenhum aberto, o mais recente (R1). */
export function periodoInicial(periodos: PeriodoDoIndicador[]) {
  return periodos.find((p) => p.emAndamento) ?? periodos[0] ?? null;
}

/** "2026 — 1º semestre" — o ano só entra se o nome ainda não o tiver. */
export function rotuloDoPeriodo(p: PeriodoDoIndicador) {
  return p.nome.includes(String(p.ano)) ? p.nome : `${p.ano} — ${p.nome}`;
}

const doisDigitos = (n: number) => String(n).padStart(2, "0");

/**
 * "Atualizado às 14h20" no período em andamento; "Fechado em 30/06/2026" no
 * encerrado, cujos números não mudam mais.
 */
export function rotuloDaAtualizacao(
  periodo: PeriodoDoIndicador,
  atualizadoEm: string,
) {
  if (!periodo.emAndamento) {
    const fim = new Date(periodo.fim);
    return `Fechado em ${doisDigitos(fim.getUTCDate())}/${doisDigitos(
      fim.getUTCMonth() + 1,
    )}/${fim.getUTCFullYear()}`;
  }
  const d = new Date(atualizadoEm);
  return `Atualizado às ${d.getHours()}h${doisDigitos(d.getMinutes())}`;
}
