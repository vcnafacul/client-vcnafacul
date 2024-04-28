import { LegacyRef, useState } from "react";
import Input from "../../atoms/input";
import LabelInput from "../../atoms/labelInput/input";

import { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { AiFillEyeInvisible } from "react-icons/ai";
import { IoMdEye } from "react-icons/io";

export interface FormFieldOption {
  value: string | number | readonly string[] | undefined;
  label: string;
}

export interface FormFieldInput {
  id: string;
  label: string;
  type?:
    | "text"
    | "password"
    | "number"
    | "option"
    | "textarea"
    | "date"
    | "email";
  visibility?: boolean;
  disabled?: boolean;
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string | number | readonly string[] | undefined;
  options?: FormFieldOption[];
  className?: string;
}

export interface FormFieldProps<TFieldValues extends FieldValues>
  extends FormFieldInput {
  register: UseFormRegister<TFieldValues>;
  ref?: LegacyRef<HTMLInputElement>;
  error?: FieldError;
}

function FormField<T extends FieldValues>({
  id,
  label,
  type = "text",
  visibility = false,
  value,
  defaultValue,
  disabled,
  options,
  className,
  register,
  ref,
  error,
}: FormFieldProps<T>) {
  const [visible, setVisible] = useState<boolean>(visibility);

  function backgroundImageToggleVisibility(visible: boolean) {
    return visible ? (
      <AiFillEyeInvisible
        onClick={() => setVisible(!visible)}
        className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer fill-grey"
      />
    ) : (
      <IoMdEye
        onClick={() => setVisible(!visible)}
        className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer fill-grey"
      />
    );
  }

  const commonProps = {
    name: id,
    disabled: disabled ?? false,
    type: visible ? "text" : type,
    options: options,
    value,
    defaultValue,
  };

  return (
    <div
      className={`${className} flex flex-col w-full relative justify-center items-center`}
    >
      <Input
        ref={ref}
        register={register as UseFormRegister<FieldValues>}
        {...commonProps}
      />
      <LabelInput label={label} />
      {type !== "password" ? <></> : backgroundImageToggleVisibility(visible)}
      {error && (
        <span className="w-full mt-1 text-red" role="alert">
          {error.message}
        </span>
      )}
    </div>
  );
}

export default FormField;
