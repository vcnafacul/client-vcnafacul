
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface OpcaoDoCampo<T extends string | number = string | number> {
  value: T;
  label: string;
}

/** Acima disto a lista vira `Combobox` (com busca), como manda a §7.4 da spec 059. */
export const LIMITE_SEM_BUSCA = 10;

export interface SelectOpcoesProps<T extends string | number> {
  options: OpcaoDoCampo<T>[];
  value?: T | null;
  /** Devolve o valor da opção com o tipo original (número continua número). */
  onValueChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  required?: boolean;
}

/**
 * Controle de escolha única para dentro de um `Field`: `Select` do Radix, ou
 * `Combobox` quando a lista é longa. Repassa ao gatilho o que o `Field` injeta
 * (`id`, `aria-*`). Os dois abrem em portal e funcionam dentro de um Dialog.
 * tickets/059/01
 */
export function SelectOpcoes<T extends string | number>({
  options,
  value,
  onValueChange,
  placeholder = "Selecione",
  disabled,
  id,
  className,
  ...aria
}: SelectOpcoesProps<T>) {
  const atual =
    value === undefined || value === null || value === ""
      ? undefined
      : String(value);
  const escolher = (texto: string) => {
    const opcao = options.find((o) => String(o.value) === texto);
    if (opcao) onValueChange(opcao.value);
  };

  if (options.length > LIMITE_SEM_BUSCA) {
    return (
      <Combobox
        id={id}
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        options={options.map((o) => ({
          value: String(o.value),
          label: o.label,
        }))}
        value={atual}
        onValueChange={escolher}
        {...aria}
      />
    );
  }

  return (
    <Select value={atual ?? ""} onValueChange={escolher} disabled={disabled}>
      <SelectTrigger id={id} className={className} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

