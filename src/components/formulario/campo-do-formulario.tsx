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

  const eEscolha = type === "select";
  // Valor vazio ou fora das opções mostra o placeholder: a tela sempre bate com o
  // valor do formulário (nada de primeira opção escolhida sem o usuário escolher).
  const escolhido = (options ?? []).some((o) => String(o.value) === atual)
    ? atual
    : "";

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
          value={escolhido}
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
