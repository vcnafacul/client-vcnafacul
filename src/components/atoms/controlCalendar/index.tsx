import { Calendar } from "primereact/calendar";
import { Control, Controller } from "react-hook-form";

interface ControlCalendarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any, any>;
  value?: Date;
  label: string;
}

function ControlCalendar({control, value, label }: ControlCalendarProps) {
  return (
    <div className="card flex justify-content-center h-16 border hover:border-orange pt-4 pl-4 rounded-md relative mb-4  row-start-3 col-start-1">
      <label
        className="absolute top-1 left-3 text-xs text-grey font-semibold"
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
            className="focus-visible:ring-orange w-full"
            readOnlyInput
            hideOnRangeSelection
            locale="pt-br"
          />
        )}
      />
    </div>
  );
}

export default ControlCalendar;
