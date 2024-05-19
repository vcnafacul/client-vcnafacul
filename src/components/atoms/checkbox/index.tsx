import { UseFormSetValue } from "react-hook-form";
import { ReactComponent as CheckedIcon } from "../../../assets/icons/checked.svg";

export interface CheckboxProps {
  name: string;
  title: string;
  checked?: boolean | undefined;
  disabled: boolean;
}

interface Props extends CheckboxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
}

export function Checkbox({ name, title, checked, setValue, disabled }: Props) {
  return (
    <div
      className="flex gap-3 my-1"
      onClick={
        disabled
          ? () => {}
          : () => {
              setValue(name, !checked);
            }
      }
    >
      <div className="border-2 border-solid w-4 h-4 flex justify-center items-center">
        {checked ? <CheckedIcon /> : <></>}
      </div>
      <label htmlFor={name}>{title}</label>
    </div>
  );
}
