import { DatePicker } from "@/components/ui/date-picker";
import { paraDataValida } from "@/lib/datasBr";
import { Field } from "@/components/ui/field";
import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
} from "react-hook-form";

interface ControlCalendarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any>;
  value?: Date;
  label: string;
  error?:
    | Merge<
        FieldError,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined)[]
      >
    | undefined;
}

function ControlCalendar({
  control,
  value,
  label,
  error,
}: ControlCalendarProps) {
  const errorMessage =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error?.message as any)?.message || error?.message || undefined;
  return (
    <Controller
      name="birthday"
      control={control}
      defaultValue={value || new Date()}
      render={({ field }) => (
        <Field label={label} error={errorMessage}>
          <DatePicker
            value={paraDataValida(field.value)}
            onChange={(d) => d && field.onChange(d)}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date()}
          />
        </Field>
      )}
    />
  );
}

export default ControlCalendar;
