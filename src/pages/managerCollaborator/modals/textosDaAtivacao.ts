import type { ResultadoDaAtivacao } from "@/services/prepCourse/collaborator/change-active";

export function mensagemDaAtivacao(r: ResultadoDaAtivacao): string {
  if (!r.actived) return "Colaborador inativado.";
  if (r.funcaoRestaurada && r.role) {
    return `Colaborador reativado com a função "${r.role.name}".`;
  }
  return "Colaborador reativado. Escolha a função em Editar Função.";
}
