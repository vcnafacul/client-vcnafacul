import { EditRoleDto } from "@/dtos/roles/editRole";

/**
 * Por que este perfil não pode ser recomendado — as mesmas regras da api
 * (`RoleService.setRecommended`). `null` = pode.
 */
export function motivoSemRecomendacao(role: EditRoleDto): string | null {
  if (role.name === "aluno")
    return "O perfil aluno já é o padrão de quem sai do cursinho.";
  if (role.alterarPermissao)
    return 'Perfis com "Alterar Permissão" não podem ser recomendados: o coordenador poderia criar admins ao indicá-los.';
  return null;
}

export type PassoDoSalvar = "perfil" | "recomendar" | "desrecomendar";

/**
 * Ordem das chamadas no Salvar. Desmarcar vem **antes** do perfil: a api
 * recusa dar "Alterar Permissão" a um perfil que ainda está recomendado.
 * Marcar vem **depois**, para já valer sobre as permissões novas.
 */
export function passosDoSalvar(antes: boolean, depois: boolean): PassoDoSalvar[] {
  if (antes === depois) return ["perfil"];
  return depois ? ["perfil", "recomendar"] : ["desrecomendar", "perfil"];
}
