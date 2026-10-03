import type { ResultadoDaAtivacao } from "@/services/prepCourse/collaborator/change-active";

/** O que acontece ao inativar (tickets-documentacao, card 03). */
export function consequenciasDaInativacao(funcao?: string): string[] {
  return [
    "Perde o acesso às telas do cursinho.",
    "Sai da página pública do cursinho.",
    funcao
      ? `Ao reativar, volta com a função atual (${funcao}).`
      : "Ao reativar, volta com a função atual.",
  ];
}

export function mensagemDaAtivacao(r: ResultadoDaAtivacao): string {
  if (!r.actived) return "Colaborador inativado.";
  if (r.funcaoRestaurada && r.role) {
    return `Colaborador reativado com a função "${r.role.name}".`;
  }
  return "Colaborador reativado. Escolha a função em Editar Função.";
}
