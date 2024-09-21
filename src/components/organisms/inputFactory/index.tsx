import { Checkbox } from "@/components/ui/checkbox";
import { Input, InputProps } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckboxProps } from "@radix-ui/react-checkbox";
import { SelectProps } from "@radix-ui/react-select";
import { useState } from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

interface BaseLayoutInputPros {
  id: string;
  label: string;
  error?:
    | Merge<
        FieldError,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined)[]
      >
    | undefined;
}

interface InputCheckBoxProps {
  checkboxs: string[];
  onCheckedChange: (value: string[]) => void;
}

interface InputSelectProps extends SelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { label: any; value: any }[];
  className?: string;
}

type InputFactoryProps = (
  | InputCheckBoxProps
  | InputProps
  | InputSelectProps
) & {
  type: "text" | "email" | "password" | "checkbox" | "select" | "date";
} & BaseLayoutInputPros;
export function InputFactory({
  label,
  type,
  error,
  ...props
}: InputFactoryProps) {
  let inputElement;
  switch (type) {
    case "select":
      inputElement = (
        <InputSelect
          {...(props as SelectProps)}
          options={(props as InputSelectProps).options}
        />
      );
      break;
    case "checkbox":
      inputElement = (
        <InputCheckBox
          {...(props as CheckboxProps)}
          checkboxs={(props as InputCheckBoxProps).checkboxs}
          onCheckedChange={(props as InputCheckBoxProps).onCheckedChange}
        />
      );
      break;
    default:
      inputElement = <InputText type={type} {...(props as InputProps)} />;
      break;
  }
  return (
    <BaseLayoutInput id={props.id} label={label} error={error}>
      {inputElement}
    </BaseLayoutInput>
  );
}

function BaseLayoutInput({
  id,
  label,
  error,
  children,
}: BaseLayoutInputPros & { children: React.ReactNode }) {
  const errorMessage =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error?.message as any)?.message || error?.message || undefined;
  return (
    <div className="relative mb-4">
      <label
        className="absolute top-1 left-3 text-xs text-grey font-semibold"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
      {error && (
        <span className="absolute text-xs text-red">{errorMessage}</span>
      )}
    </div>
  );
}

function InputText({ ...props }: InputProps) {
  return (
    <Input
      {...props}
      className={`h-16 pt-4 focus-visible:ring-orange ${props.className}`}
      id={props.id}
      autoComplete="on"
    />
  );
}

function InputSelect({ options, ...props }: InputSelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger className={`h-16 pt-4 items-end ${props.className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function InputCheckBox({
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
