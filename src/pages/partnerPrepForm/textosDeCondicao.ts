import { Logic } from "@/types/partnerPrepForm/condition";
import { AnswerType } from "@/types/partnerPrepForm/questionForm";

/** Tipo da questão em português (antes aparecia "Text", "Boolean"…). */
export const ROTULO_DO_TIPO: Record<AnswerType, string> = {
  [AnswerType.Text]: "Texto",
  [AnswerType.Number]: "Número",
  [AnswerType.Boolean]: "Sim/Não",
  [AnswerType.Options]: "Opções",
};

/** Lógica das condições em português (antes "And"/"Or"). */
export function rotuloDaLogica(logica: Logic | string): string {
  return logica === Logic.Or ? "OU (qualquer)" : "E (todas)";
}

/** Corta só o que passa do limite — antes "..." ia até em texto curto. */
export function resumo(texto: string, max = 50): string {
  return texto.length > max ? `${texto.slice(0, max)}…` : texto;
}
