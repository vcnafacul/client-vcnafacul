/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps } from "react"
import FormField, { FormFieldInput } from "../../molecules/formField"
import { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";

export type FormProps = ComponentProps<'div'> & {
    formFields: FormFieldInput[];
    register: UseFormRegister<any>;
    errors?: FieldErrors;
    /** Tamanho de todos os campos; `small` no celular. */
    size?: "base" | "small";
}

function Form({ formFields, register, errors, size, ...props } : FormProps){
   return (
        <div {...props}>
            {formFields.map(fData => 
                    <FormField 
                    id={fData.id} 
                    key={fData.id} 
                    label={fData.label} 
                    value={fData.value} 
                    defaultValue={fData.defaultValue}
                    type={fData.type} 
                    visibility={fData.visibility} 
                    disabled={fData.disabled}
                    options={fData.options}
                    register={register}
                    className={fData.className}
                    size={fData.size ?? size}
                    error={errors && errors[fData.id] ? errors[fData.id] as FieldError : undefined}
                    />
                )}
        </div>
   )
}

export default Form