import { Roles } from "@/enums/roles/roles";
import { DASH } from "@/routes/path";
import { ItemMenuProps } from "../../molecules/menuItems";

/** A única permissão que o aluno comum tem; as demais são de quem trabalha. */
const PERMISSOES_DE_ALUNO: string[] = [Roles.visualizarMinhasInscricoes];

/**
 * Colaborador de cursinho (perfil `collaborator`) ou da equipe do projeto
 * (alguma permissão além das de aluno).
 */
export function ehColaborador(
  profiles: string[],
  permissao: Record<string, boolean>,
): boolean {
  return (
    profiles.includes("collaborator") ||
    Object.entries(permissao).some(
      ([chave, tem]) => tem && !PERMISSOES_DE_ALUNO.includes(chave),
    )
  );
}

/** Troca "Painel do Estudante" por "Painel do Colaborador" no menu do usuário. */
export function comNomeDoPainel(
  itens: ItemMenuProps[],
  colaborador: boolean,
): ItemMenuProps[] {
  if (!colaborador) return itens;
  return itens.map((item) =>
    item.Home_Menu_Item_id.link === DASH
      ? {
          ...item,
          Home_Menu_Item_id: {
            ...item.Home_Menu_Item_id,
            name: "Painel do Colaborador",
          },
        }
      : item,
  );
}
