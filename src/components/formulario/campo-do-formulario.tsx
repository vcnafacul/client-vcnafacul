import * as React from "react";
import type {
  FieldError,
  FieldValues,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SelectOpcoes, type OpcaoDoCampo } from "./select-opcoes";
import { SenhaInput } from "./senha-input";
import type { FormFieldInput } from "./tipos";

export interface CampoDoFormularioProps<T extends FieldValues>
  extends FormFieldInput {
  register: UseFormRegister<T>;
  error?: FieldError;
}

/** `inputMode` e `autoComplete` certos para os ids que se repetem nos formulários. */
function atributosDoId(id: string, type: FormFieldInput["type"]) {
  const chave = id.toLowerCase();
  if (type === "number") return { inputMode: "numeric" as const };
  if (chave.includes("email"))
    return {
      inputMode: "email" as const,
      autoComplete: chave === "email" ? "username" : "email",
    };
  if (chave.includes("phone") || chave.includes("whatsapp"))
    return { inputMode: "tel" as const, autoComplete: "tel" };
  if (chave === "cep")
    return { inputMode: "numeric" as const, autoComplete: "postal-code" };
  return {};
}

/**
 * Como o `<select>` nativo: um valor que não está entre as opções cai na opção
 * vazia, se houver, ou na primeira. Assim o valor que vai no envio é o que a
 * tela mostra.
 */
function valorInicialDaEscolha(candidato: string, opcoes: OpcaoDoCampo[]) {
  const valores = opcoes.map((o) => String(o.value));
  if (valores.includes(candidato)) return candidato;
  return valores.includes("") ? "" : (valores[0] ?? "");
}

/**
 * Um campo de formulário guiado por dados (`FormFieldInput`): `Field` com o
 * controle do tipo pedido, ligado ao react-hook-form por `register`.
 * `Select` do Radix não é um input nativo, então o valor passa por um "ref"
 * que o react-hook-form lê e escreve (`setValue` e `reset` continuam valendo).
 * tickets/059/01
 */
export function CampoDoFormulario<T extends FieldValues>({
  id,
  label,
  type = "text",
  visibility = false,
  disabled,
  required,
  defaultValue,
  value,
  options,
  className,
  register,
  error,
}: CampoDoFormularioProps<T>) {
  const registro = register(id as never);
  const mensagem = error?.message;

  const eEscolha = type === "option" || type === "select";
  const inicial = valorInicialDaEscolha(
    String(defaultValue ?? value ?? ""),
    options ?? []
  );

  return (
    <Field
      label={label}
      required={required}
      error={mensagem}
      className={className}
    >
      {eEscolha ? (
        <EscolhaRegistrada
          id={id}
          registro={registro}
          inicial={inicial}
          opcoes={options ?? []}
          disabled={disabled}
        />
      ) : type === "textarea" ? (
        <Textarea
          {...registro}
          id={id}
          defaultValue={defaultValue}
          disabled={disabled}
        />
      ) : type === "password" ? (
        <SenhaInput
          {...registro}
          id={id}
          visivelAoIniciar={visibility}
          defaultValue={defaultValue}
          disabled={disabled}
          autoComplete={id === "email" ? "username" : id === "password" ? "current-password" : "new-password"}
        />
      ) : (
        <Input
          {...registro}
          id={id}
          type={type}
          defaultValue={defaultValue}
          disabled={disabled}
          {...atributosDoId(id, type)}
        />
      )}
    </Field>
  );
}

interface EscolhaRegistradaProps {
  id: string;
  registro: UseFormRegisterReturn;
  inicial: string;
  opcoes: OpcaoDoCampo[];
  disabled?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  required?: boolean;
}

function EscolhaRegistrada({
  id,
  registro,
  inicial,
  opcoes,
  disabled,
  ...aria
}: EscolhaRegistradaProps) {
  const [valor, setValor] = React.useState(inicial);
  const valorAtual = React.useRef(inicial);
  const gatilho = React.useRef<HTMLButtonElement>(null);

  const { ref, onChange } = registro;
  // O `ref` do register muda a cada render; só o valor mais recente importa.
  const refAtual = React.useRef(ref);
  refAtual.current = ref;
  const alvo = React.useMemo(
    () => ({
      name: registro.name,
      focus: () => gatilho.current?.focus(),
      get value() {
        return valorAtual.current;
      },
      set value(novo: string) {
        valorAtual.current = novo ?? "";
        setValor(novo ?? "");
      },
    }),
    [registro.name]
  );
  React.useEffect(() => {
    refAtual.current(alvo);
    return () => refAtual.current(null);
  }, [alvo]);

  return (
    <SelectOpcoes
      {...aria}
      id={id}
      disabled={disabled}
      options={opcoes.filter((o) => String(o.value) !== "")}
      value={valor}
      onValueChange={(novo) => {
        alvo.value = String(novo);
        void onChange({ target: alvo, type: "change" });
      }}
    />
  );
}
