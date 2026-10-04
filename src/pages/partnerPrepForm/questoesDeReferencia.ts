import type { QuestionForm } from "@/types/partnerPrepForm/questionForm";
import type { SectionForm } from "@/types/partnerPrepForm/sectionForm";

/**
 * Questões que podem ser referência de condição numa seção
 * (tickets-documentacao, card 27): as das seções **até ela**, na ordem da
 * tela (globais primeiro). O estudante preenche seção por seção, então uma
 * condição para uma questão de seção posterior nunca seria atendida.
 * A própria questão sai no modal de condições.
 */
export function questoesDeReferencia(
  secoes: SectionForm[],
  secaoId: string,
): QuestionForm[] {
  const ate = secoes.findIndex((s) => s._id === secaoId);
  const anteriores = ate === -1 ? secoes : secoes.slice(0, ate + 1);
  return anteriores.flatMap((s) => s.questions);
}
