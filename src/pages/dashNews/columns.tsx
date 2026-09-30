import {
  dataOrdenavel,
  StatusBadge,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import { News } from "@/dtos/news/news";
import { formatDate } from "@/utils/date";

export const VAZIO = "—";

/**
 * `expireAt` chega como "YYYY-MM-DD": `new Date` leria em UTC e mostraria o
 * dia anterior no Brasil. Monta a data em horário local.
 */
export function dataDeExpiracao(expireAt?: string | null): Date | null {
  if (!expireAt) return null;
  const [ano, mes, dia] = expireAt.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

const expiracao = (n: News) => {
  const data = dataDeExpiracao(n.expireAt);
  return data ? data.toLocaleDateString("pt-BR") : "Sem expiração";
};

/**
 * As colunas das Novidades no template V2 (mesmo padrão de Provas e Processos
 * Seletivos). Constante de módulo: identidade estável, sem invalidar o
 * `useMemo` de colunas e ordenação do `DashListTemplate`.
 */
export const colunasDeNovidade: DashColumn<News>[] = [
  {
    id: "titulo",
    header: "Novidade",
    primary: true,
    cell: (n) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate" title={n.title}>
          {n.title || VAZIO}
        </span>
        {n.destaque ? <StatusBadge tone="info" label="Destaque" /> : null}
      </span>
    ),
    sortValue: (n) => n.title ?? null,
  },
  {
    id: "status",
    header: "Status",
    cell: (n) =>
      n.actived ? (
        <StatusBadge tone="done" label="Ativa" />
      ) : (
        <StatusBadge tone="neutral" label="Inativa" />
      ),
    sortValue: (n) => (n.actived ? 1 : 0),
    width: "110px",
  },
  {
    id: "tipo",
    header: "Conteúdo",
    cell: (n) => (n.contentType === "text" ? "Texto" : "Arquivo"),
    sortValue: (n) => n.contentType ?? null,
    width: "110px",
    hideBelow: "sm",
  },
  {
    id: "expira",
    header: "Expira em",
    cell: expiracao,
    sortValue: (n) => dataDeExpiracao(n.expireAt)?.getTime() ?? null,
    width: "130px",
    hideBelow: "md",
  },
  {
    id: "criadoEm",
    header: "Criada em",
    cell: (n) => (n.createdAt ? formatDate(n.createdAt.toString()) : VAZIO),
    sortValue: (n) => dataOrdenavel(n.createdAt),
    width: "110px",
  },
];

export const ORDENACAO_PADRAO: SortState = {
  columnId: "criadoEm",
  direction: "desc",
};
