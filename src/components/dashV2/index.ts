/**
 * Barrel da Dash V2.
 *
 * ⚠️ **POC.** Enquanto for POC a pasta é `components/dashV2/`, que é honesto
 * sobre o que ela é; quando a segunda tela migrar, ela se muda para
 * `components/organisms/dashList/` junto com o atomic design do resto do
 * projeto. Ter o barrel desde já é o que torna essa mudança um único commit de
 * `git mv` em vez de nove telas reescrevendo imports.
 *
 * ⚠️ Nada daqui é importado por tela do V1. Ver `DashListTemplate` para o
 * contrato — em especial `entities` ser leitura.
 */

export {
  DashDateRangeFilter,
  TEXTO_INTERVALO_INVERTIDO,
  type DashDateRangeFilterProps,
} from "./DashDateRangeFilter";
export { DashFilterBar, DEBOUNCE_BUSCA_MS } from "./DashFilterBar";
export { DashListFooter, type DashListFooterProps } from "./DashListFooter";
export {
  DashListTemplate,
  DICA_VAZIO_COM_FILTRO,
  PAGE_SIZE_PADRAO,
  TEXTO_LIMPAR_FILTROS,
  TEXTO_VAZIO_COM_FILTRO,
  TEXTO_VAZIO_SEM_FILTRO,
  type DashListTemplateProps,
} from "./DashListTemplate";
export { DashTable } from "./DashTable";
export {
  BlocosSkeleton,
  DashTableErro,
  DashTableVazio,
  DICA_VAZIO,
  LINHAS_SKELETON,
  LinhasSkeleton,
  TEXTO_ERRO,
  TEXTO_TENTAR_DE_NOVO,
  TEXTO_VAZIO,
} from "./DashTableEmpty";
export { DashToolbar, MAX_SECUNDARIAS_NA_BARRA } from "./DashToolbar";
export { deriveActions, rotuloDoBotao, type AcoesDerivadas } from "./deriveActions";
export {
  CABECALHO_DA_COLUNA_PRIMARIA,
  deriveColumns,
  RE_NUMERICA,
  rotuloDeStatus,
  ROTULO_STATUS_DESCONHECIDO,
  TAMANHO_DA_AMOSTRA,
  toneDeStatus,
} from "./deriveColumns";
export {
  dentroDoIntervalo,
  intervaloAtivo,
  intervaloInvalido,
  type IntervaloDeDatas,
} from "./intervaloDeDatas";
export { intervaloDaPagina, totalDePaginas } from "./paginacao";
export { dataOrdenavel, proximoSort, sortRows } from "./sortRows";
export { StatusBadge, type StatusBadgeProps } from "./StatusBadge";
export { dashV2, type StatusV2 } from "./tokens";
export type {
  DashAction,
  DashColumn,
  DashFilterBarProps,
  DashTableProps,
  DashToolbarProps,
  SortDirection,
  SortState,
  SortValue,
} from "./types";
export { SM, useAcimaDeSm } from "./useAcimaDeSm";
