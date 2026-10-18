import type { AnuladaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { rotuloDoMotivo } from "@/dtos/question/anulacao";

/** "A questão 45 foi anulada (sem alternativa correta)" / "As questões 3 e 45 foram anuladas". */
export function quaisForamAnuladas(anuladas: AnuladaDoRelatorio[]): string {
  if (anuladas.length === 0) return "Uma questão foi anulada";
  if (anuladas.length === 1) {
    const a = anuladas[0];
    return `A questão ${a.numero} foi anulada (${rotuloDoMotivo(a.motivo).toLowerCase()})`;
  }
  const nums = anuladas.map((a) => a.numero);
  const lista = `${nums.slice(0, -1).join(", ")} e ${nums[nums.length - 1]}`;
  return `As questões ${lista} foram anuladas`;
}

/** "A questão 45 voltou a valer" / "As questões 3 e 45 voltaram a valer" (card 20). */
export function quaisVoltaramAValer(numeros: number[]): string {
  if (numeros.length === 1) return `A questão ${numeros[0]} voltou a valer`;
  const lista = `${numeros.slice(0, -1).join(", ")} e ${numeros[numeros.length - 1]}`;
  return `As questões ${lista} voltaram a valer`;
}

/**
 * O aviso de relatório desatualizado (tickets/042, cards 15 e 20).
 *
 * ⚠️ `desanuladas` (card 20): o que os resultados gravados contaram como
 * anulado e agora vale. Sem isso, desanular e abrir o relatório dizia "Uma
 * questão foi anulada" sem nenhuma anulada.
 */
export function textoDaDivergencia(
  anuladas: AnuladaDoRelatorio[],
  divergentes: number,
  desanuladas: number[] = [],
): string {
  const n = `${divergentes} ${divergentes === 1 ? "resultado" : "resultados"}`;
  const calculados = `depois que ${n} ${divergentes === 1 ? "foi calculado" : "foram calculados"}`;
  const efeito = "médias, discriminação e comparação podem estar erradas.";
  if (desanuladas.length && !anuladas.length) {
    const uma = desanuladas.length === 1;
    return `${quaisVoltaramAValer(desanuladas)} ${calculados}. Esses resultados ainda não ${
      uma ? "contam a questão" : "contam essas questões"
    }, e ${efeito}`;
  }
  if (desanuladas.length) {
    const voltou = quaisVoltaramAValer(desanuladas).replace(/^A /, "a ").replace(/^As /, "as ");
    return `${quaisForamAnuladas(anuladas)} e ${voltou} ${calculados}. Esses resultados ainda estão com as questões de antes, e ${efeito}`;
  }
  return `${quaisForamAnuladas(anuladas)} ${calculados}. Esses resultados ainda contam a questão, e ${efeito}`;
}

export function textoDoProgresso(processados: number, total: number): string {
  return `Recalculando ${Math.min(processados, total)} de ${total}…`;
}

export function textoDasFalhas(falhas: number): string | null {
  if (!falhas) return null;
  return falhas === 1
    ? "1 resultado não pôde ser recalculado."
    : `${falhas} resultados não puderam ser recalculados.`;
}

/** "90 questões · 1 anulada · análise sobre 89" (tickets/042, card 15). */
export function resumoDasQuestoesDoRelatorio(
  total: number,
  anuladas: number,
  considerado?: number,
): string {
  const q = `${total} ${total === 1 ? "questão" : "questões"}`;
  if (!anuladas) return q;
  return `${q} · ${anuladas} ${anuladas === 1 ? "anulada" : "anuladas"} · análise sobre ${
    considerado ?? total - anuladas
  }`;
}

export const TEXTO_SEM_DISCRIMINACAO_DIVERGENTE =
  "O índice de discriminação não é calculado enquanto houver resultados de antes da anulação: a nota geral deles ainda conta a questão. Recalcule para ver.";

export const TEXTO_LINHA_DIVERGENTE =
  "Nota calculada antes da anulação: ainda conta a questão anulada.";
