 
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { prepCourseRegistredType } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";

interface Props {
  form: prepCourseRegistredType;
  geo: Geolocation;
}

export function PrepCourseRegistred({ form, geo }: Props) {
  return (
    <div className="flex flex-col flex-wrap w-full h-full gap-x-4 pr-4">
      <Field label={form.userFullname.label}>
        <Input
          id={form.userFullname.label}
          type="text"
          disabled
          defaultValue={geo.userFullName}
        />
      </Field>
      <Field label={form.userEmail.label}>
        <Input
          id={form.userEmail.label}
          type="text"
          inputMode="email"
          disabled
          defaultValue={geo.userEmail}
        />
      </Field>
      <Field label={form.userPhone.label}>
        <Input
          id={form.userPhone.label}
          type="text"
          inputMode="tel"
          disabled
          defaultValue={geo.userPhone}
        />
      </Field>
      <Field label={form.userConnection.label}>
        <Input
          id={form.userConnection.label}
          type="text"
          disabled
          defaultValue={geo.userConnection}
        />
      </Field>
      <Field label={form.createdAt.label}>
        <Input
          id={form.createdAt.label}
          type="text"
          disabled
          defaultValue={geo.createdAt}
        />
      </Field>
    </div>
  );
}
