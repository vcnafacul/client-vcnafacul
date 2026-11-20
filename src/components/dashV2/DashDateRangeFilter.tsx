// O componente mudou para `components/ui/date-range-picker` (tickets/059 R15).
// Este arquivo só mantém o nome e as props que a Dash V2 já usa.
import {
  DateRangeFields,
  TEXTO_INTERVALO_INVERTIDO,
  type DateRangeFieldsProps,
} from "@/components/ui/date-range-picker";

export { TEXTO_INTERVALO_INVERTIDO };
export type DashDateRangeFilterProps = DateRangeFieldsProps;
export const DashDateRangeFilter = DateRangeFields;

export default DashDateRangeFilter;
