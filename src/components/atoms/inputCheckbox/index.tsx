import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { CheckboxProps } from "../checkbox";

export interface InputCheckBoxProps {
  checkboxs: string[];
  onCheckedChange: (value: string[]) => void;
}

export function InputCheckBox({
  checkboxs,
  onCheckedChange,
  ...props
}: InputCheckBoxProps) {
  const [checked, setChecked] = useState<string[]>([]);

  return (
    <div className="pt-8 flex flex-col gap-2">
      {checkboxs.map((value, key) => (
        <div className="flex gap-2" key={key}>
          <Checkbox
            className="h-5 w-5 border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
            {...(props as CheckboxProps)}
            id={value}
            onCheckedChange={(ischeck) => {
              if (ischeck) {
                const newChecked = [...checked, value];
                setChecked(newChecked);
                onCheckedChange(newChecked);
              } else {
                const newChecked = checked.filter((item) => item !== value);
                setChecked(newChecked);
                onCheckedChange(newChecked);
              }
            }}
          />
          <div>
            <label
              className="text-sm text-grey peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none"
              htmlFor={value}
            >
              {value}
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
