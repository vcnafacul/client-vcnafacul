/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps } from "react"
import { CampoDoFormulario } from "@/components/formulario/campo-do-formulario"
import type { FormFieldInput } from "@/components/formulario/tipos"
import { FormLegend } from "@/components/ui/field"
import { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";

export type FormProps = ComponentProps<'div'> & {
    formFields: FormFieldInput[];
    register: UseFormRegister<any>;
    errors?: FieldErrors;
}

function Form({ formFields, register, errors, ...props } : FormProps){
   return (
        <div {...props}>
            {formFields.some((f) => f.required) && <FormLegend />}
            {formFields.map(fData =>
                    <CampoDoFormulario
                    id={fData.id}
                    key={fData.id}
                    label={fData.label}
                    value={fData.value}
                    defaultValue={fData.defaultValue}
                    type={fData.type}
                    visibility={fData.visibility}
                    disabled={fData.disabled}
                    required={fData.required}
                    options={fData.options}
                    register={register}
                    className={fData.className}
                    error={errors && errors[fData.id] ? errors[fData.id] as FieldError : undefined}
                    />
                )}
        </div>
   )
}

export default Form
