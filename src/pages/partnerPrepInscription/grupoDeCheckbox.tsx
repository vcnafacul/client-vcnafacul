import * as React from "react";
import { XCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

export interface GrupoDeCheckboxProps {
  /** A pergunta: vira a `legend` do `fieldset`. */
  legenda: React.ReactNode;
  opcoes: string[];
  defaultValue?: string[];
  onValueChange: (valores: string[]) => void;
  required?: boolean;
  /** Mensagem sob o grupo, no mesmo desenho do erro do `Field`. */
  error?: string;
  /**
   * Opções do tipo "Não possuo" / "Não pertenço" são excludentes: ao marcar uma,
   * as outras se desmarcam e travam (e vice-versa).
   */
  excludentes?: boolean;
}

const PADROES_EXCLUDENTES = ["Não possuo", "Não pertenço"];
const eExcludente = (valor: string) =>
  PADROES_EXCLUDENTES.some((p) => valor.toLowerCase().includes(p.toLowerCase()));

/**
 * Pergunta de várias respostas da inscrição: `fieldset` com `legend`, uma
 * `Checkbox` por opção. Substitui o `InputCheckBox` do V1 com a mesma regra
 * de opção excludente. O `Field` não serve aqui: o rótulo dele aponta para
 * um controle só, e um grupo não é rotulável por `for`.
 * tickets/059/01
 */
export function GrupoDeCheckbox({
  legenda,
  opcoes,
  defaultValue = [],
  onValueChange,
  required = false,
  error,
  excludentes = false,
}: GrupoDeCheckboxProps) {
  const [marcados, setMarcados] = React.useState<string[]>(defaultValue);
  const idErro = React.useId();
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
    <fieldset
      className="grid gap-1.5"
      aria-describedby={error ? idErro : undefined}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1.5 text-label">
        {legenda}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        ) : null}
      </legend>
      <div className="flex flex-col">
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
      {error ? (
        <p
          id={idErro}
          className="flex items-center gap-1.5 text-caption text-muted-foreground"
        >
          <XCircle
            aria-hidden="true"
            className="size-3.5 shrink-0 text-destructive"
          />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
