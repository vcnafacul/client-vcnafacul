/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputFactory,
  InputFactoryType,
} from "@/components/organisms/inputFactory";
import { prepCourseUpdatedType } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";

interface Props {
  form: prepCourseUpdatedType;
  geo: Geolocation;
}

export function PrepCourseUpdated({ form, geo }: Props) {
  return (
    <div
      className="flex flex-col flex-wrap w-full 
      sm:w-[300px] h-full gap-x-4 pr-4"
    >
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
    </div>
  );
}
