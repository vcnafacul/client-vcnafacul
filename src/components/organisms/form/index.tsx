import { ComponentProps } from "react"
import FormField, { FormFieldInput } from "../../molecules/formField"
import { UseFormRegister } from "react-hook-form";

export type FormProps = ComponentProps<'div'> & {
    formFields: FormFieldInput[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
}

function Form({ formFields, register, ...props } : FormProps){
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
                     />
                )}
        </div>
   )
}

export default Form