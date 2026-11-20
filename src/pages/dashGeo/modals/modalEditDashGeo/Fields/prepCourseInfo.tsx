/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OptionsSelect,
  type SelectOption,
} from "@/components/ui/options-select";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { prepCourseInfoType } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";
import { TypeMarker } from "@/types/map/marker";
import { useState } from "react";
import { Copy } from "lucide-react";
import { FieldErrors, UseFormSetValue } from "react-hook-form";
import { toast } from "react-toastify";

interface Props {
  form: prepCourseInfoType;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors;
  edit: boolean;
  geo: Geolocation;
}

// Contatos ganham um botão de copiar quando o modal está só para visualização.
const CONTACT_FIELDS = [
  "phone",
  "whatsapp",
  "email",
  "site",
  "instagram",
  "youtube",
  "facebook",
  "linkedin",
  "twitter",
  "tiktok",
] as const;

type TipoDoCampo = "text" | "select" | string;

/** `inputMode` do teclado do celular, pelo campo (CEP numérico, telefone, e-mail). */
function modoDeEntrada(campo: string) {
  if (campo === "cep") return "numeric" as const;
  if (campo === "phone" || campo === "whatsapp") return "tel" as const;
  if (campo === "email") return "email" as const;
  return undefined;
}

interface CampoProps {
  campo: string;
  label: string;
  type: TipoDoCampo;
  onChange: (value: string) => void;
  error: FieldErrors[string];
  edit: boolean;
  defaultValue?: string;
  options?: SelectOption[];
}

/** Um campo do cursinho: texto, ou lista quando o tipo é `select`. */
function Campo({
  campo,
  label,
  type,
  onChange,
  error,
  edit,
  defaultValue,
  options,
}: CampoProps) {
  const [escolhido, setEscolhido] = useState(defaultValue ?? "");
  const mensagem = error?.message as string | undefined;

  if (type === "select") {
    return (
      <Field label={label} error={mensagem}>
        <OptionsSelect
          id={label}
          disabled={!edit}
          options={options ?? []}
          value={escolhido}
          onValueChange={(valor) => {
            setEscolhido(String(valor));
            onChange(String(valor));
          }}
        />
      </Field>
    );
  }
  return (
    <Field label={label} error={mensagem}>
      <Input
        id={label}
        type="text"
        inputMode={modoDeEntrada(campo)}
        disabled={!edit}
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

interface ContactFieldProps {
  campo: string;
  label: string;
  onChange: (value: string) => void;
  error: FieldErrors[string];
  edit: boolean;
  defaultValue?: string;
}

function ContactField({
  campo,
  label,
  onChange,
  error,
  edit,
  defaultValue,
}: ContactFieldProps) {
  // O input não é controlado: guarda o que está na tela para copiar o valor atual.
  const [value, setValue] = useState(defaultValue ?? "");
  const canCopy = !edit && !!value;

  const copy = () => {
    if (!navigator.clipboard?.writeText) {
      toast.error(`Não foi possível copiar ${label}`);
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => toast.info(`${label} copiado!`))
      .catch(() => toast.error(`Não foi possível copiar ${label}`));
  };

  return (
    <Field label={label} error={error?.message as string | undefined}>
      <Input
        id={label}
        type="text"
        inputMode={modoDeEntrada(campo)}
        disabled={!edit}
        defaultValue={defaultValue}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        trailing={
          canCopy ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Copiar ${label}`}
              title={`Copiar ${label}`}
              className="h-7 w-7 sm:h-7 sm:w-7"
              onClick={copy}
            >
              <Copy aria-hidden="true" />
            </Button>
          ) : undefined
        }
      />
    </Field>
  );
}

export function PrepCourseInfo({ form, setValue, errors, edit, geo }: Props) {
  const campo = (
    chave: keyof prepCourseInfoType,
    valorInicial?: string
  ) => (
    <Campo
      campo={chave}
      label={form[chave].label}
      type={form[chave].type}
      onChange={(valor) => setValue(chave, valor)}
      error={errors[chave]}
      edit={edit}
      defaultValue={valorInicial}
      options={(form[chave] as { options?: SelectOption[] }).options}
    />
  );
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 items-start 
      h-full sm:min-h-[729px] gap-x-4 gap-y-4 px-1"
    >
      {campo("name", geo.name)}
      {geo.type === TypeMarker.univPublic ? (
        <>
          {campo("alias", geo.alias)}
          {campo("campus", geo.campus)}
        </>
      ) : (
        campo("category", geo.category)
      )}
      {campo("cep", geo.cep)}
      {campo("street", geo.street)}
      {campo("number", geo.number)}
      {campo("complement", geo.complement)}
      {campo("neighborhood", geo.neighborhood)}
      {campo("city", geo.city)}
      {campo("state", geo.state)}
      {CONTACT_FIELDS.map((field) => (
        <ContactField
          key={field}
          campo={field}
          label={form[field].label}
          onChange={(value) => setValue(field, value)}
          error={errors[field]}
          edit={edit}
          defaultValue={geo[field]}
        />
      ))}
    </div>
  );
}
