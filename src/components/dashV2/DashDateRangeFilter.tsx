// O componente mudou para `components/ui/date-range-picker` (tickets/059 R15).
// Sem importadores: as telas usam o `ui` direto. Fica só até a limpeza (Task 13, tickets/059), que o apaga.
import {
  DateRangeFields,
  TEXTO_INTERVALO_INVERTIDO,
  type DateRangeFieldsProps,
} from "@/components/ui/date-range-picker";

export { TEXTO_INTERVALO_INVERTIDO };
export type DashDateRangeFilterProps = DateRangeFieldsProps;
export const DashDateRangeFilter = DateRangeFields;

export default DashDateRangeFilter;
