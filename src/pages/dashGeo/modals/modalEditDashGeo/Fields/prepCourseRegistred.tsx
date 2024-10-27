/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputFactory,
  InputFactoryType,
} from "@/components/organisms/inputFactory";
import { prepCourseRegistredType } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";

interface Props {
  form: prepCourseRegistredType;
  geo: Geolocation;
}

export function PrepCourseRegistred({ form, geo }: Props) {
  return (
    <div className="flex flex-col flex-wrap w-full h-full gap-x-4 pr-4">
      <InputFactory
        id={form.userFullname.label}
        label={form.userFullname.label}
        type={form.userFullname.type as InputFactoryType}
        disabled
        defaultValue={geo.userFullName}
      />
      <InputFactory
        id={form.userEmail.label}
        label={form.userEmail.label}
        type={form.userEmail.type as InputFactoryType}
        disabled
        defaultValue={geo.userEmail}
      />
      <InputFactory
        id={form.userPhone.label}
        label={form.userPhone.label}
        type={form.userPhone.type as InputFactoryType}
        disabled
        defaultValue={geo.userPhone}
      />
      <InputFactory
        id={form.userConnection.label}
        label={form.userConnection.label}
        type={form.userConnection.type as InputFactoryType}
        disabled
        defaultValue={geo.userConnection}
      />
      <InputFactory
        id={form.createdAt.label}
        label={form.createdAt.label}
        type={form.createdAt.type as InputFactoryType}
        disabled
        defaultValue={geo.createdAt}
      />
    </div>
  );
}
