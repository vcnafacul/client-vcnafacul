/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputFactory,
  InputFactoryType,
} from "@/components/organisms/inputFactory";
import { prepCourseInfoType } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";
import { TypeMarker } from "@/types/map/marker";
import { useState } from "react";
import { FaRegCopy } from "react-icons/fa";
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

interface ContactFieldProps {
  id: string;
  label: string;
  type: InputFactoryType;
  onChange: (value: string) => void;
  error: FieldErrors[string];
  edit: boolean;
  defaultValue?: string;
}

function ContactField({
  id,
  label,
  type,
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
    <div className="relative">
      <InputFactory
        id={id}
        label={label}
        type={type}
        onChange={(e: any) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        error={error}
        disabled={!edit}
        defaultValue={defaultValue}
        className={canCopy ? "pr-11" : ""}
      />
      {canCopy && (
        <button
          type="button"
          onClick={copy}
          aria-label={`Copiar ${label}`}
          title={`Copiar ${label}`}
          className="absolute right-2 top-4 p-2 rounded-md text-grey hover:text-orange hover:bg-gray-100"
        >
          <FaRegCopy className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function PrepCourseInfo({ form, setValue, errors, edit, geo }: Props) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 items-center 
      h-full sm:min-h-[729px] gap-x-4 px-1"
    >
      <InputFactory
        id={form.name.label}
        label={form.name.label}
        type={form.name.type as InputFactoryType}
        onChange={(e: any) => setValue("name", e.target.value)}
        error={errors.name}
        disabled={!edit}
        defaultValue={geo.name}
      />
      {geo.type === TypeMarker.univPublic ? (
        <>
          <InputFactory
            id={form.alias.label}
            label={form.alias.label}
            type={form.alias.type as InputFactoryType}
            onChange={(e: any) => setValue("alias", e.target.value)}
            error={errors.alias}
            disabled={!edit}
            defaultValue={geo.alias}
          />
          <InputFactory
            id={form.campus.label}
            label={form.campus.label}
            type={form.campus.type as InputFactoryType}
            onChange={(e: any) => setValue("campus", e.target.value)}
            error={errors.campus}
            disabled={!edit}
            defaultValue={geo.campus}
          />
        </>
      ) : (
        <InputFactory
          id={form.category.label}
          label={form.category.label}
          type={form.category.type as InputFactoryType}
          onChange={(e: any) => setValue("category", e.target.value)}
          error={errors.category}
          disabled={!edit}
          defaultValue={geo.category}
        />
      )}
      <InputFactory
        id={form.cep.label}
        label={form.cep.label}
        type={form.cep.type as InputFactoryType}
        onChange={(e: any) => setValue("cep", e.target.value)}
        error={errors.cep}
        disabled={!edit}
        defaultValue={geo.cep}
      />
      <InputFactory
        id={form.street.label}
        label={form.street.label}
        type={form.street.type as InputFactoryType}
        onChange={(e: any) => setValue("street", e.target.value)}
        error={errors.street}
        disabled={!edit}
        defaultValue={geo.street}
      />
      <InputFactory
        id={form.number.label}
        label={form.number.label}
        type={form.number.type as InputFactoryType}
        onChange={(e: any) => setValue("number", e.target.value)}
        error={errors.number}
        disabled={!edit}
        defaultValue={geo.number}
      />
      <InputFactory
        id={form.complement.label}
        label={form.complement.label}
        type={form.complement.type as InputFactoryType}
        onChange={(e: any) => setValue("complement", e.target.value)}
        error={errors.complement}
        disabled={!edit}
        defaultValue={geo.complement}
      />
      <InputFactory
        id={form.neighborhood.label}
        label={form.neighborhood.label}
        type={form.neighborhood.type as InputFactoryType}
        onChange={(e: any) => setValue("neighborhood", e.target.value)}
        error={errors.neighborhood}
        disabled={!edit}
        defaultValue={geo.neighborhood}
      />
      <InputFactory
        id={form.city.label}
        label={form.city.label}
        type={form.city.type as InputFactoryType}
        onChange={(e: any) => setValue("city", e.target.value)}
        error={errors.city}
        disabled={!edit}
        defaultValue={geo.city}
      />
      <InputFactory
        id={form.state.label}
        label={form.state.label}
        type={form.state.type as InputFactoryType}
        onChange={(e: any) => setValue("state", e.target.value)}
        error={errors.state}
        options={form.state.options}
        disabled={!edit}
        defaultValue={geo.state}
        value={geo.state}
      />
      {CONTACT_FIELDS.map((field) => (
        <ContactField
          key={field}
          id={form[field].label}
          label={form[field].label}
          type={form[field].type as InputFactoryType}
          onChange={(value) => setValue(field, value)}
          error={errors[field]}
          edit={edit}
          defaultValue={geo[field]}
        />
      ))}
    </div>
  );
}
