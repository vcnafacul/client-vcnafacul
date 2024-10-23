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
  type:
    | "text"
    | "email"
    | "password"
    | "checkbox"
    | "select"
    | "date"
    | "textarea"
    | "number";
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
    case "textarea":
      inputElement = (
        <div className=" border p-2 w-full outline-orange rounded-md">
          <textarea
            className="mt-4 w-full outline-orange rounded-md overflow-y-auto 
        scrollbar-hide"
            rows={10}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <BaseLayoutInput id={props.id} label={label} error={error}>
      {inputElement}
    </BaseLayoutInput>
  );
}
