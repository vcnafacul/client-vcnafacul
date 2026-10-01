import { dataOrdenavel, type DashColumn, type SortState } from "@/components/dashV2";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { formatDate } from "@/utils/date";

export const VAZIO = "—";

/**
 * As colunas do Gerenciamento de Cursinho no template V2 (mesmo padrão de
 * Novidades e Validação LC). Constante de módulo: identidade estável para o
 * `useMemo` do `DashListTemplate`.
 */
export const colunasDoCursinho: DashColumn<PartnerPrepCourse>[] = [
  {
    id: "nome",
    header: "Cursinho",
    primary: true,
    cell: (c) => (
      <span className="truncate" title={c.geo?.name}>
        {c.geo?.name || VAZIO}
      </span>
    ),
    sortValue: (c) => c.geo?.name ?? null,
  },
  {
    id: "local",
    header: "Cidade / UF",
    cell: (c) => [c.geo?.city, c.geo?.state].filter(Boolean).join(" / ") || VAZIO,
    sortValue: (c) => `${c.geo?.state ?? ""} ${c.geo?.city ?? ""}`.trim() || null,
    width: "180px",
    hideBelow: "sm",
  },
  {
    id: "coordenador",
    header: "Coordenador",
    cell: (c) => (
      <span className="truncate" title={c.representative?.email}>
        {c.representative?.name || VAZIO}
      </span>
    ),
    sortValue: (c) => c.representative?.name ?? null,
    width: "200px",
    hideBelow: "md",
  },
  {
    id: "estudantes",
    header: "Estudantes",
    cell: (c) => c.number_students ?? 0,
    sortValue: (c) => c.number_students ?? 0,
    align: "right",
    width: "110px",
  },
  {
    id: "membros",
    header: "Membros",
    cell: (c) => c.number_members ?? 0,
    sortValue: (c) => c.number_members ?? 0,
    align: "right",
    width: "100px",
    hideBelow: "sm",
  },
  {
    id: "criadoEm",
    header: "Desde",
    cell: (c) => (c.createdAt ? formatDate(c.createdAt) : VAZIO),
    sortValue: (c) => dataOrdenavel(c.createdAt),
    width: "110px",
    hideBelow: "md",
  },
];

export const ORDENACAO_PADRAO: SortState = { columnId: "nome", direction: "asc" };
