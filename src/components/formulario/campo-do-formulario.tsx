import * as React from "react";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OptionsSelect } from "@/components/ui/options-select";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";

import type { FormFieldInput } from "./tipos";

export interface CampoDoFormularioProps<T extends FieldValues>
  extends FormFieldInput {
  control: Control<T>;
}

/**
 * Como o `<select>` nativo: um valor que não está entre as opções cai na opção
 * vazia, se houver, ou na primeira. Assim o valor que vai no envio é o que a
 * tela mostra.
 */
function valorValidoDaEscolha(candidato: string, opcoes: FormFieldInput["options"]) {
  const valores = (opcoes ?? []).map((o) => String(o.value));
  if (valores.includes(candidato)) return candidato;
  return valores.includes("") ? "" : (valores[0] ?? "");
}

/**
 * Um campo de formulário guiado por dados (`FormFieldInput`): `Field` com o
 * controle do tipo pedido, ligado ao react-hook-form por `useController`
 * (valor, `onChange`, `ref` e foco no erro seguem o formulário, inclusive
 * depois de `reset` e `setValue`). O erro vem do próprio formulário.
 * tickets/059/01
 */
export function CampoDoFormulario<T extends FieldValues>({
  id,
  label,
  type = "text",
  inputMode,
  autoComplete,
  visibility = false,
  disabled,
  required,
  defaultValue,
  value,
  options,
  className,
  control,
}: CampoDoFormularioProps<T>) {
  const { field, fieldState } = useController({
    control,
    name: id as Path<T>,
    defaultValue: String(defaultValue ?? value ?? "") as never,
  });
  const atual = String(field.value ?? "");

  // Mesmo depois de `reset`, o valor que vai no envio é o que a tela mostra.
  const eEscolha = type === "select";
  const valido = eEscolha ? valorValidoDaEscolha(atual, options) : atual;
  const { onChange } = field;
  React.useEffect(() => {
    if (eEscolha && valido !== atual) onChange(valido);
  }, [eEscolha, valido, atual, onChange]);

  const comum = {
    id,
    name: field.name,
    disabled,
    onBlur: field.onBlur,
  };

  return (
    <Field
      label={label}
      required={required}
      error={fieldState.error?.message}
      className={className}
    >
      {eEscolha ? (
        <OptionsSelect
          ref={field.ref}
          id={id}
          disabled={disabled}
          options={options ?? []}
          value={valido}
          onValueChange={(novo) => field.onChange(String(novo))}
        />
      ) : type === "textarea" ? (
        <Textarea
          {...comum}
          ref={field.ref}
          value={atual}
          autoComplete={autoComplete}
          onChange={field.onChange}
        />
      ) : type === "password" ? (
        <PasswordInput
          {...comum}
          ref={field.ref}
          value={atual}
          initiallyVisible={visibility}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={field.onChange}
        />
      ) : (
        <Input
          {...comum}
          ref={field.ref}
          type={type}
          value={atual}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={field.onChange}
        />
      )}
    </Field>
  );
}
