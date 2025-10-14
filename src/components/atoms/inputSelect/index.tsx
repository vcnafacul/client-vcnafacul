/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { useEffect, useState } from "react";
import "./style.css";

export interface InputSelectProps extends DropdownProps {
  className?: string;
}

export function InputSelect({ value, onChange, ...props }: InputSelectProps) {
  const [internalValue, setInternalValue] = useState<any>(
    value || props.defaultValue
  );

  // Sincronizar com o valor externo quando mudar
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleOnChange = (e: any) => {
    setInternalValue(e.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <Dropdown
      {...props}
      optionLabel="label"
      optionValue="value"
      value={internalValue}
      onChange={handleOnChange}
      className="w-full flex ring-0 items-center 
      bg-transparent dropdown-text-small"
    />
  );
}
