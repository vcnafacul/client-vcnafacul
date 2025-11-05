import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { CheckboxProps } from "../checkbox";

export interface InputCheckBoxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkboxs: any[];
  onCheckedChange: (value: string[]) => void;
  propCleanRest?: string;
  defaultValue?: string[];
}

export function InputCheckBox({
  checkboxs,
  onCheckedChange,
  propCleanRest,
  ...props
}: InputCheckBoxProps) {
  const [checked, setChecked] = useState<string[]>(props.defaultValue || []);

  // Função para verificar se o valor contém alguma das strings de limpeza
  const isCleanRestOption = (value: string): boolean => {
    if (!propCleanRest) return false;
    const cleanRestPatterns = ["Não possuo", "Não pertenço"];
    return cleanRestPatterns.some((pattern) =>
      value.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Verifica se algum item marcado é uma opção de limpeza
  const hasCleanRestChecked = (): boolean => {
    return checked.some((item) => isCleanRestOption(item));
  };

  const onChecked = (value: string) => {
    if (propCleanRest) {
      if (isCleanRestOption(value)) {
        return checked.includes(value);
      } else {
        if (!hasCleanRestChecked()) {
          return checked.includes(value);
        }
        return false;
      }
    }
    return checked.includes(value);
  };

  const onDisabled = (value: string) => {
    if (propCleanRest) {
      if (hasCleanRestChecked()) {
        if (isCleanRestOption(value)) {
          return false;
        } else return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-2">
      {checkboxs.map((value, key) => (
        <div className="flex gap-2" key={key}>
          <Checkbox
            className="h-5 w-5 border-grey border-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-white data-[state=checked]:text-green2"
            {...(props as CheckboxProps)}
            id={value}
            checked={onChecked(value)}
            disabled={onDisabled(value)}
            onCheckedChange={(ischeck) => {
              if (ischeck) {
                if (isCleanRestOption(value)) {
                  setChecked([value]);
                  onCheckedChange([value]);
                } else {
                  const newChecked = [...checked, value];
                  setChecked(newChecked);
                  onCheckedChange(newChecked);
                }
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
