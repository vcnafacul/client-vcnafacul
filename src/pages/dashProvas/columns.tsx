import { dataOrdenavel, StatusBadge, type DashColumn } from "@/components/dashV2";
import type { Prova } from "../../dtos/prova/prova";
import { formatDate } from "../../utils/date";
import { ProgressoCell } from "./ProgressoCell";
import { progressoOrdenavel } from "./progresso";
import { statusDaProva } from "./status";

/**
 * As 9 colunas do banco de provas.
 *
 * ⚠️ **Fora do componente, e sem `useMemo`.** É um array constante de closures
 * puras; recriá-lo a cada render do `DashProva` faria o `useMemo` das colunas
 * dentro do `DashListTemplate` invalidar sempre, e com ele o `sortRows` da
 * lista inteira. Como constante de módulo, o custo é zero e a identidade é
 * estável para sempre.
 */

/** Quando o campo não veio. Um espaço em branco parece bug; o travessão não. */
export const VAZIO = "—";

/**
 * ✓ / — da coluna Gabarito.
 *
 * ⚠️ `SEM_GABARITO` é o literal, e não `= VAZIO`: com uma referência no lugar
 * do literal o `react-refresh/only-export-components` deixa de reconhecer o
 * export como constante e o arquivo inteiro passa a warning — e este projeto
 * não tolera warning de lint.
 */
export const COM_GABARITO = "✓";
export const SEM_GABARITO = "—";

/**
 * ⚠️ **`prova.gabarito` é uma STRING** (o nome do arquivo no storage), não um
 * booleano. `prova.gabarito === true` nunca é verdade e a coluna inteira
 * mostraria "—" para todas as provas — inclusive as que têm gabarito. É o tipo
 * de erro que não derruba nada e faz a tela mentir em silêncio; há teste com
 * mutação para ele.
 */
export function temGabarito(prova: Pick<Prova, "gabarito">): boolean {
  return !!prova.gabarito;
}

export const colunasDeProva: DashColumn<Prova>[] = [
  {
    id: "nome",
    header: "Prova",
    primary: true,
    cell: (p) => p.nome ?? VAZIO,
    sortValue: (p) => p.nome ?? null,
  },
  {
    /*
      ⚠️ `prova.categoria` é tipada como `ICategoria` obrigatória, mas quem
      garante que ela vem populada é o backend, não o DTO. Uma prova órfã de
      categoria derrubaria a tabela inteira num `Cannot read properties of
      undefined` — daí o encadeamento opcional apesar do tipo.

      ⚠️ `hideBelow: "sm"` aqui (e nas outras quatro) não esconde nada da
      tabela: a tabela só existe acima de 768px. É como o `DashTable` escolhe o
      que cabe na lista empilhada do celular — sem isto, o bloco do mobile
      mostraria Categoria e Ano, e não Ano e Progresso, que é o par que importa.
    */
    id: "categoria",
    header: "Categoria",
    width: "11rem",
    hideBelow: "sm",
    cell: (p) => p.categoria?.nome ?? VAZIO,
    sortValue: (p) => p.categoria?.nome ?? null,
  },
  {
    id: "ano",
    header: "Ano",
    width: "5rem",
    align: "right",
    cell: (p) => p.ano ?? VAZIO,
    sortValue: (p) => p.ano ?? null,
  },
  {
    id: "edicao",
    header: "Edição",
    width: "9rem",
    hideBelow: "sm",
    cell: (p) => p.edicao ?? VAZIO,
    sortValue: (p) => p.edicao ?? null,
  },
  {
    id: "aplicacao",
    header: "Aplic.",
    width: "4.5rem",
    align: "right",
    hideBelow: "sm",
    cell: (p) => p.aplicacao ?? VAZIO,
    sortValue: (p) => p.aplicacao ?? null,
  },
  {
    id: "progresso",
    header: "Progresso",
    width: "13rem",
    cell: (p) => <ProgressoCell prova={p} />,
    sortValue: progressoOrdenavel,
  },
  {
    id: "gabarito",
    header: "Gabarito",
    width: "6rem",
    align: "center",
    hideBelow: "sm",
    cell: (p) => (
      <span title={temGabarito(p) ? "Com gabarito" : "Sem gabarito"}>
        {temGabarito(p) ? COM_GABARITO : SEM_GABARITO}
      </span>
    ),
    // ⚠️ `SortValue` não tem booleano — e ordenar por `String(boolean)` daria
    // "false" antes de "true" por acaso alfabético. 1/0 é explícito.
    sortValue: (p) => (temGabarito(p) ? 1 : 0),
  },
  {
    id: "createdAt",
    header: "Cadastrado em",
    width: "9rem",
    hideBelow: "md",
    // ⚠️ `formatDate` é o mesmo que a tela já usava no card — nada de formatação
    // nova, para as duas telas não divergirem enquanto o V1 existir.
    cell: (p) => (p.createdAt ? formatDate(p.createdAt.toString()) : VAZIO),
    // ⚠️ `dataOrdenavel`, e não a string: `createdAt` é tipado como `DateTime`
    // do luxon mas chega como string ISO, e ordenar texto de data funciona por
    // acaso até o dia em que o formato muda.
    sortValue: (p) => dataOrdenavel(p.createdAt),
  },
  {
    id: "status",
    header: "Status",
    width: "9.5rem",
    cell: (p) => {
      const { tone, label } = statusDaProva(p);
      return <StatusBadge tone={tone} label={label} />;
    },
    sortValue: (p) => statusDaProva(p).ordem,
  },
];
