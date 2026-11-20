import { OptionsSelect } from "@/components/ui/options-select";

export interface OpcaoDoFiltro {
  id: number | string;
  name: string;
}

/** O que cada tela passa para a faixa de filtros das listas (DashListTemplate e dashCardTemplate). */
export interface FiltroSelectProps {
  options: OpcaoDoFiltro[];
  value?: number | string;
  defaultValue?: number | string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  /** Recebe o id da opção como texto, igual ao `<select>` nativo que isto substitui. */
  setState: (value: string) => void;
}

/** O Radix não aceita item de valor vazio: a opção "todos" (id "") usa este valor por dentro. */
const TODOS = "__todos__";
const paraRadix = (id: number | string) => (String(id) === "" ? TODOS : String(id));

/**
 * Filtro de lista: `Select` do Radix (ou `Combobox` acima de 10 opções) com o contrato do
 * `<select>` nativo (`setState` recebe o id como texto). Sem escolha implícita (R36): o valor
 * que não bate com nenhuma opção mostra o placeholder, e a tela é quem declara o valor inicial.
 */
export function FiltroSelect({
  options,
  value,
  defaultValue,
  disabled,
  className,
  setState,
  "aria-label": rotulo,
}: FiltroSelectProps) {
  const atual = value ?? defaultValue;
  return (
    <OptionsSelect<string>
      aria-label={rotulo ?? String(options[0]?.name ?? "Filtro")}
      placeholder="Filtro"
      disabled={disabled}
      className={className}
      options={options.map((o) => ({ value: paraRadix(o.id), label: o.name }))}
      value={atual === undefined ? undefined : paraRadix(atual)}
      onValueChange={(v) => setState(v === TODOS ? "" : v)}
    />
  );
}
