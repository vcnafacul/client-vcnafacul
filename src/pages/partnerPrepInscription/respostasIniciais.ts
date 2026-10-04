import type { SectionForm } from "@/types/partnerPrepForm/sectionForm";

/**
 * As respostas com que a seção abre: só o que a pessoa já preencheu antes.
 *
 * ⚠️ Sim/Não começava marcado "Não" (tickets-documentacao, card 29): o
 * estudante avançava sem ler e o "Não" ia como resposta dele, e as questões
 * condicionadas a "É Não" já abriam. Agora nada vem marcado e a validação de
 * obrigatório vale também para Sim/Não.
 */
export function respostasIniciais(
  secao: SectionForm,
  jaRespondidas: Record<string, unknown>,
): Record<string, unknown> {
  const iniciais: Record<string, unknown> = {};
  for (const q of secao.questions) {
    if (jaRespondidas[q._id] !== undefined) iniciais[q._id] = jaRespondidas[q._id];
  }
  return iniciais;
}
