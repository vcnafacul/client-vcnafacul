/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { useState } from "react";
import "./style.css";

export interface InputSelectProps extends DropdownProps {
  className?: string;
}

export function InputSelect({ ...props }: InputSelectProps) {
  const [value, setValue] = useState<any>(props.defaultValue);

  const handleOnChange = (e: any) => {
    props.onChange!(e);
    setValue(e.value);
  };

  return (
    <Dropdown
      {...props}
      optionLabel="label"
      optionValue="value"
      value={value}
      defaultValue={value}
      onChange={handleOnChange}
      className="w-full flex ring-0 items-center 
      bg-transparent dropdown-text-small custom-dropdown"
    />
  );
}
