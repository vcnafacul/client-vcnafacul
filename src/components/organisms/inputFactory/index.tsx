/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InputCheckBox,
  InputCheckBoxProps,
} from "@/components/atoms/inputCheckbox";
import { InputSelect, InputSelectProps } from "@/components/atoms/inputSelect";
import { InputText } from "@/components/atoms/inputText";
import {
  BaseLayoutInput,
  BaseLayoutInputPros,
} from "@/components/templates/baseLayoutInput";
import { InputProps } from "@/components/ui/input";
import { CheckboxProps } from "@radix-ui/react-checkbox";
import { DropdownProps } from "primereact/dropdown";

export type InputFactoryType =
  | "text"
  | "email"
  | "password"
  | "checkbox"
  | "select"
  | "date"
  | "textarea"
  | "number";

type InputFactoryProps = (
  | InputCheckBoxProps
  | InputProps
  | InputSelectProps
) & {
  type: InputFactoryType;
} & BaseLayoutInputPros;
export function InputFactory({
  label,
  type,
  error,
  isCheckbox = false,
  ...props
}: InputFactoryProps & { isCheckBOX?: boolean }) {
  let inputElement;
  switch (type) {
    case "select":
      inputElement = (
        <div
          className={`card flex justify-content-center h-16 pt-8 pl-2 border border-input rounded-md 
      text-xs shadow-sm disabled:opacity-50 ${
        (props as DropdownProps).className
      }`}
        >
          <InputSelect {...(props as DropdownProps)} />
        </div>
      );
      break;
    case "checkbox":
      inputElement = (
        <InputCheckBox
          {...(props as CheckboxProps)}
          checkboxs={(props as InputCheckBoxProps).checkboxs}
          onCheckedChange={(props as InputCheckBoxProps).onCheckedChange}
          propCleanRest={(props as InputCheckBoxProps).propCleanRest}
          defaultValue={(props as InputCheckBoxProps).defaultValue}
        />
      );
      break;
    case "textarea":
      inputElement = (
        <div className="border p-2 w-full focus-within:border-orange rounded-md">
          <textarea
            className={`mt-4 w-full outline-none rounded-md overflow-y-auto
    scrollbar-hide resize-none ${(props as any).className}`}
            rows={(props as any).rows || 10}
            {...(props as any)}
          />
        </div>
      );
      break;
    default:
      inputElement = <InputText type={type} {...(props as InputProps)} />;
      break;
  }
  return (
    <BaseLayoutInput
      id={props.id}
      label={label}
      error={error}
      isCheckbox={isCheckbox}
    >
      {inputElement}
    </BaseLayoutInput>
  );
}
