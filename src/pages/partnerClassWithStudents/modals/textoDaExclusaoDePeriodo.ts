/**
 * O que acontece ao excluir uma justificativa de período
 * (tickets-documentacao, card 06): as faltas que ela justificou voltam a ser
 * faltas comuns; as justificadas à mão ficam.
 */
export function textoDaExclusaoDePeriodo(faltas?: number): string {
  if (faltas === 0) return "Nenhuma falta foi justificada por ela.";
  const quantas =
    faltas === undefined
      ? "As faltas justificadas por ela voltarão a ser faltas comuns."
      : faltas === 1
        ? "1 falta voltará a ser falta comum."
        : `${faltas} faltas voltarão a ser faltas comuns.`;
  return `${quantas} Justificativas lançadas individualmente não mudam.`;
}
