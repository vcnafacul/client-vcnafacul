import { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import "./styles.css";

export interface OptionProps {
  id: number | string;
  name: string;
}

type SelectProps = ComponentProps<"select"> & {
  options: OptionProps[];
  defaultValue?: OptionProps;
  disabled?: boolean;
  setState: (value: OptionProps) => void;
};

export function SelectOption({
  options,
  disabled,
  defaultValue,
  setState,
}: SelectProps) {
  return (
    <>
      <div className="relative group">
        <ChevronDown className="absolute select-none right-1 top-0 w-10 h-10 text-primary" />
        <select
          className="remove-arrow w-full h-full text-h3 font-extrabold text-foreground pl-4 pr-10 py-1 rounded-xl shadow-md z-popover"
          disabled={disabled ?? false}
          defaultValue={defaultValue?.id}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setState(options.find((item) => item.id === e.target.value)!);
          }}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
