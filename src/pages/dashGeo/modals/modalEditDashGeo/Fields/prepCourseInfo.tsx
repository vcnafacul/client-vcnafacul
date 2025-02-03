/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputFactory,
  InputFactoryType,
} from "@/components/organisms/inputFactory";
import { prepCourseInfoType } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";
import { FieldErrors, UseFormSetValue } from "react-hook-form";

interface Props {
  form: prepCourseInfoType;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors;
  edit: boolean;
  geo: Geolocation;
}

export function PrepCourseInfo({ form, setValue, errors, edit, geo }: Props) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 items-center 
      h-full sm:h-[729px] gap-x-4 px-1"
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
      <InputFactory
        id={form.category.label}
        label={form.category.label}
        type={form.category.type as InputFactoryType}
        onChange={(e: any) => setValue("category", e.target.value)}
        error={errors.category}
        disabled={!edit}
        defaultValue={geo.category}
      />
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
      />
      <InputFactory
        id={form.phone.label}
        label={form.phone.label}
        type={form.phone.type as InputFactoryType}
        onChange={(e: any) => setValue("phone", e.target.value)}
        error={errors.phone}
        disabled={!edit}
        defaultValue={geo.phone}
      />
      <InputFactory
        id={form.whatsapp.label}
        label={form.whatsapp.label}
        type={form.whatsapp.type as InputFactoryType}
        onChange={(e: any) => setValue("whatsapp", e.target.value)}
        error={errors.whatsapp}
        disabled={!edit}
        defaultValue={geo.whatsapp}
      />
      <InputFactory
        id={form.email.label}
        label={form.email.label}
        type={form.email.type as InputFactoryType}
        onChange={(e: any) => setValue("email", e.target.value)}
        error={errors.email}
        disabled={!edit}
        defaultValue={geo.email}
      />
      <InputFactory
        id={form.site.label}
        label={form.site.label}
        type={form.site.type as InputFactoryType}
        onChange={(e: any) => setValue("site", e.target.value)}
        error={errors.site}
        disabled={!edit}
        defaultValue={geo.site}
      />
      <InputFactory
        id={form.instagram.label}
        label={form.instagram.label}
        type={form.instagram.type as InputFactoryType}
        onChange={(e: any) => setValue("instagram", e.target.value)}
        error={errors.instagram}
        disabled={!edit}
        defaultValue={geo.instagram}
      />
      <InputFactory
        id={form.youtube.label}
        label={form.youtube.label}
        type={form.youtube.type as InputFactoryType}
        onChange={(e: any) => setValue("youtube", e.target.value)}
        error={errors.youtube}
        disabled={!edit}
        defaultValue={geo.youtube}
      />
      <InputFactory
        id={form.facebook.label}
        label={form.facebook.label}
        type={form.facebook.type as InputFactoryType}
        onChange={(e: any) => setValue("facebook", e.target.value)}
        error={errors.facebook}
        disabled={!edit}
        defaultValue={geo.facebook}
      />
      <InputFactory
        id={form.linkedin.label}
        label={form.linkedin.label}
        type={form.linkedin.type as InputFactoryType}
        onChange={(e: any) => setValue("linkedin", e.target.value)}
        error={errors.linkedin}
        disabled={!edit}
        defaultValue={geo.linkedin}
      />
      <InputFactory
        id={form.twitter.label}
        label={form.twitter.label}
        type={form.twitter.type as InputFactoryType}
        onChange={(e: any) => setValue("twitter", e.target.value)}
        error={errors.twitter}
        disabled={!edit}
        defaultValue={geo.twitter}
      />
    </div>
  );
}
