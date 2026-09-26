import {
  dataOrdenavel,
  StatusBadge,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { formatDate } from "@/utils/date";
import { badgeDoProcesso, statusDoProcesso } from "./status";

/** Quando o campo não veio. Um espaço em branco parece bug; o travessão não. */
export const VAZIO = "—";

const data = (valor?: Date) => (valor ? formatDate(valor.toString()) : VAZIO);

/**
 * As colunas de Processos Seletivos (card 04 da série
 * `tickets/021-dash-v2-processo-seletivo`).
 *
 * ⚠️ **Constante de módulo, e não dentro do componente**: recriar o array a
 * cada render invalidaria o `useMemo` das colunas no `DashListTemplate`, e com
 * ele a ordenação da lista inteira (mesma regra da `dashProvas/columns`).
 *
 * ⚠️ Datas ordenadas pelo `dataOrdenavel`: o serviço já converte para `Date`
 * (card 01), mas ele aceita string também — não depende disso.
 */
export const colunasDeProcesso: DashColumn<Inscription>[] = [
  {
    id: "nome",
    header: "Processo seletivo",
    primary: true,
    cell: (p) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate" title={p.name}>
          {p.name || VAZIO}
        </span>
        {p.isTest ? <StatusBadge tone="info" label="Teste" /> : null}
      </span>
    ),
    sortValue: (p) => p.name ?? null,
  },
  {
    id: "status",
    header: "Status",
    cell: (p) => {
      const { tone, label } = badgeDoProcesso(p);
      return <StatusBadge tone={tone} label={label} />;
    },
    sortValue: (p) => statusDoProcesso(p),
    width: "120px",
  },
  {
    id: "inicia",
    header: "Inicia",
    cell: (p) => data(p.startDate),
    sortValue: (p) => dataOrdenavel(p.startDate),
    width: "110px",
  },
  {
    id: "encerra",
    header: "Encerra",
    cell: (p) => data(p.endDate),
    sortValue: (p) => dataOrdenavel(p.endDate),
    width: "110px",
    hideBelow: "sm",
  },
  {
    id: "inscritos",
    header: "Inscritos / vagas",
    cell: (p) => `${p.subscribersCount ?? 0} / ${p.openingsCount ?? VAZIO}`,
    sortValue: (p) => p.subscribersCount ?? null,
    align: "right",
    width: "140px",
  },
  {
    id: "criadoEm",
    header: "Criado em",
    cell: (p) => data(p.createdAt),
    sortValue: (p) => dataOrdenavel(p.createdAt),
    width: "110px",
    hideBelow: "md",
  },
];

/** Decidido em 2026-09-26: o mais recente primeiro (antes: o mais antigo). */
export const ORDENACAO_PADRAO: SortState = { columnId: "inicia", direction: "desc" };
