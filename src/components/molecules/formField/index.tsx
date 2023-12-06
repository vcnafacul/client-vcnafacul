/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Input from "../../atoms/input"
import LabelInput from "../../atoms/labelInput/input"

import { AiFillEyeInvisible } from "react-icons/ai";
import { IoMdEye } from "react-icons/io";
import { UseFormRegister, FieldValues } from "react-hook-form";

export interface FormFieldOption {
    value: any;
    label: string;
}

export interface FormFieldInput {
    id: string;
    label: string;
    type?: "text" | "password" | "number" | "option" | "textarea";
    visibility?: boolean;
    disabled?: boolean;
    value?: any;
    options?: FormFieldOption[];
}

export interface FormFieldProps  extends FormFieldInput {
    // handleOnChange: (event: React.InputHTMLAttributes<HTMLInputElement>) => void;
    register: UseFormRegister<FieldValues>;
}

function FormField({id, label, type = "text", visibility = false, value, disabled, options, register} : FormFieldProps){
    const [visible, setVisible] = useState<boolean>(visibility)

    function backgroundImageToggleVisibility(visible: boolean){
        return visible 
            ? <AiFillEyeInvisible onClick={() => setVisible(!visible)} className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer fill-grey"/>
            : <IoMdEye onClick={() => setVisible(!visible)} className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer fill-grey"/>
    }

    const commonProps = {
        name: id,
        disabled: disabled ?? false,
        value:value,
        type: visible ? "text" : type,
        options: options,
        defaultValue: value
      };

    return (
        <div className="flex flex-col w-full relative justify-center items-center">
            <LabelInput label={label} />
            <Input register={register} {...commonProps} />
            {type !== "password" ? 
                <></> : 
                backgroundImageToggleVisibility(visible)}
        </div>
    )
}

export default FormField