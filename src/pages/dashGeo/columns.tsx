import {
  dataOrdenavel,
  StatusBadge,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Geolocation } from "@/types/geolocation/geolocation";
import { TypeMarker } from "@/types/map/marker";
import { formatDate } from "@/utils/date";

export const VAZIO = "—";

/** Rótulo e tom do status — os mesmos nomes do filtro (`data.ts`). */
export function badgeDoGeo(status: StatusEnum): {
  tone: "done" | "running" | "missing" | "neutral";
  label: string;
} {
  if (status === StatusEnum.Approved) return { tone: "done", label: "Aprovado" };
  if (status === StatusEnum.Rejected) return { tone: "missing", label: "Reprovado" };
  if (status === StatusEnum.Pending) return { tone: "running", label: "Pendente" };
  return { tone: "neutral", label: VAZIO };
}

/** Quantos problemas foram reportados no Localiza (endereço, contato, outro). */
export function relatos(g: Pick<Geolocation, "reportAddress" | "reportContact" | "reportOther">) {
  return [g.reportAddress, g.reportContact, g.reportOther].filter(Boolean).length;
}

/**
 * As colunas da Validação LC no template V2 (mesmo padrão de Provas e
 * Novidades). Constante de módulo: identidade estável para o `useMemo` do
 * `DashListTemplate`.
 */
export const colunasDoGeo: DashColumn<Geolocation>[] = [
  {
    id: "nome",
    header: "Nome",
    primary: true,
    cell: (g) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate" title={g.name}>
          {g.name || VAZIO}
        </span>
        {relatos(g) > 0 ? (
          <StatusBadge tone="missing" label={`${relatos(g)} relato(s)`} />
        ) : null}
      </span>
    ),
    sortValue: (g) => g.name ?? null,
  },
  {
    id: "status",
    header: "Status",
    cell: (g) => {
      const { tone, label } = badgeDoGeo(g.status as StatusEnum);
      return <StatusBadge tone={tone} label={label} />;
    },
    sortValue: (g) => Number(g.status),
    width: "120px",
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: (g) => (g.type === TypeMarker.geo ? "Cursinho" : "Universidade"),
    sortValue: (g) => g.type,
    width: "120px",
    hideBelow: "sm",
  },
  {
    id: "local",
    header: "Cidade / UF",
    cell: (g) => [g.city, g.state].filter(Boolean).join(" / ") || VAZIO,
    sortValue: (g) => `${g.state ?? ""} ${g.city ?? ""}`.trim() || null,
    width: "180px",
    hideBelow: "sm",
  },
  {
    id: "atualizado",
    header: "Atualizado em",
    cell: (g) => (g.updatedAt ? formatDate(g.updatedAt) : VAZIO),
    sortValue: (g) => dataOrdenavel(g.updatedAt),
    width: "120px",
    hideBelow: "md",
  },
  {
    id: "criado",
    header: "Cadastrado em",
    cell: (g) => (g.createdAt ? formatDate(g.createdAt) : VAZIO),
    sortValue: (g) => dataOrdenavel(g.createdAt),
    width: "120px",
  },
];

export const ORDENACAO_PADRAO: SortState = {
  columnId: "criado",
  direction: "desc",
};
