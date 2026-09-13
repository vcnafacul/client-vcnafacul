/**
 * Contratos dos primitivos da Dash V2.
 *
 * ⚠️ A ação é classificada por **papel**, não por cor. Quem monta a tela diz
 * "isto é a ação primária" / "isto é secundária" / "isto vai no ⋯"; a aparência
 * é decisão do componente, com as regras do ticket `02`. É o que impede a
 * barra de voltar a ter seis botões de quatro cores, como em `dashProvas`.
 */
export interface DashAction {
  /** Identidade estável — usada como `key` e nos testes. */
  id: string;
  label: string;
  onClick: () => void;
  /**
   * ⚠️ Opcional **de propósito, e hoje ninguém passa**: a hierarquia desta barra
   * é por cor e posição. Ícone acrescentaria uma decisão por botão sem resolver
   * o problema que o épico ataca. O campo existe para o dia em que uma tela
   * precise — e aí é uma decisão consciente, não o default.
   */
  icon?: React.ReactNode;
  disabled?: boolean;
  /**
   * Vira tooltip no botão desabilitado — ex.: "Requer permissão: cadastrar provas".
   * Hoje o V1 deixa o botão com `opacity-30` e nada explica o motivo.
   */
  disabledReason?: string;
  destructive?: boolean;
}

export interface DashToolbarProps {
  title: string;
  /** Ex.: "128 provas". */
  subtitle?: React.ReactNode;
  /** ⚠️ No máximo UMA — o tipo torna impossível passar duas. */
  primary?: DashAction;
  /** Viram botões, na ordem. Acima de 3, as excedentes caem no `⋯` sozinhas. */
  secondary?: DashAction[];
  /** Já nascem dentro do menu `⋯`. */
  overflow?: DashAction[];
  backButton?: React.ReactNode;
}

export interface DashFilterBarProps {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  /** Selects, checkboxes, o que a tela precisar. */
  children?: React.ReactNode;
  /** Nº de filtros ativos. Sem isso, "Limpar filtros" não aparece. */
  activeCount?: number;
  onClear?: () => void;
}

export type SortDirection = "asc" | "desc";

/** Uma coluna por vez — ordenação multi-coluna ficou fora do escopo. */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** O que um `sortValue` pode devolver. `null`/`undefined` vão sempre para o fim. */
export type SortValue = string | number | Date | null | undefined;

export interface DashColumn<T> {
  /** Identidade estável — `key`, `sort.columnId` e os testes usam isto. */
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /**
   * Presente = coluna ordenável. Ausente = não ordenável (sem botão, sem seta,
   * sem `aria-sort`).
   *
   * ⚠️ Para data, **normalize aqui**: `Prova.createdAt` é tipado como `DateTime`
   * do luxon mas chega da API como string ISO. Devolver a string crua faz a
   * ordenação virar ordem alfabética — que funciona nos primeiros registros e
   * mente depois. Use o `dataOrdenavel` do `sortRows.ts`.
   */
  sortValue?: (row: T) => SortValue;
  align?: "left" | "right" | "center";
  /** Track de largura CSS: `"200px"`, `"20%"`, `"minmax(...)"` não — é `<th style="width">`. */
  width?: string;
  /**
   * Some abaixo desse breakpoint — `sm`=768px, `md`=1200px (screens do projeto).
   *
   * ⚠️ Isto é CSS (`hidden md:table-cell`) e pode ser, porque esconder coluna
   * não duplica conteúdo no DOM. Trocar a tabela pela lista empilhada é outra
   * história e acontece em JS — ver `useAcimaDeSm`.
   */
  hideBelow?: "sm" | "md";
  /**
   * Coluna-chave: é o alvo clicável da linha e o título do bloco na lista
   * empilhada. ⚠️ Só a primeira marcada vale.
   */
  primary?: boolean;
}

export interface DashTableProps<T> {
  rows: T[];
  columns: DashColumn<T>[];
  /** ⚠️ Nunca o índice: é por isso que a lista do V1 pisca ao reordenar. */
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /**
   * ⚠️ Ordenação é **controlada por fora**, e a tabela não reordena `rows`
   * sozinha — ela só avisa. É isso que deixa a tela escolher entre ordenar em
   * memória (`sortRows`) ou pedir ordenado ao servidor sem tocar aqui.
   */
  sort?: SortState;
  onSortChange?: (s: SortState) => void;
  density?: "base" | "compact";
  state?: "idle" | "loading" | "error";
  onRetry?: () => void;
  /**
   * ⚠️ Vazio **por filtro** e vazio **por não existir nada** são mensagens
   * diferentes, e a tabela não sabe distinguir: quem conhece a contagem de
   * filtros ativos é a tela.
   */
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
}
