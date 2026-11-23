import { OptionsSelect, SelectOption } from "@/components/ui/options-select";
import { useState } from "react";

export interface InputSelectProps {
  options?: SelectOption[];
  value?: string | number | null;
  defaultValue?: string | number | null;
  /** Devolve o valor da opção escolhida. */
  onValueChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

/**
 * Select do formulário genérico (`InputFactory`): `OptionsSelect` (Select, ou
 * Combobox com busca acima de 10 opções). Sem opção escolhida, mostra o
 * placeholder: nada é escolhido por padrão.
 */
export function InputSelect({
  value,
  defaultValue,
  onValueChange,
  options = [],
  className,
  ...props
}: InputSelectProps) {
  const [interno, setInterno] = useState(defaultValue);
  const atual = value !== undefined ? value : interno;
  return (
    <OptionsSelect
      {...props}
      options={options}
      value={atual}
      onValueChange={(v) => {
        setInterno(v);
        onValueChange?.(v);
      }}
      className={className}
    />
  );
}
