import { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { OptionProps } from "../selectOption";

export type SelectProps = ComponentProps<"select"> & {
  options: OptionProps[];
  value?: number | string;
  disabled?: boolean;
  setState: (value: any) => void;
};

function Select({ id, options, disabled, value, setState }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={(e) => setState(e.target.value)}
        className="
          appearance-none
          w-full
          h-12
          px-4
          pr-12
          rounded-md
          border
          border-border
          bg-white
          text-foreground
          font-medium
          shadow-sm
          transition-all
          hover:border-border
          hover:shadow-md
          focus:outline-none
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          focus:border-ring
        "
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
    </div>
  );
}

export default Select;
