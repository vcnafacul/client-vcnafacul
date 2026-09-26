import { dataOrdenavel, type DashColumn } from "@/components/dashV2";
import type { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { formatDate } from "../../utils/date";

/** Quando o campo não veio. Um espaço em branco parece bug; o travessão não. */
export const VAZIO = "—";

/**
 * As colunas da lista de demandas de conteúdo.
 *
 * ⚠️ **Sem coluna de status.** A lista vem do servidor já filtrada por UM
 * status (não existe "Todos" no filtro), então a coluna repetiria o mesmo chip
 * em todas as linhas — e o status escolhido já está visível no filtro.
 *
 * ⚠️ **Sem coluna de matéria.** `subject.frente.materia` é o ID da matéria,
 * não o nome; o nome está no filtro. A frente e o tema já localizam a demanda.
 *
 * ⚠️ Fora do componente, como em `dashProvas/columns`: identidade estável, e o
 * `useMemo` das colunas no template não invalida a cada render.
 */
export const colunasDeConteudo: DashColumn<ContentDtoInput>[] = [
  {
    id: "titulo",
    header: "Título",
    primary: true,
    cell: (c) => c.title || VAZIO,
    sortValue: (c) => c.title || null,
  },
  {
    id: "frente",
    header: "Frente",
    width: "12rem",
    cell: (c) => c.subject?.frente?.nome ?? VAZIO,
    sortValue: (c) => c.subject?.frente?.nome ?? null,
  },
  {
    id: "tema",
    header: "Tema",
    width: "14rem",
    hideBelow: "sm",
    cell: (c) => c.subject?.name ?? VAZIO,
    sortValue: (c) => c.subject?.name ?? null,
  },
  {
    id: "createdAt",
    header: "Cadastrado em",
    width: "9rem",
    align: "right",
    hideBelow: "md",
    cell: (c) => (c.createdAt ? formatDate(String(c.createdAt)) : VAZIO),
    // ⚠️ `createdAt` é tipado como DateTime e chega como string ISO — ver
    // `dataOrdenavel`.
    sortValue: (c) => dataOrdenavel(c.createdAt),
  },
  {
    id: "lastEditedAt",
    header: "Última edição",
    width: "9rem",
    align: "right",
    hideBelow: "md",
    cell: (c) => (c.lastEditedAt ? formatDate(c.lastEditedAt) : VAZIO),
    sortValue: (c) => dataOrdenavel(c.lastEditedAt),
  },
];
