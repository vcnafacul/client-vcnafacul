import {
  dentroDoIntervalo,
  intervaloAtivo,
  type IntervaloDeDatas,
} from "@/components/dashV2";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { statusDoProcesso } from "./status";

/** Os filtros da tela (card 05 da série `tickets/021-dash-v2-processo-seletivo`). */
export interface FiltrosDoProcesso {
  nome: string;
  status: StatusEnum;
  iniciaEm: IntervaloDeDatas;
  criadoEm: IntervaloDeDatas;
}

export const SEM_FILTROS: FiltrosDoProcesso = {
  nome: "",
  status: StatusEnum.All,
  iniciaEm: {},
  criadoEm: {},
};

/**
 * ⚠️ Sem o `normalize("NFD")`, "inscricao" não acha "Inscrição" — e quem busca
 * raramente digita o acento. A faixa é a dos diacríticos combinantes, que é o
 * que o NFD separa das letras (mesma regra do relatório de simulado).
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Os quatro filtros combinam por E. */
export function filtrarProcessos(
  processos: Inscription[],
  filtros: FiltrosDoProcesso,
  agora: Date = new Date(),
): Inscription[] {
  const termo = normalizar(filtros.nome);
  return processos.filter(
    (p) =>
      (!termo || normalizar(p.name ?? "").includes(termo)) &&
      (filtros.status === StatusEnum.All ||
        statusDoProcesso(p, agora) === filtros.status) &&
      dentroDoIntervalo(p.startDate, filtros.iniciaEm) &&
      dentroDoIntervalo(p.createdAt, filtros.criadoEm),
  );
}

/**
 * Quantos filtros estão ligados — o "Limpar filtros (n)". Um intervalo conta
 * 1, com um lado ou com os dois.
 *
 * ⚠️ Também é o que o `DashListTemplate` observa para voltar à página 1 quando
 * um filtro que ele não renderiza (os de data, no `filters`) muda.
 */
export function contarFiltrosAtivos(filtros: FiltrosDoProcesso): number {
  return [
    normalizar(filtros.nome) !== "",
    filtros.status !== StatusEnum.All,
    intervaloAtivo(filtros.iniciaEm),
    intervaloAtivo(filtros.criadoEm),
  ].filter(Boolean).length;
}
