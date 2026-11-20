import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";

export interface GrupoDeCheckboxProps {
  opcoes: string[];
  defaultValue?: string[];
  onValueChange: (valores: string[]) => void;
  /**
   * Opções do tipo "Não possuo" / "Não pertenço" são excludentes: ao marcar uma,
   * as outras se desmarcam e travam (e vice-versa).
   */
  excludentes?: boolean;
  /** Nome do grupo para leitor de tela (o mesmo texto do rótulo do `Field`). */
  "aria-label"?: string;
  "aria-describedby"?: string;
  id?: string;
  /** Injetados pelo `Field`; um grupo não os usa (`aria-required` e `aria-invalid` não valem em `group`: o erro chega por `aria-describedby`). */
  required?: boolean;
  "aria-required"?: boolean;
  maxLength?: number;
}

const PADROES_EXCLUDENTES = ["Não possuo", "Não pertenço"];
const eExcludente = (valor: string) =>
  PADROES_EXCLUDENTES.some((p) => valor.toLowerCase().includes(p.toLowerCase()));

/**
 * Grupo de caixas de marcação, para dentro de um `Field`. Substitui o
 * `InputCheckBox` do V1 com a mesma regra de opção excludente.
 * tickets/059/01
 */
export function GrupoDeCheckbox({
  opcoes,
  defaultValue = [],
  onValueChange,
  excludentes = false,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
}: GrupoDeCheckboxProps) {
  const [marcados, setMarcados] = React.useState<string[]>(defaultValue);
  const excludenteMarcado = excludentes && marcados.some(eExcludente);

  const alternar = (valor: string, marcar: boolean) => {
    let novos: string[];
    if (marcar) {
      novos = excludentes && eExcludente(valor) ? [valor] : [...marcados, valor];
    } else {
      novos = marcados.filter((m) => m !== valor);
    }
    setMarcados(novos);
    onValueChange(novos);
  };

  return (
    <div
      role="group"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      className="flex flex-col"
    >
      {opcoes.map((valor) => (
        <Checkbox
          key={valor}
          label={valor}
          checked={marcados.includes(valor)}
          disabled={excludenteMarcado && !eExcludente(valor)}
          onCheckedChange={(marcar) => alternar(valor, marcar === true)}
        />
      ))}
    </div>
  );
}
