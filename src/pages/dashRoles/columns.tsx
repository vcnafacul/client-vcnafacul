import { dataOrdenavel, type DashColumn } from "@/components/dashV2";
import type { UserRole } from "../../types/roles/UserRole";
import { formatDate } from "../../utils/date";

/** Quando o campo não veio. */
export const VAZIO = "—";

/**
 * O nome que a pessoa usa: o social, quando ela pediu (`useSocialName`).
 *
 * ⚠️ Sai daqui e não da coluna: a busca (card 02) também acha pelo nome social,
 * e a tabela precisa mostrar o mesmo nome que deu o match.
 */
export function nomeDoUsuario(u: UserRole["user"]): string {
  const primeiro = u.useSocialName && u.socialName ? u.socialName : u.firstName;
  return [primeiro, u.lastName].filter(Boolean).join(" ") || VAZIO;
}

/**
 * As colunas da tela de usuários (card 03 de `tela-de-usuarios`).
 *
 * ⚠️ **Fora do componente**, como em `dashProvas/columns`: identidade estável,
 * sem invalidar o `useMemo` das colunas do template a cada render.
 *
 * ⚠️ **Último acesso** entrou porque ajuda a achar a conta certa entre
 * homônimos — a conta que ninguém usa há um ano raramente é a procurada.
 */
export const colunasDeUsuario: DashColumn<UserRole>[] = [
  {
    id: "nome",
    header: "Nome",
    primary: true,
    cell: (ur) => nomeDoUsuario(ur.user),
    sortValue: (ur) => nomeDoUsuario(ur.user).toLocaleLowerCase("pt-BR"),
  },
  {
    id: "email",
    header: "Email",
    cell: (ur) => ur.user.email ?? VAZIO,
    sortValue: (ur) => ur.user.email ?? null,
  },
  {
    id: "funcao",
    header: "Função",
    cell: (ur) => ur.roleName || VAZIO,
    sortValue: (ur) => ur.roleName || null,
  },
  {
    id: "cadastro",
    header: "Cadastro",
    hideBelow: "md",
    cell: (ur) =>
      ur.user.createdAt ? formatDate(String(ur.user.createdAt)) : VAZIO,
    sortValue: (ur) => dataOrdenavel(ur.user.createdAt),
  },
  {
    id: "ultimoAcesso",
    header: "Último acesso",
    hideBelow: "md",
    cell: (ur) =>
      ur.user.lastAccess ? formatDate(String(ur.user.lastAccess)) : "Nunca",
    sortValue: (ur) => dataOrdenavel(ur.user.lastAccess),
  },
];

/**
 * **Ativo** — só com o filtro de cursinho (card 06): "colaboradores de X"
 * traz os inativos também, e a tabela precisa dizer quem é quem.
 */
export const colunaAtivo: DashColumn<UserRole> = {
  id: "ativo",
  header: "Ativo",
  cell: (ur) =>
    ur.colaborador ? (ur.colaborador.ativo ? "Sim" : "Não") : VAZIO,
  sortValue: (ur) =>
    ur.colaborador ? (ur.colaborador.ativo ? 1 : 0) : null,
};

/** A coluna Ativo entra depois da Função. */
export const colunasComAtivo: DashColumn<UserRole>[] = [
  ...colunasDeUsuario.slice(0, 3),
  colunaAtivo,
  ...colunasDeUsuario.slice(3),
];
