import type { DashColumn } from "@/components/dashV2";
import { phoneMask } from "@/utils/phoneMask";
import type { CollaboratorColumns } from ".";

/** "Membro desde": o dia em que a pessoa entrou para o cursinho. */
export const membroDesde = (c: Pick<CollaboratorColumns, "createdAt">) =>
  c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-BR") : "—";

/**
 * As colunas da tela de colaboradores no Dash V2 (2026-10-19). Sem a coluna
 * Status: inativar saiu da tela, e reativar é pelo detalhe do colaborador.
 */
export function colunasDeColaborador(
  fotos: Record<string, string>,
): DashColumn<CollaboratorColumns>[] {
  return [
    {
      id: "nome",
      header: "Nome",
      primary: true,
      sortValue: (c) => c.name?.toLocaleLowerCase("pt-BR"),
      cell: (c) => {
        const foto = c.photo ? fotos[c.photo] : undefined;
        return (
          <span className="flex items-center gap-3">
            {foto ? (
              <img
                src={foto}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-marine"
              >
                {c.name?.charAt(0)}
              </span>
            )}
            <span className="min-w-0 break-words font-medium">{c.name}</span>
          </span>
        );
      },
    },
    {
      id: "email",
      header: "Email",
      sortValue: (c) => c.email,
      cell: (c) => <span className="break-all">{c.email}</span>,
    },
    {
      id: "funcao",
      header: "Função",
      sortValue: (c) => c.role?.name,
      cell: (c) => c.role?.name ?? "—",
    },
    {
      id: "telefone",
      header: "Telefone",
      hideBelow: "md",
      cell: (c) => (c.phone ? phoneMask(c.phone) : "—"),
    },
    {
      id: "membro-desde",
      header: "Membro desde",
      align: "right",
      sortValue: (c) => (c.createdAt ? new Date(c.createdAt) : null),
      cell: membroDesde,
    },
  ];
}
