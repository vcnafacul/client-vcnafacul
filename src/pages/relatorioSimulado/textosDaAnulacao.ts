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

/** O aviso de relatório desatualizado (tickets/042, card 15). */
export function textoDaDivergencia(anuladas: AnuladaDoRelatorio[], divergentes: number): string {
  const n = `${divergentes} ${divergentes === 1 ? "resultado" : "resultados"}`;
  return `${quaisForamAnuladas(anuladas)} depois que ${n} ${
    divergentes === 1 ? "foi calculado" : "foram calculados"
  }. Esses resultados ainda contam a questão, e médias, discriminação e comparação podem estar erradas.`;
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
