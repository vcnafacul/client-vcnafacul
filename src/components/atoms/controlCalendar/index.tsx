import { Calendar } from "primereact/calendar";
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
    <div className="card flex justify-content-center h-16 border hover:border-cta pt-4 pl-4 rounded-md relative mb-4  row-start-3 col-start-1 w-full">
      <label
        className="absolute top-1 left-3 text-xs text-muted-foreground font-semibold"
        htmlFor="date"
      >
        {label}
      </label>
      <Controller
        name="birthday"
        control={control}
        defaultValue={value || new Date()}
        render={({ field }) => (
          <Calendar
            id="birthday"
            dateFormat="dd/mm/yy"
            value={field.value}
            onChange={(e) => field.onChange(e.value)}
            selectionMode="single"
            className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full"
            readOnlyInput
            hideOnRangeSelection
            locale="pt-br"
          />
        )}
      />
      {error && (
        <span className="absolute left-0 -bottom-4 text-xs text-destructive">{errorMessage}</span>
      )}
    </div>
  );
}

export default ControlCalendar;
