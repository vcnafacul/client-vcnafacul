import type { SectionForm } from "@/types/partnerPrepForm/sectionForm";

const soAtivas = (secoes: SectionForm[]): SectionForm[] =>
  secoes
    .filter((s) => s.active)
    .map((s) => ({ ...s, questions: s.questions.filter((q) => q.active) }));

/**
 * O que a tela do Formulário mostra (tickets-documentacao, card 17).
 *
 * - **Globais:** só as ativas — o cursinho não as gerencia, e inativa não
 *   entra no formulário.
 * - **Do cursinho:** todas, inclusive inativas (com a etiqueta Inativo).
 *   Antes elas sumiam no próximo carregamento e não havia como reativar; e a
 *   reordenação mandava a lista sem as inativas e falhava (card 21).
 */
export function secoesVisiveis(
  globais: SectionForm[],
  doCursinho: SectionForm[],
): SectionForm[] {
  return [
    ...soAtivas(globais.map((s) => ({ ...s, isGlobal: true }))),
    ...doCursinho.map((s) => ({ ...s, isGlobal: false })),
  ];
}
