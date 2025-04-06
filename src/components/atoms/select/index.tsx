import { ComponentProps, useState } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { OptionProps } from "../selectOption";
import "./styles.css";

export type SelectProps = ComponentProps<"select"> & {
  options: OptionProps[];
  defaultValue?: number | string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setState: (value: any) => void;
};

function Select({ options, disabled, defaultValue, setState }: SelectProps) {
  const [selected, setSelected] = useState<number | string>(
    defaultValue as string | number
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (id: any) => {
    setSelected(id);
    setState(id);
  };
  return (
    <>
      <div className="relative group w-52 md:w-60">
        <TiArrowSortedDown className="absolute select-none right-1 top-0 w-10 h-10 fill-marine" />
        <select
          className="remove-arrow text-center w-full h-full text-lg font-black text-marine pl-4 pr-10 py-1 rounded-xl shadow-md z-50"
          disabled={disabled ?? false}
          value={selected}
          defaultValue={selected}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            handleSelect(e.target.value);
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

export default Select;
