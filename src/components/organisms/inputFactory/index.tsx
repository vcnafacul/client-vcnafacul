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
import { SelectProps } from "@radix-ui/react-select";

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
