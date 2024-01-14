/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps } from "react"
import FormField, { FormFieldInput } from "../../molecules/formField"
import { FieldErrors, UseFormRegister } from "react-hook-form";

export type FormProps = ComponentProps<'div'> & {
    formFields: FormFieldInput[];
    register: UseFormRegister<any>;
    errors?: FieldErrors;
}

function Form({ formFields, register, errors, ...props } : FormProps){
   return (
        <div {...props}>
            {formFields.map(fData => 
                <FormField 
                    id={fData.id} 
                    key={fData.id} 
                    label={fData.label} 
                    value={fData.value} 
                    type={fData.type} 
                    visibility={fData.visibility} 
                    disabled={fData.disabled}
                    options={fData.options}
                    register={register}
                    className={fData.className}
                    validation={fData.validation}
                    error={errors && errors[fData.id] ? errors[fData.id] : null}
                    />
                )}
        </div>
   )
}

export default Form