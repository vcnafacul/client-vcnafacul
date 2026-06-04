import { ComponentProps } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { OptionProps } from "../selectOption";

export type SelectProps = ComponentProps<"select"> & {
  options: OptionProps[];
  value?: number | string;
  disabled?: boolean;
  setState: (value: any) => void;
};

function Select({ options, disabled, value, setState }: SelectProps) {
  return (
    <div className="relative w-full">
      <select
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
          border-slate-200
          bg-white
          text-slate-700
          font-medium
          shadow-sm
          transition-all
          hover:border-slate-300
          hover:shadow-md
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/30
          focus:border-blue-500
        "
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      <TiArrowSortedDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
    </div>
  );
}

export default Select;
